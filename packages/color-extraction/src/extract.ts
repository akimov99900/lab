import { Vibrant } from 'node-vibrant/node';
import type { ColorPair, ImageInput, ExtractionOptions, CacheEntry } from './types';
import { DEFAULT_FALLBACK_COLORS, getFallbackColors, generateDeterministicFallbacks } from './fallbacks';
import type { Palette, Swatch } from '@vibrant/color';

/**
 * Simple in-memory cache for extracted colors
 */
class ColorCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  get(key: string): ColorPair | null {
    const entry = this.cache.get(key);
    if (entry) {
      // Update timestamp for LRU
      entry.timestamp = Date.now();
      return entry.colors;
    }
    return null;
  }

  set(key: string, colors: ColorPair): void {
    // Remove oldest entry if cache is full
    if (this.cache.size >= this.maxSize) {
      let oldestKey = '';
      let oldestTime = Date.now();
      
      for (const [k, entry] of this.cache.entries()) {
        if (entry.timestamp < oldestTime) {
          oldestTime = entry.timestamp;
          oldestKey = k;
        }
      }
      
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
    
    this.cache.set(key, {
      colors,
      timestamp: Date.now(),
    });
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Global cache instance
const globalCache = new ColorCache();

/**
 * Generate cache key from input
 */
function generateCacheKey(input: ImageInput): string {
  if (typeof input === 'string') {
    return `url:${input}`;
  } else if (input instanceof ArrayBuffer) {
    return `buffer:${new Uint8Array(input).slice(0, 32).toString()}`;
  } else {
    return `bytes:${input.slice(0, 32).toString()}`;
  }
}

/**
 * Convert RGB values to hex color
 */
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Parse hex color from vibrant swatch
 */
function parseHexColor(swatch: Swatch | null): string | null {
  if (!swatch || !swatch.hex) {
    return null;
  }
  
  const hex = swatch.hex;
  // Ensure it's a valid hex color
  if (hex.startsWith('#') && /^[#0-9A-Fa-f]{6}$/.test(hex)) {
    return hex.toUpperCase();
  }
  
  return null;
}

/**
 * Extract 2 most distinct colors from vibrant palette
 */
function extractColorPair(palette: Palette): ColorPair | null {
  const colors: string[] = [];
  
  // Collect all available colors in order of preference
  const colorOrder = [
    palette.Vibrant,
    palette.LightVibrant,
    palette.DarkVibrant,
    palette.Muted,
    palette.LightMuted,
    palette.DarkMuted,
  ];
  
  for (const swatch of colorOrder) {
    const hex = parseHexColor(swatch);
    if (hex) {
      colors.push(hex);
    }
  }
  
  if (colors.length === 0) {
    return null;
  }
  
  if (colors.length === 1) {
    // Generate a complementary color if only one color found
    const primary = colors[0];
    const secondary = generateComplementaryColor(primary);
    return { primary, secondary };
  }
  
  // Select the two most distinct colors
  let primary = colors[0];
  let secondary = colors[1];
  
  // If we have more colors, find the most distinct pair
  if (colors.length > 2) {
    let maxDistance = 0;
    
    for (let i = 0; i < colors.length; i++) {
      for (let j = i + 1; j < colors.length; j++) {
        const distance = calculateColorDistance(colors[i], colors[j]);
        if (distance > maxDistance) {
          maxDistance = distance;
          primary = colors[i];
          secondary = colors[j];
        }
      }
    }
  }
  
  return { primary, secondary };
}

/**
 * Calculate color distance (simple RGB distance)
 */
function calculateColorDistance(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) {
    return 0;
  }
  
  const dr = rgb1.r - rgb2.r;
  const dg = rgb1.g - rgb2.g;
  const db = rgb1.b - rgb2.b;
  
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Generate a complementary color
 */
function generateComplementaryColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) {
    return '#FFFFFF';
  }
  
  // Simple complementary: invert and average with white
  const r = Math.round((255 - rgb.r + 255) / 2);
  const g = Math.round((255 - rgb.g + 255) / 2);
  const b = Math.round((255 - rgb.b + 255) / 2);
  
  return rgbToHex(r, g, b);
}

/**
 * Fetch image from URL
 */
async function fetchImage(url: string): Promise<ArrayBuffer> {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.arrayBuffer();
  } catch (error) {
    if (error instanceof Error && error.message.includes('Failed to fetch')) {
      throw new Error('CORS_ERROR');
    }
    throw error;
  }
}

/**
 * Extract dominant colors from an image
 */
export async function extractDominantColors(
  input: ImageInput,
  options: ExtractionOptions = {}
): Promise<ColorPair> {
  const {
    enableCache = true,
    maxCacheSize = 100,
    fallbackColors = DEFAULT_FALLBACK_COLORS,
  } = options;

  // Update cache size if needed
  if (maxCacheSize !== globalCache.size()) {
    // Note: In a real implementation, we'd recreate the cache with new size
    // For simplicity, we'll just use the existing cache
  }

  // Check cache first
  const cacheKey = generateCacheKey(input);
  if (enableCache) {
    const cached = globalCache.get(cacheKey);
    if (cached) {
      return cached;
    }
  }

  try {
    let imageBuffer: Buffer;

    if (typeof input === 'string') {
      // Fetch image from URL
      const arrayBuffer = await fetchImage(input);
      imageBuffer = Buffer.from(arrayBuffer);
    } else if (input instanceof ArrayBuffer) {
      imageBuffer = Buffer.from(input);
    } else {
      // Convert Uint8Array to Buffer
      imageBuffer = Buffer.from(input);
    }

    // Use Vibrant to extract colors
    const vibrant = new Vibrant(imageBuffer);
    const palette = await vibrant.getPalette();

    console.log('Extracted palette:', palette);

    // Extract color pair from palette
    const colors = extractColorPair(palette);

    console.log('extractColorPair result:', colors);

    if (!colors) {
      // Use fallback if extraction failed
      console.log('Using fallback colors');
      const fallback = fallbackColors || DEFAULT_FALLBACK_COLORS;
      if (enableCache) {
        globalCache.set(cacheKey, fallback);
      }
      return fallback;
    }

    // Cache the result
    if (enableCache) {
      globalCache.set(cacheKey, colors);
    }

    return colors;
  } catch (error) {
    // Handle different error types with appropriate fallbacks
    let fallback = fallbackColors || DEFAULT_FALLBACK_COLORS;
    
    if (error instanceof Error) {
      if (error.message === 'CORS_ERROR') {
        fallback = getFallbackColors('CORS_ERROR');
      } else if (error.message.includes('HTTP')) {
        fallback = getFallbackColors('NETWORK_ERROR');
      } else if (error.message.includes('Invalid') || error.message.includes('format')) {
        fallback = getFallbackColors('INVALID_IMAGE');
      }
    }

    // Generate deterministic fallback based on input if possible
    if (typeof input === 'string') {
      fallback = generateDeterministicFallbacks(input);
    }

    if (enableCache) {
      globalCache.set(cacheKey, fallback);
    }

    return fallback;
  }
}

/**
 * Clear the color extraction cache
 */
export function clearCache(): void {
  globalCache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; maxSize: number } {
  return {
    size: globalCache.size(),
    maxSize: 100, // This should match the default maxCacheSize
  };
}