/**
 * Color pair extracted from avatar image
 */
export interface ColorPair {
  primary: string;    // Hex color (e.g., "#FF5733")
  secondary: string;  // Hex color (e.g., "#33FF57")
}

/**
 * Extraction options
 */
export interface ExtractionOptions {
  /** Enable in-memory caching (default: true) */
  enableCache?: boolean;
  /** Maximum cache size (default: 100) */
  maxCacheSize?: number;
  /** Custom fallback colors */
  fallbackColors?: ColorPair;
}

/**
 * Internal cache entry
 */
export interface CacheEntry {
  colors: ColorPair;
  timestamp: number;
}

/**
 * Image data types
 */
export type ImageInput = string | ArrayBuffer | Uint8Array;