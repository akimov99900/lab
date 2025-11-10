/**
 * @lab/color-extraction
 * 
 * Extract dominant colors from Farcaster user avatars for BearBrick NFT generation.
 * 
 * This package provides utilities to extract 2 independent dominant colors from
 * avatar images, with support for both server and browser environments.
 */

// Main extraction function and utilities
export {
  extractDominantColors,
  clearCache,
  getCacheStats,
} from './extract';

// Types and interfaces
export type {
  ColorPair,
  ExtractionOptions,
  ImageInput,
} from './types';

// Fallback color utilities
export {
  DEFAULT_FALLBACK_COLORS,
  ERROR_FALLBACKS,
  getFallbackColors,
  generateDeterministicFallbacks,
} from './fallbacks';