/**
 * @lab/nft-utils - NFT utilities for generating BearBrick SVG art and ERC-721 metadata
 */

// Type definitions
export type {
  BearBrickColors,
  BearBrickConfig,
  BearBrickMetadata,
  BearBrickAttribute,
  BearBrickTokenUri,
} from './types';

// Core utilities
export { createSeed, hashString, getVariation } from './utils';

// SVG generation
export { createBearBrickSvg, validateBearBrickConfig } from './svg';

// Metadata generation
export { buildBearBrickMetadata, createBearBrickTokenUri, extractColors } from './metadata';