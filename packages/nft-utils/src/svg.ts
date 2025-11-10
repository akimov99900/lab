import type { BearBrickConfig, BearBrickColors } from './types';
import { createSeed, getVariation } from './utils';

/**
 * Creates a BearBrick SVG with the specified configuration
 */
export function createBearBrickSvg(config: BearBrickConfig): string {
  const {
    colors,
    fid = 0,
    username,
    seed,
    size = 320,
    showUsername = true
  } = config;

  // Create deterministic seed if not provided
  const deterministicSeed = seed || createSeed(fid, username);
  const variation = getVariation(deterministicSeed);

  // Generate SVG dimensions
  const width = size;
  const height = size;

  // BearBrick proportions (classic blocky design)
  const headSize = size * 0.25;
  const bodyHeight = size * 0.35;
  const armWidth = size * 0.08;
  const legWidth = size * 0.12;
  const eyeSize = size * 0.03;

  // Calculate positions
  const headY = size * 0.15;
  const bodyY = headY + headSize;
  const armY = bodyY + size * 0.05;
  const legY = bodyY + bodyHeight;

  // Center positions
  const centerX = size / 2;
  const headX = centerX - headSize / 2;
  const bodyX = centerX - (size * 0.3) / 2;

  // Arms positions
  const leftArmX = bodyX - armWidth - size * 0.02;
  const rightArmX = bodyX + (size * 0.3) + size * 0.02;

  // Legs positions
  const leftLegX = centerX - legWidth - size * 0.02;
  const rightLegX = centerX + size * 0.02;

  // Eye positions
  const eyeY = headY + headSize * 0.3;
  const leftEyeX = centerX - headSize * 0.2;
  const rightEyeX = centerX + headSize * 0.2;

  // Variation-based adjustments
  const patternOffset = (variation * 2) % 10;
  const hasPattern = variation % 3 === 0;
  const rotationAngle = (variation * 15) % 360; // Subtle rotation variation
  const opacity = 0.7 + (variation % 4) * 0.1; // Opacity variation between 0.7-1.0

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="#f8f9fa"/>
  
  <!-- Shadow -->
  <ellipse cx="${centerX}" cy="${height - 10}" rx="${size * 0.25}" ry="8" fill="#00000015" opacity="${opacity}"/>
  
  <!-- BearBrick Group with rotation -->
  <g transform="rotate(${rotationAngle} ${centerX} ${centerX})">
  <!-- Head -->
  <rect x="${headX}" y="${headY}" width="${headSize}" height="${headSize}" rx="${headSize * 0.1}" fill="${colors.primary}"/>
  
  <!-- Body -->
  <rect x="${bodyX}" y="${bodyY}" width="${size * 0.3}" height="${bodyHeight}" rx="${size * 0.05}" fill="${colors.secondary}"/>
  
  <!-- Left Arm -->
  <rect x="${leftArmX}" y="${armY}" width="${armWidth}" height="${bodyHeight * 0.8}" rx="${armWidth * 0.2}" fill="${colors.primary}"/>
  
  <!-- Right Arm -->
  <rect x="${rightArmX}" y="${armY}" width="${armWidth}" height="${bodyHeight * 0.8}" rx="${armWidth * 0.2}" fill="${colors.primary}"/>
  
  <!-- Left Leg -->
  <rect x="${leftLegX}" y="${legY}" width="${legWidth}" height="${size * 0.25}" rx="${legWidth * 0.1}" fill="${colors.secondary}"/>
  
  <!-- Right Leg -->
  <rect x="${rightLegX}" y="${legY}" width="${legWidth}" height="${size * 0.25}" rx="${legWidth * 0.1}" fill="${colors.secondary}"/>
  
  <!-- Eyes -->
  <circle cx="${leftEyeX}" cy="${eyeY}" r="${eyeSize}" fill="#ffffff"/>
  <circle cx="${rightEyeX}" cy="${eyeY}" r="${eyeSize}" fill="#ffffff"/>
  <circle cx="${leftEyeX}" cy="${eyeY}" r="${eyeSize * 0.6}" fill="#000000"/>
  <circle cx="${rightEyeX}" cy="${eyeY}" r="${eyeSize * 0.6}" fill="#000000"/>
  
  ${hasPattern ? `
  <!-- Pattern decoration -->
  <rect x="${headX + patternOffset}" y="${headY + patternOffset}" width="${headSize - patternOffset * 2}" height="2" fill="${colors.secondary}" opacity="0.3"/>
  <rect x="${headX + patternOffset}" y="${headY + headSize - patternOffset - 2}" width="${headSize - patternOffset * 2}" height="2" fill="${colors.secondary}" opacity="0.3"/>
  ` : ''}
  </g>
  
  ${showUsername && username ? `
  <!-- Username text -->
  <text x="${centerX}" y="${height - 20}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#495057">@${username}</text>
  ` : ''}
</svg>`;
}

/**
 * Validates BearBrick configuration
 */
export function validateBearBrickConfig(config: BearBrickConfig): void {
  if (!config.colors) {
    throw new Error('BearBrickConfig.colors is required');
  }
  
  if (!config.colors.primary || !config.colors.secondary) {
    throw new Error('BearBrickConfig.colors must have both primary and secondary colors');
  }
  
  // Validate color format (basic hex color validation)
  const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  if (!colorRegex.test(config.colors.primary)) {
    throw new Error(`Invalid primary color format: ${config.colors.primary}`);
  }
  
  if (!colorRegex.test(config.colors.secondary)) {
    throw new Error(`Invalid secondary color format: ${config.colors.secondary}`);
  }
}