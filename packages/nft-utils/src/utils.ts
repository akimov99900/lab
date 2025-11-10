/**
 * Utility functions for deterministic generation
 */

/**
 * Creates a deterministic seed from fid and optional string
 */
export function createSeed(fid: number, additional?: string): string {
  return `${fid}${additional !== undefined && additional !== '' ? `-${additional}` : ''}`;
}

/**
 * Simple hash function for deterministic variations
 */
export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Generates deterministic variation based on seed
 */
export function getVariation(seed: string, maxVariations: number = 10): number {
  return hashString(seed) % maxVariations;
}