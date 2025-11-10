# @lab/color-extraction

Extract dominant colors from Farcaster user avatars for BearBrick NFT generation. This package provides utilities to extract 2 independent dominant colors from avatar images, with support for both server and browser environments.

## Installation

```bash
pnpm add @lab/color-extraction
```

## Features

- 🎨 **Dual Color Extraction**: Extract 2 independent dominant colors from avatar images
- 🔄 **Environment Agnostic**: Works in both Node.js and browser environments  
- 🧠 **Smart Caching**: Optional in-memory caching to avoid re-fetching same avatars
- 🛡️ **Graceful Fallbacks**: Deterministic fallback colors when extraction fails
- 📦 **TypeScript First**: Full TypeScript support with comprehensive types
- 🧪 **Well-Tested**: Comprehensive unit test coverage

## Quick Start

```typescript
import { extractDominantColors } from '@lab/color-extraction';

// Extract colors from avatar URL
const colors = await extractDominantColors('https://example.com/avatar.jpg');
console.log(colors.primary);    // "#FF6B6B" - main dominant color
console.log(colors.secondary);  // "#4ECDC4" - secondary dominant color
```

## API Reference

### Core Function

#### `extractDominantColors(input, options?)`

Extracts 2 independent dominant colors from an avatar image.

```typescript
import { extractDominantColors, type ColorPair } from '@lab/color-extraction';

const colors: ColorPair = await extractDominantColors(
  'https://example.com/avatar.jpg',
  {
    enableCache: true,
    maxCacheSize: 100,
    fallbackColors: {
      primary: '#4A90E2',
      secondary: '#F5A623'
    }
  }
);
```

**Parameters:**
- `input`: `string | ArrayBuffer | Uint8Array` - Avatar URL or image data
- `options`: `ExtractionOptions` (optional) - Configuration options

**Returns:** `Promise<ColorPair>` - Object with primary and secondary hex colors

### Types

#### `ColorPair`

```typescript
interface ColorPair {
  primary: string;    // Hex color (e.g., "#FF5733")
  secondary: string;  // Hex color (e.g., "#33FF57")
}
```

#### `ExtractionOptions`

```typescript
interface ExtractionOptions {
  /** Enable in-memory caching (default: true) */
  enableCache?: boolean;
  /** Maximum cache size (default: 100) */
  maxCacheSize?: number;
  /** Custom fallback colors */
  fallbackColors?: ColorPair;
}
```

#### `ImageInput`

```typescript
type ImageInput = string | ArrayBuffer | Uint8Array;
```

### Utility Functions

#### `clearCache()`

Clears the in-memory color extraction cache.

```typescript
import { clearCache } from '@lab/color-extraction';

clearCache();
```

#### `getCacheStats()`

Returns cache statistics.

```typescript
import { getCacheStats } from '@lab/color-extraction';

const stats = getCacheStats();
console.log(`Cache size: ${stats.size}/${stats.maxSize}`);
```

#### `generateDeterministicFallbacks(seed)`

Generates deterministic fallback colors from a seed.

```typescript
import { generateDeterministicFallbacks } from '@lab/color-extraction';

const fallbacks = generateDeterministicFallbacks('user-123');
// Returns consistent colors for the same seed
```

## Usage Examples

### Server-side (Next.js API Route)

```typescript
// pages/api/extract-colors.ts
import { extractDominantColors } from '@lab/color-extraction';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { avatarUrl } = req.body;

  if (!avatarUrl) {
    return res.status(400).json({ error: 'avatarUrl is required' });
  }

  try {
    const colors = await extractDominantColors(avatarUrl, {
      enableCache: true,
      maxCacheSize: 200, // Larger cache for server
    });

    res.status(200).json({ colors });
  } catch (error) {
    console.error('Color extraction failed:', error);
    res.status(500).json({ error: 'Failed to extract colors' });
  }
}
```

### Client-side (React Component)

```typescript
// components/AvatarColorExtractor.tsx
import React, { useState, useCallback } from 'react';
import { extractDominantColors, type ColorPair } from '@lab/color-extraction';

interface AvatarColorExtractorProps {
  avatarUrl: string;
  onColorsExtracted: (colors: ColorPair) => void;
}

export function AvatarColorExtractor({ 
  avatarUrl, 
  onColorsExtracted 
}: AvatarColorExtractorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractColors = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const colors = await extractDominantColors(avatarUrl, {
        enableCache: true,
        fallbackColors: {
          primary: '#4A90E2',
          secondary: '#F5A623'
        }
      });

      onColorsExtracted(colors);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [avatarUrl, onColorsExtracted]);

  return (
    <div>
      <button 
        onClick={extractColors} 
        disabled={isLoading}
      >
        {isLoading ? 'Extracting...' : 'Extract Colors'}
      </button>
      {error && <div className="error">{error}</div>}
    </div>
  );
}
```

### Integration with @lab/nft-utils

```typescript
import { extractDominantColors } from '@lab/color-extraction';
import { createBearBrickTokenUri } from '@lab/nft-utils';

async function generateUserNFT(avatarUrl: string, fid: number, username: string) {
  // Extract colors from user's avatar
  const colors = await extractDominantColors(avatarUrl);
  
  // Generate BearBrick NFT with extracted colors
  const config = {
    colors,
    fid,
    username,
    size: 512,
  };
  
  const { metadata, tokenUri } = createBearBrickTokenUri(config);
  
  return {
    colors,
    metadata,
    tokenUri, // Ready for on-chain storage
  };
}
```

### Advanced Configuration

```typescript
import { extractDominantColors, generateDeterministicFallbacks } from '@lab/color-extraction';

// Custom configuration for high-volume processing
const colors = await extractDominantColors(avatarUrl, {
  enableCache: true,
  maxCacheSize: 500,
  fallbackColors: generateDeterministicFallbacks(`user-${userId}`),
});

// Batch processing
async function extractMultipleColors(urls: string[]) {
  const promises = urls.map(url => 
    extractDominantColors(url, {
      enableCache: true,
      fallbackColors: generateDeterministicFallbacks(url),
    })
  );
  
  return Promise.all(promises);
}
```

## Environment Requirements

### Server-side (Node.js)

- Node.js 18+ recommended
- Works with any HTTP client for fetching images
- No additional dependencies required

### Browser

- Modern browsers with Fetch API support
- May need CORS configuration for external images
- Consider using image proxy for cross-origin requests

### Cross-Origin Considerations

When extracting colors from external URLs in the browser, you may encounter CORS errors. Solutions:

1. **Image Proxy**: Route avatar requests through your server
2. **CORS Headers**: Ensure avatar servers send appropriate CORS headers
3. **Server-side Extraction**: Perform extraction on the server side

```typescript
// Example image proxy
app.get('/proxy-avatar', async (req, res) => {
  const { url } = req.query;
  
  try {
    const response = await fetch(url as string);
    const arrayBuffer = await response.arrayBuffer();
    
    res.set('Content-Type', response.headers.get('Content-Type') || 'image/jpeg');
    res.send(Buffer.from(arrayBuffer));
  } catch (error) {
    res.status(500).send('Proxy failed');
  }
});
```

## Configuration Options

### Caching

The package includes built-in caching to avoid re-processing the same images:

```typescript
// Enable caching (default)
const colors = await extractDominantColors(url, { enableCache: true });

// Disable caching
const colors = await extractDominantColors(url, { enableCache: false });

// Custom cache size
const colors = await extractDominantColors(url, { 
  enableCache: true, 
  maxCacheSize: 200 
});
```

### Fallback Colors

When color extraction fails, the package provides deterministic fallbacks:

```typescript
// Use default fallbacks
const colors = await extractDominantColors(url);

// Custom fallbacks
const colors = await extractDominantColors(url, {
  fallbackColors: {
    primary: '#E74C3C',
    secondary: '#3498DB'
  }
});

// Deterministic fallbacks based on input
import { generateDeterministicFallbacks } from '@lab/color-extraction';

const colors = await extractDominantColors(url, {
  fallbackColors: generateDeterministicFallbacks(url)
});
```

## Error Handling

The package gracefully handles various error scenarios:

### Error Types

1. **Network Errors**: Failed HTTP requests
2. **CORS Errors**: Cross-origin restrictions
3. **Invalid Images**: Corrupted or unsupported image formats
4. **Extraction Failures**: Unable to extract colors from valid images

### Fallback Strategy

```typescript
import { 
  extractDominantColors,
  getFallbackColors,
  generateDeterministicFallbacks 
} from '@lab/color-extraction';

try {
  const colors = await extractDominantColors(url);
  // Success!
} catch (error) {
  // The package already handles errors internally
  // and returns appropriate fallback colors
  console.log('Used fallback colors due to:', error);
}
```

## Testing

Run the test suite:

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Run tests with coverage
pnpm test --coverage
```

The package includes comprehensive tests covering:

- ✅ Successful color extraction from various image formats
- ✅ Fallback behavior for different error scenarios
- ✅ Browser vs Node.js environment compatibility
- ✅ Caching functionality and performance
- ✅ Deterministic outputs for same inputs
- ✅ Color validation and format consistency

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

## Performance Considerations

### Caching

- Enable caching for repeated avatar processing
- Adjust cache size based on your use case
- Clear cache periodically in long-running processes

### Image Size

- Large images may take longer to process
- Consider resizing avatars before extraction for better performance
- The package works best with typical avatar sizes (64px - 512px)

### Batch Processing

```typescript
// Efficient batch processing with caching
async function batchExtractColors(urls: string[]) {
  const results = new Map<string, ColorPair>();
  
  // Process in parallel with concurrency limit
  const concurrency = 5;
  const chunks = [];
  
  for (let i = 0; i < urls.length; i += concurrency) {
    chunks.push(urls.slice(i, i + concurrency));
  }
  
  for (const chunk of chunks) {
    const promises = chunk.map(async (url) => {
      const colors = await extractDominantColors(url);
      return { url, colors };
    });
    
    const chunkResults = await Promise.all(promises);
    chunkResults.forEach(({ url, colors }) => {
      results.set(url, colors);
    });
  }
  
  return results;
}
```

## Integration Examples

### With Farcaster Auth

```typescript
import { useFarcasterUser } from '@lab/farcaster-auth';
import { extractDominantColors } from '@lab/color-extraction';
import { createBearBrickTokenUri } from '@lab/nft-utils';

function UserProfileNFT() {
  const { user, loading } = useFarcasterUser();
  
  const generateNFT = async () => {
    if (!user?.avatarUrl || !user?.fid) return;
    
    try {
      // Extract colors from avatar
      const colors = await extractDominantColors(user.avatarUrl);
      
      // Generate BearBrick NFT
      const { tokenUri } = createBearBrickTokenUri({
        colors,
        fid: user.fid,
        username: user.username,
      });
      
      // Use tokenUri for minting...
      console.log('Generated NFT:', tokenUri);
    } catch (error) {
      console.error('Failed to generate NFT:', error);
    }
  };
  
  return (
    <button 
      onClick={generateNFT}
      disabled={loading || !user}
    >
      Generate BearBrick NFT
    </button>
  );
}
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

- `@lab/nft-utils` - BearBrick SVG and metadata generation
- `@lab/farcaster-auth` - Farcaster authentication utilities
- `@lab/core` - Core utilities and shared types