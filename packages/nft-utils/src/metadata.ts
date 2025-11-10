import type { BearBrickConfig, BearBrickMetadata, BearBrickTokenUri, BearBrickAttribute } from './types';
import { createBearBrickSvg } from './svg';

/**
 * Builds BearBrick ERC-721 metadata
 */
export function buildBearBrickMetadata(config: BearBrickConfig): BearBrickMetadata {
  const { fid = 0, username, colors } = config;
  
  // Generate SVG
  const svg = createBearBrickSvg(config);
  
  // Convert SVG to data URI
  const svgDataUri = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  
  // Create name
  const name = username 
    ? `BearBrick #${fid} (@${username})`
    : `BearBrick #${fid}`;
  
  // Create description
  const description = `A unique BearBrick NFT generated for Farcaster user ${fid}${username ? ` (@${username})` : ''}. This collectible features a distinctive color scheme and represents ownership in the BearBrick universe.`;
  
  // Create attributes
  const attributes: BearBrickAttribute[] = [
    {
      trait_type: 'FID',
      value: fid,
    },
    {
      trait_type: 'Primary Color',
      value: colors.primary.toUpperCase(),
    },
    {
      trait_type: 'Secondary Color',
      value: colors.secondary.toUpperCase(),
    },
  ];
  
  if (username) {
    attributes.push({
      trait_type: 'Username',
      value: username,
    });
  }
  
  // Add generation metadata
  attributes.push({
    trait_type: 'Generation',
    value: 'Genesis',
  });
  
  return {
    name,
    description,
    image: svgDataUri,
    attributes,
  };
}

/**
 * Creates a complete token URI with data URI encoding
 */
export function createBearBrickTokenUri(config: BearBrickConfig): BearBrickTokenUri {
  const metadata = buildBearBrickMetadata(config);
  
  // Convert metadata to JSON and then to data URI
  const metadataJson = JSON.stringify(metadata);
  const tokenUri = `data:application/json;base64,${Buffer.from(metadataJson).toString('base64')}`;
  
  return {
    metadata,
    tokenUri,
  };
}

/**
 * Extracts colors from various input formats
 * This is a placeholder for integration with @lab/color-extraction
 */
export function extractColors(input: any): { primary: string; secondary: string } | null {
  // TODO: Integrate with @lab/color-extraction package
  // For now, return null to indicate manual color specification is needed
  return null;
}