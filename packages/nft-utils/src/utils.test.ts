import { describe, it, expect } from 'vitest';
import { createSeed, hashString, getVariation } from '../src/utils';

describe('createSeed', () => {
  it('should create seed from fid only', () => {
    const seed = createSeed(12345);
    expect(seed).toBe('12345');
  });

  it('should create seed from fid and additional string', () => {
    const seed = createSeed(12345, 'testuser');
    expect(seed).toBe('12345-testuser');
  });

  it('should handle empty additional string', () => {
    const seed = createSeed(12345, '');
    expect(seed).toBe('12345');
  });

  it('should handle special characters in additional string', () => {
    const seed = createSeed(12345, 'user@domain.com');
    expect(seed).toBe('12345-user@domain.com');
  });
});

describe('hashString', () => {
  it('should return consistent hash for same input', () => {
    const hash1 = hashString('test');
    const hash2 = hashString('test');
    expect(hash1).toBe(hash2);
  });

  it('should return different hashes for different inputs', () => {
    const hash1 = hashString('test1');
    const hash2 = hashString('test2');
    expect(hash1).not.toBe(hash2);
  });

  it('should return positive numbers', () => {
    const hash = hashString('any string');
    expect(hash).toBeGreaterThanOrEqual(0);
  });

  it('should handle empty string', () => {
    const hash = hashString('');
    expect(hash).toBeGreaterThanOrEqual(0);
  });

  it('should handle long strings', () => {
    const longString = 'a'.repeat(1000);
    const hash = hashString(longString);
    expect(hash).toBeGreaterThanOrEqual(0);
  });

  it('should be deterministic', () => {
    const testCases = [
      'hello',
      'world',
      '12345',
      'special!@#$%^&*()',
      'Unicode: 🧸',
    ];

    testCases.forEach(str => {
      const hash1 = hashString(str);
      const hash2 = hashString(str);
      expect(hash1).toBe(hash2);
      expect(hash1).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('getVariation', () => {
  it('should return variation within bounds', () => {
    const variation = getVariation('test', 10);
    expect(variation).toBeGreaterThanOrEqual(0);
    expect(variation).toBeLessThan(10);
  });

  it('should use default maxVariations when not specified', () => {
    const variation = getVariation('test');
    expect(variation).toBeGreaterThanOrEqual(0);
    expect(variation).toBeLessThan(10);
  });

  it('should return consistent variation for same seed', () => {
    const variation1 = getVariation('test-seed', 5);
    const variation2 = getVariation('test-seed', 5);
    expect(variation1).toBe(variation2);
  });

  it('should return different variations for different seeds', () => {
    const variation1 = getVariation('seed1', 100);
    const variation2 = getVariation('seed2', 100);
    expect(variation1).not.toBe(variation2);
  });

  it('should respect maxVariations parameter', () => {
    const maxVariations = 7;
    const variation = getVariation('test', maxVariations);
    expect(variation).toBeGreaterThanOrEqual(0);
    expect(variation).toBeLessThan(maxVariations);
  });

  it('should handle edge cases', () => {
    expect(getVariation('test', 1)).toBe(0);
    expect(getVariation('test', 2)).toBeGreaterThanOrEqual(0);
    expect(getVariation('test', 2)).toBeLessThan(2);
  });

  it('should handle large maxVariations', () => {
    const variation = getVariation('test', 1000);
    expect(variation).toBeGreaterThanOrEqual(0);
    expect(variation).toBeLessThan(1000);
  });
});