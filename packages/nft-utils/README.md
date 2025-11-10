# @lab/nft-utils

NFT utilities for generating BearBrick SVG art and ERC-721 metadata. This package provides deterministic generation of unique BearBrick NFTs with customizable colors, user-specific variations, and on-chain compatible metadata.

## Installation

```bash
pnpm add @lab/nft-utils
```

## Features

- 🎨 **SVG Generation**: Create unique BearBrick SVG art with customizable colors
- 🏷️ **ERC-721 Metadata**: Generate standards-compliant NFT metadata
- 🔄 **Deterministic**: Same inputs always produce the same output
- 👤 **User-Specific**: FID-based variations ensure unique NFTs per user
- 📦 **Data URIs**: On-chain compatible token URI generation
- ⚡ **TypeScript**: Full TypeScript support with type definitions
- 🧪 **Well-Tested**: Comprehensive unit test coverage

## Quick Start

```typescript
import { createBearBrickTokenUri } from '@lab/nft-utils';

const config = {
  colors: {
    primary: '#FF6B6B',
    secondary: '#4ECDC4',
  },
  fid: 12345,
  username: 'alice',
};

const { metadata, tokenUri } = createBearBrickTokenUri(config);

console.log('Metadata:', metadata);
console.log('Token URI:', tokenUri); // Ready for on-chain storage
```

## API Reference

### Core Functions

#### `createBearBrickSvg(config)`

Generates a BearBrick SVG string based on the provided configuration.

```typescript
import { createBearBrickSvg } from '@lab/nft-utils';

const svg = createBearBrickSvg({
  colors: {
    primary: '#FF6B6B',
    secondary: '#4ECDC4',
  },
  fid: 12345,
  username: 'alice',
  size: 500, // Optional: defaults to 320
  showUsername: true, // Optional: defaults to true
});
```

#### `buildBearBrickMetadata(config)`

Creates ERC-721 metadata object with SVG embedded as data URI.

```typescript
import { buildBearBrickMetadata } from '@lab/nft-utils';

const metadata = buildBearBrickMetadata(config);
// Returns: { name, description, image, attributes }
```

#### `createBearBrickTokenUri(config)`

Generates complete token URI with metadata encoded as data URI.

```typescript
import { createBearBrickTokenUri } from '@lab/nft-utils';

const { metadata, tokenUri } = createBearBrickTokenUri(config);
// tokenUri is ready for on-chain storage
```

### Configuration Options

```typescript
interface BearBrickConfig {
  colors: {
    primary: string;    // Hex color (e.g., '#FF6B6B')
    secondary: string;  // Hex color (e.g., '#4ECDC4')
  };
  fid?: number;         // Farcaster ID for unique variations
  username?: string;    // Display name for the NFT
  seed?: string;        // Custom seed for deterministic generation
  size?: number;        // SVG dimensions (default: 320)
  showUsername?: boolean; // Show username in SVG (default: true)
}
```

### Utility Functions

#### `createSeed(fid, additional?)`

Creates a deterministic seed from FID and optional additional data.

```typescript
import { createSeed } from '@lab/nft-utils';

const seed = createSeed(12345, 'alice'); // '12345-alice'
```

#### `getVariation(seed, maxVariations?)`

Generates a deterministic variation number for unique patterns.

```typescript
import { getVariation } from '@lab/nft-utils';

const variation = getVariation('seed', 10); // 0-9
```

## Examples

### Basic NFT Generation

```typescript
import { createBearBrickTokenUri } from '@lab/nft-utils';

function generateUserNFT(fid: number, username: string, colors: BearBrickColors) {
  const config = {
    colors,
    fid,
    username,
    size: 512,
  };

  const { metadata, tokenUri } = createBearBrickTokenUri(config);
  
  return {
    metadata,
    tokenUri,
    // Store tokenUri on-chain in your contract
  };
}
```

### Color Scheme Variations

```typescript
const colorSchemes = [
  { primary: '#FF6B6B', secondary: '#4ECDC4' }, // Coral & Turquoise
  { primary: '#6C5CE7', secondary: '#A29BFE' }, // Purple & Lavender
  { primary: '#00B894', secondary: '#55EFC4' }, // Emerald & Mint
  { primary: '#FDCB6E', secondary: '#E17055' }, // Yellow & Coral
];

function generateCollection(baseFid: number) {
  return colorSchemes.map((colors, index) => {
    const config = {
      colors,
      fid: baseFid + index,
      username: `user${index}`,
    };
    
    return createBearBrickTokenUri(config);
  });
}
```

### Pre-generation for Gas Optimization

```typescript
import { createBearBrickSvg, buildBearBrickMetadata } from '@lab/nft-utils';

// Pre-generate SVGs to save gas during minting
function preGenerateSVGs(userConfigs: BearBrickConfig[]) {
  const svgs = userConfigs.map(config => ({
    fid: config.fid,
    svg: createBearBrickSvg(config),
  }));
  
  // Store SVGs off-chain, only store references on-chain
  return svgs;
}
```

## Integration with BearBrick Contract

This package is designed to work seamlessly with the BearBrick NFT contract:

```solidity
// Example contract integration
contract BearBrickNFT is ERC721 {
    mapping(uint256 => string) private _tokenURIs;
    
    function mintBearBrick(
        address to,
        uint256 tokenId,
        string memory tokenUri
    ) external {
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenUri);
    }
    
    function _setTokenURI(uint256 tokenId, string memory _tokenUri) internal {
        _tokenURIs[tokenId] = _tokenUri;
    }
    
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        return _tokenURIs[tokenId];
    }
}
```

```typescript
// Frontend integration
async function mintBearBrick(userFID: number, username: string) {
  const config = {
    colors: getUserColorScheme(userFID),
    fid: userFID,
    username,
  };
  
  const { tokenUri } = createBearBrickTokenUri(config);
  
  // Call contract to mint with pre-generated tokenUri
  await contract.mintBearBrick(userAddress, tokenId, tokenUri);
}
```

## Gas Size Considerations

### SVG Optimization

The generated SVGs are optimized for on-chain storage:

- **Size**: Typical SVG ~2-3KB when base64 encoded
- **Structure**: Efficient XML with minimal attributes
- **Colors**: Hex codes (3-6 chars) instead of RGB
- **Compression**: Base64 encoding for data URI compatibility

### Metadata Structure

```json
{
  "name": "BearBrick #12345 (@alice)",
  "description": "A unique BearBrick NFT generated for Farcaster user 12345 (@alice). This collectible features a distinctive color scheme and represents ownership in the BearBrick universe.",
  "image": "data:image/svg+xml;base64,PHN2Zz4uLi48L3N2Zz4=",
  "attributes": [
    { "trait_type": "FID", "value": 12345 },
    { "trait_type": "Primary Color", "value": "#FF6B6B" },
    { "trait_type": "Secondary Color", "value": "#4ECDC4" },
    { "trait_type": "Username", "value": "alice" },
    { "trait_type": "Generation", "value": "Genesis" }
  ]
}
```

### Gas Optimization Tips

1. **Pre-generate**: Create SVGs and metadata off-chain when possible
2. **Batch operations**: Mint multiple NFTs in a single transaction
3. **Color limits**: Use simpler color schemes to reduce SVG size
4. **Username limits**: Consider shorter usernames for display

## Color Extraction Integration

This package includes a placeholder for integration with `@lab/color-extraction`:

```typescript
import { extractColors } from '@lab/nft-utils';

// Future integration
const colors = extractColors(userProfile);
if (colors) {
  const config = { colors, fid: user.fid, username: user.username };
  const nft = createBearBrickTokenUri(config);
}
```

## Testing

Run the test suite:

```bash
pnpm test
```

The package includes comprehensive tests covering:

- ✅ SVG structure and validation
- ✅ Color injection and formatting
- ✅ Metadata field completeness
- ✅ Data URI generation and encoding
- ✅ Deterministic output for given inputs
- ✅ Error handling and edge cases

## Development

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Run tests
pnpm test

# Lint code
pnpm lint
```

## License

MIT License - see LICENSE file for details.

## Contributing

Contributions are welcome! Please ensure:

- All tests pass
- Code follows existing patterns
- TypeScript types are complete
- Documentation is updated

## Related Packages

- `@lab/core` - Core utilities
- `@lab/farcaster-auth` - Farcaster authentication
- `@lab/bearbrick-contract` - BearBrick NFT smart contract