import { describe, it, expect, vi } from 'vitest';
import {
  extractColors,
  extractColorsFromUrl,
  extractColorsFromBuffer,
  getDefaultColors,
  normalizeImageInput,
} from './index';

describe('Color Extraction', () => {
  describe('getDefaultColors', () => {
    it('should return default colors when no fallback provided', () => {
      const colors = getDefaultColors();
      expect(colors.primary).toBe('#6B7280');
      expect(colors.secondary).toBe('#D1D5DB');
    });

    it('should return custom fallback colors', () => {
      const colors = getDefaultColors('#FF0000', '#00FF00');
      expect(colors.primary).toBe('#FF0000');
      expect(colors.secondary).toBe('#00FF00');
    });
  });

  describe('normalizeImageInput', () => {
    it('should return buffer when provided', () => {
      const buffer = new ArrayBuffer(8);
      const result = normalizeImageInput({ buffer });
      expect(result).toBe(buffer);
    });

    it('should return null when no buffer provided', () => {
      const result = normalizeImageInput({ url: 'http://example.com/image.png' });
      expect(result).toBeNull();
    });

    it('should return null for empty options', () => {
      const result = normalizeImageInput({});
      expect(result).toBeNull();
    });
  });

  describe('extractColors', () => {
    it('should return default colors when no URL or buffer provided', async () => {
      const colors = await extractColors({});
      expect(colors).toEqual({
        primary: '#6B7280',
        secondary: '#D1D5DB',
      });
    });

    it('should return default colors when buffer extraction fails', async () => {
      const invalidBuffer = new ArrayBuffer(0);
      const colors = await extractColors({ buffer: invalidBuffer });
      expect(colors).toEqual({
        primary: '#6B7280',
        secondary: '#D1D5DB',
      });
    });

    it('should return custom fallback colors on failure', async () => {
      const colors = await extractColors({
        fallbackPrimary: '#123456',
        fallbackSecondary: '#ABCDEF',
      });
      expect(colors).toEqual({
        primary: '#123456',
        secondary: '#ABCDEF',
      });
    });

    it('should handle URL fetch failure gracefully', async () => {
      vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('Network error'))));
      const colors = await extractColors({
        url: 'http://invalid-url.example.com/image.png',
      });
      expect(colors).toEqual({
        primary: '#6B7280',
        secondary: '#D1D5DB',
      });
      vi.unstubAllGlobals();
    });
  });

  describe('extractColorsFromUrl', () => {
    it('should return default colors when URL is invalid', async () => {
      vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('Network error'))));
      const colors = await extractColorsFromUrl('http://invalid-url.example.com/image.png');
      expect(colors).toEqual({
        primary: '#6B7280',
        secondary: '#D1D5DB',
      });
      vi.unstubAllGlobals();
    });

    it('should accept custom fallback colors', async () => {
      vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('Network error'))));
      const colors = await extractColorsFromUrl(
        'http://example.com/image.png',
        '#AAAAAA',
        '#BBBBBB'
      );
      expect(colors).toEqual({
        primary: '#AAAAAA',
        secondary: '#BBBBBB',
      });
      vi.unstubAllGlobals();
    });
  });

  describe('extractColorsFromBuffer', () => {
    it('should return default colors for invalid buffer', async () => {
      const buffer = new ArrayBuffer(0);
      const colors = await extractColorsFromBuffer(buffer);
      expect(colors).toEqual({
        primary: '#6B7280',
        secondary: '#D1D5DB',
      });
    });

    it('should accept custom fallback colors', async () => {
      const buffer = new ArrayBuffer(0);
      const colors = await extractColorsFromBuffer(
        buffer,
        '#111111',
        '#222222'
      );
      expect(colors).toEqual({
        primary: '#111111',
        secondary: '#222222',
      });
    });
  });

  describe('Color format validation', () => {
    it('should return colors in valid hex format', async () => {
      const colors = await extractColors({});
      const hexRegex = /^#[0-9A-F]{6}$/i;
      expect(hexRegex.test(colors.primary)).toBe(true);
      expect(hexRegex.test(colors.secondary)).toBe(true);
    });
  });

  describe('Browser/Node compatibility', () => {
    it('should work in Node.js environment', async () => {
      const colors = await extractColors({});
      expect(colors).toBeDefined();
      expect(colors.primary).toBeDefined();
      expect(colors.secondary).toBeDefined();
    });

    it('should handle ArrayBuffer in Node.js', async () => {
      const buffer = new ArrayBuffer(8);
      const result = normalizeImageInput({ buffer });
      expect(result).toBe(buffer);
      expect(result instanceof ArrayBuffer).toBe(true);
    });
  });
});
