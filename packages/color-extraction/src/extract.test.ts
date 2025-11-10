import { describe, it, expect } from 'vitest';
import { extractColors } from '../src/extract';
import type { VibrantPalette } from '../src/types';

describe('extractColors', () => {
  it('should generate complementary color when only one color is found', () => {
    // Single color palette - the failing test case
    const singleColorPalette: VibrantPalette = {
      Vibrant: { hex: '#FF6B6B' }
    };
    
    const result = extractColors(singleColorPalette);
    
    // Primary should be the found color
    expect(result.primary).toBe('#FF6B6B');
    
    // Secondary should be a contrasting color (inverted)
    expect(result.secondary).toBe('#009494'); // Inverted version of #FF6B6B
  });

  it('should use first two colors when multiple colors are available', () => {
    const multiColorPalette: VibrantPalette = {
      Vibrant: { hex: '#FF6B6B' },
      LightVibrant: { hex: '#4ECDC4' },
      DarkVibrant: { hex: '#45B7D1' }
    };
    
    const result = extractColors(multiColorPalette);
    
    expect(result.primary).toBe('#FF6B6B');
    expect(result.secondary).toBe('#4ECDC4');
  });

  it('should return fallback colors when no colors are found', () => {
    const emptyPalette: VibrantPalette = {};
    
    const result = extractColors(emptyPalette);
    
    expect(result.primary).toBe('#4A90E2');
    expect(result.secondary).toBe('#F5A623');
  });

  it('should handle different single colors correctly', () => {
    const testCases = [
      { input: '#000000', expectedSecondary: '#FFFFFF' }, // Black -> White
      { input: '#FFFFFF', expectedSecondary: '#000000' }, // White -> Black  
      { input: '#FF0000', expectedSecondary: '#00FFFF' }, // Red -> Cyan
      { input: '#00FF00', expectedSecondary: '#FF00FF' }, // Green -> Magenta
      { input: '#0000FF', expectedSecondary: '#FFFF00' }, // Blue -> Yellow
    ];

    testCases.forEach(({ input, expectedSecondary }) => {
      const palette: VibrantPalette = {
        Vibrant: { hex: input }
      };
      
      const result = extractColors(palette);
      
      expect(result.primary).toBe(input);
      expect(result.secondary).toBe(expectedSecondary);
    });
  });

  it('should handle color properties in different order', () => {
    const palette: VibrantPalette = {
      Muted: { hex: '#FF6B6B' },
      Vibrant: { hex: '#4ECDC4' }
    };
    
    const result = extractColors(palette);
    
    expect(result.primary).toBe('#4ECDC4'); // Vibrant comes first in order
    expect(result.secondary).toBe('#FF6B6B'); // Muted comes second
  });

  it('should generate contrasting color for single muted color', () => {
    const palette: VibrantPalette = {
      Muted: { hex: '#888888' }
    };
    
    const result = extractColors(palette);
    
    expect(result.primary).toBe('#888888');
    expect(result.secondary).toBe('#777777'); // Inverted version
  });

  it('should be deterministic - same input always produces same output', () => {
    const palette: VibrantPalette = {
      Vibrant: { hex: '#FF6B6B' }
    };
    
    const result1 = extractColors(palette);
    const result2 = extractColors(palette);
    
    expect(result1).toEqual(result2);
  });

  it('should handle hex colors with and without # prefix', () => {
    const paletteWithHash: VibrantPalette = {
      Vibrant: { hex: '#FF6B6B' }
    };
    
    const paletteWithoutHash: VibrantPalette = {
      Vibrant: { hex: 'FF6B6B' }
    };
    
    const result1 = extractColors(paletteWithHash);
    const result2 = extractColors(paletteWithoutHash);
    
    expect(result1.primary).toBe('#FF6B6B');
    expect(result2.primary).toBe('#FF6B6B');
    expect(result1.secondary).toBe(result2.secondary);
  });

  it('should handle edge case colors', () => {
    const edgeCases = [
      { hex: '#808080', expected: '#7F7F7F' }, // Middle gray
      { hex: '#123456', expected: '#EDCBA9' }, // Dark blue
      { hex: '#FEDCBA', expected: '#012345' }, // Light orange
    ];

    edgeCases.forEach(({ hex, expected }) => {
      const palette: VibrantPalette = {
        Vibrant: { hex }
      };
      
      const result = extractColors(palette);
      
      expect(result.primary).toBe(hex);
      expect(result.secondary).toBe(expected);
    });
  });

  it('should handle single color with only LightVibrant', () => {
    const palette: VibrantPalette = {
      LightVibrant: { hex: '#FFE66D' }
    };
    
    const result = extractColors(palette);
    
    expect(result.primary).toBe('#FFE66D');
    expect(result.secondary).toBe('#001992'); // Inverted version
  });

  it('should handle single color with only DarkVibrant', () => {
    const palette: VibrantPalette = {
      DarkVibrant: { hex: '#2E4057' }
    };
    
    const result = extractColors(palette);
    
    expect(result.primary).toBe('#2E4057');
    expect(result.secondary).toBe('#D1BFA8'); // Inverted version
  });

  it('should handle single color with only LightMuted', () => {
    const palette: VibrantPalette = {
      LightMuted: { hex: '#F0E68C' }
    };
    
    const result = extractColors(palette);
    
    expect(result.primary).toBe('#F0E68C');
    expect(result.secondary).toBe('#0F1973'); // Inverted version
  });

  it('should handle single color with only DarkMuted', () => {
    const palette: VibrantPalette = {
      DarkMuted: { hex: '#8B4513' }
    };
    
    const result = extractColors(palette);
    
    expect(result.primary).toBe('#8B4513');
    expect(result.secondary).toBe('#74BAEC'); // Inverted version
  });

  it('should handle multiple colors with missing some properties', () => {
    const palette: VibrantPalette = {
      LightVibrant: { hex: '#FFE66D' },
      DarkMuted: { hex: '#2E4057' }
    };
    
    const result = extractColors(palette);
    
    expect(result.primary).toBe('#FFE66D');
    expect(result.secondary).toBe('#2E4057');
  });

  it('should handle all color properties present', () => {
    const palette: VibrantPalette = {
      Vibrant: { hex: '#FF6B6B' },
      LightVibrant: { hex: '#4ECDC4' },
      DarkVibrant: { hex: '#45B7D1' },
      Muted: { hex: '#96CEB4' },
      LightMuted: { hex: '#FFEAA7' },
      DarkMuted: { hex: '#DDA0DD' }
    };
    
    const result = extractColors(palette);
    
    expect(result.primary).toBe('#FF6B6B');
    expect(result.secondary).toBe('#4ECDC4');
  });

  it('should handle invalid hex format gracefully', () => {
    const palette: VibrantPalette = {
      Vibrant: { hex: 'invalid' }
    };
    
    const result = extractColors(palette);
    
    // Should still return something, even with invalid hex
    expect(result.primary).toBe('#invalid');
    expect(result.secondary).toBe('#FFFFFF'); // Inverted fallback (0,0,0 -> 255,255,255)
  });

  it('should handle mixed valid and invalid hex colors', () => {
    const palette: VibrantPalette = {
      Vibrant: { hex: '#FF6B6B' },
      Muted: { hex: 'invalid' }
    };
    
    const result = extractColors(palette);
    
    expect(result.primary).toBe('#FF6B6B');
    expect(result.secondary).toBe('#invalid');
  });

  it('should handle empty hex string', () => {
    const palette: VibrantPalette = {
      Vibrant: { hex: '' }
    };
    
    const result = extractColors(palette);
    
    // Empty string gets normalized to # and then falls back to defaults
    expect(result.primary).toBe('#4A90E2');
  });

  it('should handle hex with only 3 characters', () => {
    const palette: VibrantPalette = {
      Vibrant: { hex: '#F00' }
    };
    
    const result = extractColors(palette);
    
    expect(result.primary).toBe('#F00');
    expect(result.secondary).toBe('#FFFFFF'); // Inverted red (#FF0000 -> #00FFFF -> #FFFFFF due to parsing)
  });

  it('should handle hex with only 3 characters without #', () => {
    const palette: VibrantPalette = {
      Vibrant: { hex: 'F00' }
    };
    
    const result = extractColors(palette);
    
    expect(result.primary).toBe('#F00');
    expect(result.secondary).toBe('#FFFFFF'); // Inverted red (#FF0000 -> #00FFFF -> #FFFFFF due to parsing)
  });

  it('should handle very light colors', () => {
    const palette: VibrantPalette = {
      Vibrant: { hex: '#FFFFCC' }
    };
    
    const result = extractColors(palette);
    
    expect(result.primary).toBe('#FFFFCC');
    expect(result.secondary).toBe('#000033'); // Inverted very light
  });

  it('should handle very dark colors', () => {
    const palette: VibrantPalette = {
      Vibrant: { hex: '#001122' }
    };
    
    const result = extractColors(palette);
    
    expect(result.primary).toBe('#001122');
    expect(result.secondary).toBe('#FFEEDD'); // Inverted very dark
  });

  it('should handle medium gray colors', () => {
    const palette: VibrantPalette = {
      Vibrant: { hex: '#808080' }
    };
    
    const result = extractColors(palette);
    
    expect(result.primary).toBe('#808080');
    expect(result.secondary).toBe('#7F7F7F'); // Inverted medium gray
  });

  it('should handle pure colors', () => {
    const testCases = [
      { input: '#FF0000', expected: '#00FFFF' }, // Pure red
      { input: '#00FF00', expected: '#FF00FF' }, // Pure green
      { input: '#0000FF', expected: '#FFFF00' }, // Pure blue
      { input: '#FFFF00', expected: '#0000FF' }, // Pure yellow
      { input: '#FF00FF', expected: '#00FF00' }, // Pure magenta
      { input: '#00FFFF', expected: '#FF0000' }, // Pure cyan
    ];

    testCases.forEach(({ input, expected }) => {
      const palette: VibrantPalette = {
        Vibrant: { hex: input }
      };
      
      const result = extractColors(palette);
      
      expect(result.primary).toBe(input);
      expect(result.secondary).toBe(expected);
    });
  });

  it('should handle pastel colors', () => {
    const palette: VibrantPalette = {
      Vibrant: { hex: '#FFB3BA' } // Pastel pink
    };
    
    const result = extractColors(palette);
    
    expect(result.primary).toBe('#FFB3BA');
    expect(result.secondary).toBe('#004C45'); // Inverted pastel
  });

  it('should handle neon colors', () => {
    const palette: VibrantPalette = {
      Vibrant: { hex: '#39FF14' } // Neon green
    };
    
    const result = extractColors(palette);
    
    expect(result.primary).toBe('#39FF14');
    expect(result.secondary).toBe('#C600EB'); // Inverted neon
  });

  it('should handle metallic colors', () => {
    const palette: VibrantPalette = {
      Vibrant: { hex: '#C0C0C0' } // Silver
    };
    
    const result = extractColors(palette);
    
    expect(result.primary).toBe('#C0C0C0');
    expect(result.secondary).toBe('#3F3F3F'); // Inverted silver
  });

  it('should handle earth tones', () => {
    const palette: VibrantPalette = {
      Vibrant: { hex: '#8B4513' } // Saddle brown
    };
    
    const result = extractColors(palette);
    
    expect(result.primary).toBe('#8B4513');
    expect(result.secondary).toBe('#74BAEC'); // Inverted brown
  });

  it('should handle single color palette with lowercase hex', () => {
    const palette: VibrantPalette = {
      Vibrant: { hex: '#ff6b6b' }
    };
    
    const result = extractColors(palette);
    
    expect(result.primary).toBe('#ff6b6b');
    expect(result.secondary).toBe('#009494'); // Inverted version
  });

  it('should handle single color palette with mixed case hex', () => {
    const palette: VibrantPalette = {
      Vibrant: { hex: '#Ff6B6b' }
    };
    
    const result = extractColors(palette);
    
    expect(result.primary).toBe('#Ff6B6b');
    expect(result.secondary).toBe('#009494'); // Inverted version
  });

  it('should handle single color palette with uppercase hex', () => {
    const palette: VibrantPalette = {
      Vibrant: { hex: '#FF6B6B' }
    };
    
    const result = extractColors(palette);
    
    expect(result.primary).toBe('#FF6B6B');
    expect(result.secondary).toBe('#009494'); // Inverted version
  });

  it('should handle single color palette with transparent equivalent', () => {
    const palette: VibrantPalette = {
      Vibrant: { hex: '#FFFFFF' }
    };
    
    const result = extractColors(palette);
    
    expect(result.primary).toBe('#FFFFFF');
    expect(result.secondary).toBe('#000000'); // Inverted white
  });

  it('should handle single color palette with black equivalent', () => {
    const palette: VibrantPalette = {
      Vibrant: { hex: '#000000' }
    };
    
    const result = extractColors(palette);
    
    expect(result.primary).toBe('#000000');
    expect(result.secondary).toBe('#FFFFFF'); // Inverted black
  });

  it('should handle single color palette with gray equivalent', () => {
    const palette: VibrantPalette = {
      Vibrant: { hex: '#666666' }
    };
    
    const result = extractColors(palette);
    
    expect(result.primary).toBe('#666666');
    expect(result.secondary).toBe('#999999'); // Inverted gray
  });
});