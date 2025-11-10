import { describe, it, expect } from 'vitest';
import { createBearBrickSvg, validateBearBrickConfig } from '../src/svg';
import type { BearBrickConfig } from '../src/types';

describe('createBearBrickSvg', () => {
  const baseConfig: BearBrickConfig = {
    colors: {
      primary: '#FF6B6B',
      secondary: '#4ECDC4',
    },
    fid: 12345,
    username: 'testuser',
  };

  it('should generate a valid SVG structure', () => {
    const svg = createBearBrickSvg(baseConfig);
    
    expect(svg).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
  });

  it('should include correct colors', () => {
    const svg = createBearBrickSvg(baseConfig);
    
    expect(svg).toContain('fill="#FF6B6B"');
    expect(svg).toContain('fill="#4ECDC4"');
  });

  it('should include username when showUsername is true', () => {
    const svg = createBearBrickSvg({ ...baseConfig, showUsername: true });
    
    expect(svg).toContain('@testuser');
  });

  it('should not include username when showUsername is false', () => {
    const svg = createBearBrickSvg({ ...baseConfig, showUsername: false });
    
    expect(svg).not.toContain('@testuser');
  });

  it('should generate different outputs for different FIDs', () => {
    const svg1 = createBearBrickSvg({ ...baseConfig, fid: 123 });
    const svg2 = createBearBrickSvg({ ...baseConfig, fid: 456 });
    
    expect(svg1).not.toBe(svg2);
  });

  it('should generate same output for same seed', () => {
    const svg1 = createBearBrickSvg({ ...baseConfig, seed: 'test-seed' });
    const svg2 = createBearBrickSvg({ ...baseConfig, seed: 'test-seed' });
    
    expect(svg1).toBe(svg2);
  });

  it('should use default values for optional parameters', () => {
    const minimalConfig: BearBrickConfig = {
      colors: baseConfig.colors,
    };
    
    const svg = createBearBrickSvg(minimalConfig);
    
    expect(svg).toContain('width="320"');
    expect(svg).toContain('height="320"');
    expect(svg).not.toContain('@'); // No username by default
  });

  it('should respect custom size', () => {
    const svg = createBearBrickSvg({ ...baseConfig, size: 500 });
    
    expect(svg).toContain('width="500"');
    expect(svg).toContain('height="500"');
    expect(svg).toContain('viewBox="0 0 500 500"');
  });

  it('should contain BearBrick structural elements', () => {
    const svg = createBearBrickSvg(baseConfig);
    
    // Should have head, body, arms, legs, eyes
    expect(svg).toContain('<!-- Head -->');
    expect(svg).toContain('<!-- Body -->');
    expect(svg).toContain('<!-- Left Arm -->');
    expect(svg).toContain('<!-- Right Arm -->');
    expect(svg).toContain('<!-- Left Leg -->');
    expect(svg).toContain('<!-- Right Leg -->');
    expect(svg).toContain('<!-- Eyes -->');
  });

  it('should generate variations based on seed', () => {
    // Test that different seeds create different patterns
    const svg1 = createBearBrickSvg({ ...baseConfig, seed: 'seed1' });
    const svg2 = createBearBrickSvg({ ...baseConfig, seed: 'seed2' });
    
    // They should be different
    expect(svg1).not.toBe(svg2);
  });
});

describe('validateBearBrickConfig', () => {
  it('should pass with valid configuration', () => {
    const validConfig: BearBrickConfig = {
      colors: {
        primary: '#FF6B6B',
        secondary: '#4ECDC4',
      },
    };
    
    expect(() => validateBearBrickConfig(validConfig)).not.toThrow();
  });

  it('should throw when colors are missing', () => {
    const invalidConfig = {} as BearBrickConfig;
    
    expect(() => validateBearBrickConfig(invalidConfig)).toThrow('BearBrickConfig.colors is required');
  });

  it('should throw when primary color is missing', () => {
    const invalidConfig: BearBrickConfig = {
      colors: {
        primary: '',
        secondary: '#4ECDC4',
      },
    };
    
    expect(() => validateBearBrickConfig(invalidConfig)).toThrow('BearBrickConfig.colors must have both primary and secondary colors');
  });

  it('should throw when secondary color is missing', () => {
    const invalidConfig: BearBrickConfig = {
      colors: {
        primary: '#FF6B6B',
        secondary: '',
      },
    };
    
    expect(() => validateBearBrickConfig(invalidConfig)).toThrow('BearBrickConfig.colors must have both primary and secondary colors');
  });

  it('should throw when primary color format is invalid', () => {
    const invalidConfig: BearBrickConfig = {
      colors: {
        primary: 'invalid-color',
        secondary: '#4ECDC4',
      },
    };
    
    expect(() => validateBearBrickConfig(invalidConfig)).toThrow('Invalid primary color format: invalid-color');
  });

  it('should throw when secondary color format is invalid', () => {
    const invalidConfig: BearBrickConfig = {
      colors: {
        primary: '#FF6B6B',
        secondary: 'invalid-color',
      },
    };
    
    expect(() => validateBearBrickConfig(invalidConfig)).toThrow('Invalid secondary color format: invalid-color');
  });

  it('should accept 3-digit hex colors', () => {
    const validConfig: BearBrickConfig = {
      colors: {
        primary: '#F00',
        secondary: '#0F0',
      },
    };
    
    expect(() => validateBearBrickConfig(validConfig)).not.toThrow();
  });

  it('should accept 6-digit hex colors', () => {
    const validConfig: BearBrickConfig = {
      colors: {
        primary: '#FF0000',
        secondary: '#00FF00',
      },
    };
    
    expect(() => validateBearBrickConfig(validConfig)).not.toThrow();
  });
});