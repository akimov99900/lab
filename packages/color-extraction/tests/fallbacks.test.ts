import { describe, it, expect } from 'vitest';
import {
  DEFAULT_FALLBACK_COLORS,
  ERROR_FALLBACKS,
  getFallbackColors,
  generateDeterministicFallbacks,
} from '../src/fallbacks';
import type { ColorPair } from '../src/types';

describe('fallbacks', () => {
  describe('DEFAULT_FALLBACK_COLORS', () => {
    it('should have valid hex colors', () => {
      expect(DEFAULT_FALLBACK_COLORS.primary).toMatch(/^#[0-9A-F]{6}$/);
      expect(DEFAULT_FALLBACK_COLORS.secondary).toMatch(/^#[0-9A-F]{6}$/);
    });

    it('should have distinct colors', () => {
      expect(DEFAULT_FALLBACK_COLORS.primary).not.toBe(DEFAULT_FALLBACK_COLORS.secondary);
    });
  });

  describe('ERROR_FALLBACKS', () => {
    it('should have fallback colors for all error types', () => {
      expect(ERROR_FALLBACKS.NETWORK_ERROR).toBeDefined();
      expect(ERROR_FALLBACKS.INVALID_IMAGE).toBeDefined();
      expect(ERROR_FALLBACKS.CORS_ERROR).toBeDefined();

      // Check each has valid hex colors
      Object.values(ERROR_FALLBACKS).forEach((fallback) => {
        expect(fallback.primary).toMatch(/^#[0-9A-F]{6}$/);
        expect(fallback.secondary).toMatch(/^#[0-9A-F]{6}$/);
      });
    });

    it('should have distinct colors for each error type', () => {
      const errorTypes = Object.keys(ERROR_FALLBACKS) as Array<keyof typeof ERROR_FALLBACKS>;
      const colorPairs = errorTypes.map(type => ERROR_FALLBACKS[type]);
      
      // Check that all pairs are unique
      for (let i = 0; i < colorPairs.length; i++) {
        for (let j = i + 1; j < colorPairs.length; j++) {
          expect(colorPairs[i]).not.toEqual(colorPairs[j]);
        }
      }
    });
  });

  describe('getFallbackColors', () => {
    it('should return default fallbacks for default type', () => {
      const result = getFallbackColors('default');
      expect(result).toEqual(DEFAULT_FALLBACK_COLORS);
    });

    it('should return specific fallbacks for error types', () => {
      const networkResult = getFallbackColors('NETWORK_ERROR');
      expect(networkResult).toEqual(ERROR_FALLBACKS.NETWORK_ERROR);

      const invalidResult = getFallbackColors('INVALID_IMAGE');
      expect(invalidResult).toEqual(ERROR_FALLBACKS.INVALID_IMAGE);

      const corsResult = getFallbackColors('CORS_ERROR');
      expect(corsResult).toEqual(ERROR_FALLBACKS.CORS_ERROR);
    });
  });

  describe('generateDeterministicFallbacks', () => {
    it('should generate consistent colors for the same seed', () => {
      const seed = 'test-seed-123';
      const result1 = generateDeterministicFallbacks(seed);
      const result2 = generateDeterministicFallbacks(seed);

      expect(result1).toEqual(result2);
    });

    it('should generate different colors for different seeds', () => {
      const seed1 = 'test-seed-123';
      const seed2 = 'test-seed-456';
      const result1 = generateDeterministicFallbacks(seed1);
      const result2 = generateDeterministicFallbacks(seed2);

      expect(result1).not.toEqual(result2);
    });

    it('should generate valid hex colors', () => {
      const seeds = ['seed1', 'seed2', 'seed3', 'a', 'b', 'c'];
      
      seeds.forEach((seed) => {
        const result = generateDeterministicFallbacks(seed);
        expect(result.primary).toMatch(/^#[0-9A-F]{6}$/);
        expect(result.secondary).toMatch(/^#[0-9A-F]{6}$/);
      });
    });

    it('should generate distinct primary and secondary colors', () => {
      const seeds = ['seed1', 'seed2', 'seed3'];
      
      seeds.forEach((seed) => {
        const result = generateDeterministicFallbacks(seed);
        expect(result.primary).not.toBe(result.secondary);
      });
    });

    it('should handle empty string seed', () => {
      const result = generateDeterministicFallbacks('');
      
      expect(result).toHaveProperty('primary');
      expect(result).toHaveProperty('secondary');
      expect(result.primary).toMatch(/^#[0-9A-F]{6}$/);
      expect(result.secondary).toMatch(/^#[0-9A-F]{6}$/);
    });

    it('should handle special characters in seed', () => {
      const seeds = ['test@example.com', 'path/to/image.jpg', 'user-123_456'];
      
      seeds.forEach((seed) => {
        const result = generateDeterministicFallbacks(seed);
        expect(result.primary).toMatch(/^#[0-9A-F]{6}$/);
        expect(result.secondary).toMatch(/^#[0-9A-F]{6}$/);
      });
    });

    it('should generate complementary-like colors', () => {
      const seed = 'test-seed';
      const result = generateDeterministicFallbacks(seed);
      
      // The secondary color should have some hue difference from primary
      // This is a basic check - in a real implementation you might want
      // to check actual color theory principles
      expect(result.primary).not.toBe(result.secondary);
      
      // Both should be valid colors
      expect(result.primary).toMatch(/^#[0-9A-F]{6}$/);
      expect(result.secondary).toMatch(/^#[0-9A-F]{6}$/);
    });

    it('should be deterministic across multiple calls', () => {
      const seed = 'deterministic-test';
      const results: ColorPair[] = [];
      
      // Generate multiple times to ensure consistency
      for (let i = 0; i < 10; i++) {
        results.push(generateDeterministicFallbacks(seed));
      }
      
      // All results should be identical
      const first = results[0];
      results.forEach((result) => {
        expect(result).toEqual(first);
      });
    });
  });

  describe('color generation edge cases', () => {
    it('should handle very long seeds', () => {
      const longSeed = 'a'.repeat(1000);
      const result = generateDeterministicFallbacks(longSeed);
      
      expect(result.primary).toMatch(/^#[0-9A-F]{6}$/);
      expect(result.secondary).toMatch(/^#[0-9A-F]{6}$/);
    });

    it('should handle unicode characters in seed', () => {
      const unicodeSeed = '🎨🖼️🎭';
      const result = generateDeterministicFallbacks(unicodeSeed);
      
      expect(result.primary).toMatch(/^#[0-9A-F]{6}$/);
      expect(result.secondary).toMatch(/^#[0-9A-F]{6}$/);
    });

    it('should handle numeric seeds', () => {
      const numericSeed = '1234567890';
      const result = generateDeterministicFallbacks(numericSeed);
      
      expect(result.primary).toMatch(/^#[0-9A-F]{6}$/);
      expect(result.secondary).toMatch(/^#[0-9A-F]{6}$/);
    });
  });
});