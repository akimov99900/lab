import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { extractDominantColors, clearCache, getCacheStats } from '../src/extract';
import { DEFAULT_FALLBACK_COLORS, generateDeterministicFallbacks } from '../src/fallbacks';
import type { ColorPair } from '../src/types';

// Mock fetch for testing
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock Vibrant
vi.mock('node-vibrant/node', () => {
  // Create mock Swatch class
  class MockSwatch {
    constructor(public hex: string) {}
  }

  return {
    Vibrant: class MockVibrant {
      constructor(private imageData: Buffer) {}
      
      async getPalette() {
        // Simulate different scenarios based on input
        const data = new Uint8Array(this.imageData);
        const firstByte = data[0] || 0;
        
        // Debug log
        console.log('MockVibrant.getPalette called, firstByte:', firstByte);
        
        if (firstByte === 0) {
          // Return null palette (extraction failed)
          return {
            Vibrant: null,
            LightVibrant: null,
            DarkVibrant: null,
            Muted: null,
            LightMuted: null,
            DarkMuted: null,
          };
        } else if (firstByte === 1) {
          // Return single color
          console.log('Returning single color palette');
          return {
            Vibrant: new MockSwatch('#FF6B6B'),
            LightVibrant: null,
            DarkVibrant: null,
            Muted: null,
            LightMuted: null,
            DarkMuted: null,
          };
        } else if (firstByte === 2) {
          // Return multiple colors
          console.log('Returning multiple colors palette');
          return {
            Vibrant: new MockSwatch('#FF6B6B'),
            LightVibrant: new MockSwatch('#4ECDC4'),
            DarkVibrant: new MockSwatch('#45B7D1'),
            Muted: new MockSwatch('#96CEB4'),
            LightMuted: null,
            DarkMuted: null,
          };
        } else {
          // Default case with vibrant colors
          console.log('Returning default palette');
          return {
            Vibrant: new MockSwatch('#E74C3C'),
            LightVibrant: new MockSwatch('#3498DB'),
            DarkVibrant: new MockSwatch('#2ECC71'),
            Muted: new MockSwatch('#F39C12'),
            LightMuted: null,
            DarkMuted: null,
          };
        }
      }
    },
  };
});

describe('extractDominantColors', () => {
  beforeEach(() => {
    clearCache();
    vi.clearAllMocks();
  });

  afterEach(() => {
    clearCache();
  });

  describe('successful extraction', () => {
    it('should extract colors from valid image data', async () => {
      // Create mock image data that will return multiple colors
      const imageData = Buffer.alloc(10);
      imageData[0] = 2; // Trigger multiple colors scenario

      const result = await extractDominantColors(imageData);

      expect(result).toHaveProperty('primary');
      expect(result).toHaveProperty('secondary');
      expect(result.primary).toMatch(/^#[0-9A-F]{6}$/);
      expect(result.secondary).toMatch(/^#[0-9A-F]{6}$/);
    });

    it('should extract colors from valid URL', async () => {
      const imageData = Buffer.alloc(10);
      imageData[0] = 2; // Trigger multiple colors scenario

      mockFetch.mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () => Promise.resolve(imageData),
      });

      const result = await extractDominantColors('https://example.com/avatar.jpg');

      expect(result).toHaveProperty('primary');
      expect(result).toHaveProperty('secondary');
      expect(mockFetch).toHaveBeenCalledWith('https://example.com/avatar.jpg');
    });

    it('should generate complementary color when only one color is found', async () => {
      // Create a Buffer with first byte = 1 to trigger single color scenario
      const imageData = Buffer.alloc(10);
      imageData[0] = 1; // Trigger single color scenario

      const result = await extractDominantColors(imageData);

      expect(result).toHaveProperty('primary');
      expect(result).toHaveProperty('secondary');
      // The primary should be the extracted color, not fallback
      expect(result.primary).toBe('#FF6B6B');
      expect(result.secondary).toMatch(/^#[0-9A-F]{6}$/);
      expect(result.secondary).not.toBe(result.primary);
      
      // Debug: log what we actually got
      console.log('Result:', result);
    });
  });

  describe('fallback behavior', () => {
    it('should use default fallback when extraction fails', async () => {
      const imageData = Buffer.alloc(10);
      imageData[0] = 0; // Trigger extraction failure

      const result = await extractDominantColors(imageData);

      expect(result).toEqual(DEFAULT_FALLBACK_COLORS);
    });

    it('should use custom fallback colors when provided', async () => {
      const imageData = Buffer.alloc(10);
      imageData[0] = 0; // Trigger extraction failure

      const customFallback: ColorPair = {
        primary: '#123456',
        secondary: '#654321',
      };

      const result = await extractDominantColors(imageData, {
        fallbackColors: customFallback,
      });

      expect(result).toEqual(customFallback);
    });

    it('should handle network errors with appropriate fallback', async () => {
      mockFetch.mockRejectedValueOnce(new Error('HTTP 404: Not Found'));

      const result = await extractDominantColors('https://example.com/not-found.jpg');

      expect(result).toHaveProperty('primary');
      expect(result).toHaveProperty('secondary');
      expect(result.primary).not.toBe(DEFAULT_FALLBACK_COLORS.primary);
    });

    it('should handle CORS errors with appropriate fallback', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Failed to fetch'));

      const result = await extractDominantColors('https://blocked.com/avatar.jpg');

      expect(result).toHaveProperty('primary');
      expect(result).toHaveProperty('secondary');
      expect(result.primary).not.toBe(DEFAULT_FALLBACK_COLORS.primary);
    });

    it('should generate deterministic fallbacks for URL inputs', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const url1 = 'https://example.com/avatar1.jpg';
      const url2 = 'https://example.com/avatar2.jpg';

      const result1 = await extractDominantColors(url1);
      const result2 = await extractDominantColors(url2);

      expect(result1).toEqual(generateDeterministicFallbacks(url1));
      expect(result2).toEqual(generateDeterministicFallbacks(url2));
      expect(result1).not.toEqual(result2);
    });
  });

  describe('caching', () => {
    it('should cache extraction results by default', async () => {
      const imageData = new ArrayBuffer(10);
      const view = new Uint8Array(imageData);
      view[0] = 2; // Trigger multiple colors scenario

      const result1 = await extractDominantColors(imageData);
      const result2 = await extractDominantColors(imageData);

      expect(result1).toEqual(result2);
      expect(getCacheStats().size).toBe(1);
    });

    it('should respect cache disable option', async () => {
      const imageData = Buffer.alloc(10);
      imageData[0] = 2; // Trigger multiple colors scenario

      const result1 = await extractDominantColors(imageData, { enableCache: false });
      const result2 = await extractDominantColors(imageData, { enableCache: false });

      expect(result1).toEqual(result2);
      expect(getCacheStats().size).toBe(0);
    });

    it('should cache URL-based extractions separately', async () => {
      const imageData = Buffer.alloc(10);
      imageData[0] = 2; // Trigger multiple colors scenario

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          arrayBuffer: () => Promise.resolve(imageData),
        })
        .mockResolvedValueOnce({
          ok: true,
          arrayBuffer: () => Promise.resolve(imageData),
        });

      const result1 = await extractDominantColors('https://example.com/avatar1.jpg');
      const result2 = await extractDominantColors('https://example.com/avatar2.jpg');

      expect(result1).toHaveProperty('primary');
      expect(result2).toHaveProperty('secondary');
      expect(getCacheStats().size).toBe(2);
    });

    it('should clear cache when requested', async () => {
      const imageData = Buffer.alloc(10);
      imageData[0] = 2; // Trigger multiple colors scenario

      await extractDominantColors(imageData);
      expect(getCacheStats().size).toBe(1);

      clearCache();
      expect(getCacheStats().size).toBe(0);
    });
  });

  describe('input types', () => {
    it('should handle ArrayBuffer input', async () => {
      const imageData = Buffer.alloc(10);
      imageData[0] = 2; // Trigger multiple colors scenario

      const result = await extractDominantColors(imageData);

      expect(result).toHaveProperty('primary');
      expect(result).toHaveProperty('secondary');
    });

    it('should handle Uint8Array input', async () => {
      const imageData = new Uint8Array([2, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

      const result = await extractDominantColors(imageData);

      expect(result).toHaveProperty('primary');
      expect(result).toHaveProperty('secondary');
    });

    it('should handle string URL input', async () => {
      const imageData = new ArrayBuffer(10);
      const view = new Uint8Array(imageData);
      view[0] = 2; // Trigger multiple colors scenario

      mockFetch.mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () => Promise.resolve(imageData),
      });

      const result = await extractDominantColors('https://example.com/avatar.jpg');

      expect(result).toHaveProperty('primary');
      expect(result).toHaveProperty('secondary');
    });
  });

  describe('color validation', () => {
    it('should return valid hex colors', async () => {
      const imageData = new ArrayBuffer(10);
      const view = new Uint8Array(imageData);
      view[0] = 2; // Trigger multiple colors scenario

      const result = await extractDominantColors(imageData);

      expect(result.primary).toMatch(/^#[0-9A-F]{6}$/);
      expect(result.secondary).toMatch(/^#[0-9A-F]{6}$/);
    });

    it('should return uppercase hex colors', async () => {
      const imageData = new ArrayBuffer(10);
      const view = new Uint8Array(imageData);
      view[0] = 2; // Trigger multiple colors scenario

      const result = await extractDominantColors(imageData);

      expect(result.primary).toBe(result.primary.toUpperCase());
      expect(result.secondary).toBe(result.secondary.toUpperCase());
    });
  });
});