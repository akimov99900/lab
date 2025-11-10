import { describe, it, expect } from 'vitest';
import { buildBearBrickMetadata, createBearBrickTokenUri } from '../src/metadata';
import type { BearBrickConfig } from '../src/types';

describe('buildBearBrickMetadata', () => {
  const baseConfig: BearBrickConfig = {
    colors: {
      primary: '#FF6B6B',
      secondary: '#4ECDC4',
    },
    fid: 12345,
    username: 'testuser',
  };

  it('should build complete metadata structure', () => {
    const metadata = buildBearBrickMetadata(baseConfig);
    
    expect(metadata).toHaveProperty('name');
    expect(metadata).toHaveProperty('description');
    expect(metadata).toHaveProperty('image');
    expect(metadata).toHaveProperty('attributes');
    expect(Array.isArray(metadata.attributes)).toBe(true);
  });

  it('should generate correct name with username', () => {
    const metadata = buildBearBrickMetadata(baseConfig);
    
    expect(metadata.name).toBe('BearBrick #12345 (@testuser)');
  });

  it('should generate correct name without username', () => {
    const configWithoutUsername = { ...baseConfig, username: undefined };
    const metadata = buildBearBrickMetadata(configWithoutUsername);
    
    expect(metadata.name).toBe('BearBrick #12345');
  });

  it('should include FID in attributes', () => {
    const metadata = buildBearBrickMetadata(baseConfig);
    
    const fidAttribute = metadata.attributes.find(attr => attr.trait_type === 'FID');
    expect(fidAttribute).toBeDefined();
    expect(fidAttribute?.value).toBe(12345);
  });

  it('should include colors in attributes', () => {
    const metadata = buildBearBrickMetadata(baseConfig);
    
    const primaryColorAttribute = metadata.attributes.find(attr => attr.trait_type === 'Primary Color');
    const secondaryColorAttribute = metadata.attributes.find(attr => attr.trait_type === 'Secondary Color');
    
    expect(primaryColorAttribute).toBeDefined();
    expect(primaryColorAttribute?.value).toBe('#FF6B6B');
    expect(secondaryColorAttribute).toBeDefined();
    expect(secondaryColorAttribute?.value).toBe('#4ECDC4');
  });

  it('should include username in attributes when provided', () => {
    const metadata = buildBearBrickMetadata(baseConfig);
    
    const usernameAttribute = metadata.attributes.find(attr => attr.trait_type === 'Username');
    expect(usernameAttribute).toBeDefined();
    expect(usernameAttribute?.value).toBe('testuser');
  });

  it('should not include username in attributes when not provided', () => {
    const configWithoutUsername = { ...baseConfig, username: undefined };
    const metadata = buildBearBrickMetadata(configWithoutUsername);
    
    const usernameAttribute = metadata.attributes.find(attr => attr.trait_type === 'Username');
    expect(usernameAttribute).toBeUndefined();
  });

  it('should include generation attribute', () => {
    const metadata = buildBearBrickMetadata(baseConfig);
    
    const generationAttribute = metadata.attributes.find(attr => attr.trait_type === 'Generation');
    expect(generationAttribute).toBeDefined();
    expect(generationAttribute?.value).toBe('Genesis');
  });

  it('should generate SVG data URI for image', () => {
    const metadata = buildBearBrickMetadata(baseConfig);
    
    expect(metadata.image).toMatch(/^data:image\/svg\+xml;base64,/);
  });

  it('should generate meaningful description', () => {
    const metadata = buildBearBrickMetadata(baseConfig);
    
    expect(metadata.description).toContain('Farcaster user 12345');
    expect(metadata.description).toContain('@testuser');
    expect(metadata.description).toContain('BearBrick');
  });

  it('should generate description without username when not provided', () => {
    const configWithoutUsername = { ...baseConfig, username: undefined };
    const metadata = buildBearBrickMetadata(configWithoutUsername);
    
    expect(metadata.description).toContain('Farcaster user 12345');
    expect(metadata.description).not.toContain('@');
  });
});

describe('createBearBrickTokenUri', () => {
  const baseConfig: BearBrickConfig = {
    colors: {
      primary: '#FF6B6B',
      secondary: '#4ECDC4',
    },
    fid: 12345,
    username: 'testuser',
  };

  it('should return both metadata and token URI', () => {
    const result = createBearBrickTokenUri(baseConfig);
    
    expect(result).toHaveProperty('metadata');
    expect(result).toHaveProperty('tokenUri');
    expect(result.metadata).toBeDefined();
    expect(result.tokenUri).toBeDefined();
  });

  it('should generate valid data URI for token URI', () => {
    const result = createBearBrickTokenUri(baseConfig);
    
    expect(result.tokenUri).toMatch(/^data:application\/json;base64,/);
  });

  it('should generate consistent metadata between calls', () => {
    const result1 = createBearBrickTokenUri(baseConfig);
    const result2 = createBearBrickTokenUri(baseConfig);
    
    expect(result1.metadata).toEqual(result2.metadata);
  });

  it('should generate deterministic token URI for same config', () => {
    const result1 = createBearBrickTokenUri(baseConfig);
    const result2 = createBearBrickTokenUri(baseConfig);
    
    expect(result1.tokenUri).toBe(result2.tokenUri);
  });

  it('should generate different token URIs for different configs', () => {
    const config1 = { ...baseConfig, fid: 123 };
    const config2 = { ...baseConfig, fid: 456 };
    
    const result1 = createBearBrickTokenUri(config1);
    const result2 = createBearBrickTokenUri(config2);
    
    expect(result1.tokenUri).not.toBe(result2.tokenUri);
  });

  it('should produce decodable JSON from token URI', () => {
    const result = createBearBrickTokenUri(baseConfig);
    
    // Decode the base64 data URI
    const base64Data = result.tokenUri.replace('data:application/json;base64,', '');
    const jsonString = Buffer.from(base64Data, 'base64').toString('utf-8');
    const decodedMetadata = JSON.parse(jsonString);
    
    expect(decodedMetadata).toEqual(result.metadata);
  });
});