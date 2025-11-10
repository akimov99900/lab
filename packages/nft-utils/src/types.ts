/**
 * Color configuration for BearBrick generation
 */
export interface BearBrickColors {
  primary: string;
  secondary: string;
}

/**
 * Configuration options for BearBrick SVG generation
 */
export interface BearBrickConfig {
  colors: BearBrickColors;
  fid?: number;
  username?: string;
  seed?: string;
  size?: number;
  showUsername?: boolean;
}

/**
 * ERC-721 metadata structure
 */
export interface BearBrickMetadata {
  name: string;
  description: string;
  image: string; // data: URI for SVG
  attributes: BearBrickAttribute[];
}

/**
 * Attribute for ERC-721 metadata
 */
export interface BearBrickAttribute {
  trait_type: string;
  value: string | number;
}

/**
 * Token URI result containing both structured data and data URI
 */
export interface BearBrickTokenUri {
  metadata: BearBrickMetadata;
  tokenUri: string; // data: URI for JSON metadata
}