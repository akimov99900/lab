import type { VibrantPalette, ExtractedColors } from './types';

/**
 * Converts hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

/**
 * Converts RGB to hex color
 */
function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("").toUpperCase();
}

/**
 * Generates a contrasting color using luminance inversion
 */
function generateContrastingColor(hexColor: string): string {
  const rgb = hexToRgb(hexColor);
  
  // Invert each channel for maximum contrast
  const invertedR = 255 - rgb.r;
  const invertedG = 255 - rgb.g;
  const invertedB = 255 - rgb.b;
  
  return rgbToHex(invertedR, invertedG, invertedB);
}

/**
 * Extracts colors from a Vibrant palette
 * When only one color is found, generates a complementary contrasting color
 */
export function extractColors(palette: VibrantPalette): ExtractedColors {
  // Collect all available colors from the palette in a specific order
  const vibrantColors: string[] = [];
  
  if (palette.Vibrant?.hex) vibrantColors.push(palette.Vibrant.hex);
  if (palette.LightVibrant?.hex) vibrantColors.push(palette.LightVibrant.hex);
  if (palette.DarkVibrant?.hex) vibrantColors.push(palette.DarkVibrant.hex);
  if (palette.Muted?.hex) vibrantColors.push(palette.Muted.hex);
  if (palette.LightMuted?.hex) vibrantColors.push(palette.LightMuted.hex);
  if (palette.DarkMuted?.hex) vibrantColors.push(palette.DarkMuted.hex);

  // Normalize colors to ensure they always have # prefix
  const normalizedColors = vibrantColors.map(color => 
    color.startsWith('#') ? color : `#${color}`
  );

  // Check if palette has only 1 color
  if (normalizedColors.length === 1) {
    const singleColor = normalizedColors[0];
    const primary = singleColor;
    // Generate complementary/contrasting color
    const secondary = generateContrastingColor(primary);
    return { primary, secondary };
  }

  // If no colors found, return fallback colors
  if (normalizedColors.length === 0) {
    return { primary: '#4A90E2', secondary: '#F5A623' };
  }

  // Otherwise use first 2 colors normally
  const primary = normalizedColors[0];
  const secondary = normalizedColors.length > 1 ? normalizedColors[1] : generateContrastingColor(primary);
  
  return { primary, secondary };
}