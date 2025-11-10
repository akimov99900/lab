import type { ColorPair } from './types';

/**
 * Default fallback colors when extraction fails
 */
export const DEFAULT_FALLBACK_COLORS: ColorPair = {
  primary: '#4A90E2',   // Blue
  secondary: '#F5A623', // Orange
};

/**
 * Fallback colors for specific error scenarios
 */
export const ERROR_FALLBACKS = {
  NETWORK_ERROR: {
    primary: '#E74C3C',   // Red
    secondary: '#3498DB', // Blue
  },
  INVALID_IMAGE: {
    primary: '#95A5A6',   // Gray
    secondary: '#2C3E50', // Dark Gray
  },
  CORS_ERROR: {
    primary: '#9B59B6',   // Purple
    secondary: '#1ABC9C', // Turquoise
  },
} as const;

/**
 * Get fallback colors based on error type
 */
export function getFallbackColors(errorType: keyof typeof ERROR_FALLBACKS | 'default'): ColorPair {
  if (errorType === 'default') {
    return DEFAULT_FALLBACK_COLORS;
  }
  return ERROR_FALLBACKS[errorType];
}

/**
 * Generate deterministic fallback colors from a seed
 */
export function generateDeterministicFallbacks(seed: string): ColorPair {
  // Simple hash function to generate consistent colors
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Generate hue values from hash
  const hue1 = Math.abs(hash) % 360;
  const hue2 = (hue1 + 120) % 360; // Complementary color

  // Convert HSL to hex (simplified)
  const hslToHex = (h: number, s: number = 70, l: number = 50): string => {
    const c = (1 - Math.abs(2 * l / 100 - 1)) * s / 100;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l / 100 - c / 2;
    
    let r = 0, g = 0, b = 0;
    
    if (h >= 0 && h < 60) {
      r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
      r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
      r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
      r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
      r = x; g = 0; b = c;
    } else {
      r = c; g = 0; b = x;
    }
    
    const toHex = (n: number) => {
      const hex = Math.round((n + m) * 255).toString(16).toUpperCase();
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  return {
    primary: hslToHex(hue1),
    secondary: hslToHex(hue2),
  };
}