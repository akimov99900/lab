# @lab/color-extraction

Extract representative colors from avatar images using the Vibrant color extraction library.

## Installation

```bash
pnpm add @lab/color-extraction
```

## Features

- Extract primary and secondary colors from avatar images
- Support for both URL and ArrayBuffer inputs
- Deterministic fallback colors when extraction fails or image is unavailable
- Browser and Node.js compatible
- TypeScript support with full type definitions

## Usage

### Basic Usage with URL

```typescript
import { extractColorsFromUrl } from '@lab/color-extraction';

const colors = await extractColorsFromUrl(
  'https://example.com/avatar.png'
);

console.log(colors.primary);     // e.g., '#FF5733'
console.log(colors.secondary);   // e.g., '#33B5FF'
```

### Using ArrayBuffer (Browser)

```typescript
import { extractColorsFromBuffer } from '@lab/color-extraction';

// Get image data from File input or fetch
const file = new File([...], 'avatar.png', { type: 'image/png' });
const buffer = await file.arrayBuffer();

const colors = await extractColorsFromBuffer(buffer);
console.log(colors);
```

### Using ArrayBuffer (Node.js)

```typescript
import { extractColorsFromBuffer } from '@lab/color-extraction';
import { readFile } from 'fs/promises';

const imageData = await readFile('./avatar.png');
const buffer = imageData.buffer.slice(
  imageData.byteOffset,
  imageData.byteOffset + imageData.byteLength
);

const colors = await extractColorsFromBuffer(buffer);
console.log(colors);
```

### Generic Extraction with Options

```typescript
import { extractColors } from '@lab/color-extraction';

const colors = await extractColors({
  url: 'https://example.com/avatar.png',
  fallbackPrimary: '#6B7280',
  fallbackSecondary: '#D1D5DB',
});
```

### Custom Fallback Colors

When color extraction fails or the avatar is unavailable, the library returns deterministic fallback colors:

```typescript
import { extractColorsFromUrl } from '@lab/color-extraction';

const colors = await extractColorsFromUrl(
  'https://example.com/missing-avatar.png',
  '#FF6B6B',  // Custom primary fallback
  '#4ECDC4'   // Custom secondary fallback
);

// If extraction fails, returns the custom fallback colors
```

### Utility Functions

```typescript
import { getDefaultColors, normalizeImageInput } from '@lab/color-extraction';

// Get default fallback colors
const defaults = getDefaultColors();
console.log(defaults); // { primary: '#6B7280', secondary: '#D1D5DB' }

// Get custom defaults
const custom = getDefaultColors('#111111', '#222222');
console.log(custom); // { primary: '#111111', secondary: '#222222' }

// Normalize image input
const buffer = new ArrayBuffer(8);
const normalized = normalizeImageInput({ buffer });
console.log(normalized === buffer); // true
```

## API Reference

### Types

#### `ColorPair`

```typescript
interface ColorPair {
  primary: string;    // Hex color code for primary color (e.g., '#FF5733')
  secondary: string;  // Hex color code for secondary color (e.g., '#33B5FF')
}
```

#### `ExtractionOptions`

```typescript
interface ExtractionOptions {
  url?: string;                  // Image URL to extract colors from
  buffer?: ArrayBuffer;          // Image data as ArrayBuffer
  fallbackPrimary?: string;      // Fallback primary color (hex format)
  fallbackSecondary?: string;    // Fallback secondary color (hex format)
}
```

### Functions

#### `extractColors(options: ExtractionOptions): Promise<ColorPair>`

Extracts colors from an image specified by URL or buffer. Returns fallback colors if extraction fails.

#### `extractColorsFromUrl(url: string, fallbackPrimary?: string, fallbackSecondary?: string): Promise<ColorPair>`

Convenience function to extract colors from a URL with optional custom fallback colors.

#### `extractColorsFromBuffer(buffer: ArrayBuffer, fallbackPrimary?: string, fallbackSecondary?: string): Promise<ColorPair>`

Convenience function to extract colors from an ArrayBuffer with optional custom fallback colors.

#### `getDefaultColors(fallbackPrimary?: string, fallbackSecondary?: string): ColorPair`

Returns the default fallback colors (or custom ones if provided).

#### `normalizeImageInput(options: ExtractionOptions): ArrayBuffer | null`

Normalizes image input, extracting the ArrayBuffer if present, otherwise returns null.

## Error Handling

The library handles errors gracefully:

- **Invalid URL**: Returns default fallback colors
- **Network errors**: Returns default fallback colors
- **Invalid image data**: Returns default fallback colors
- **Extraction failure**: Returns default fallback colors

No exceptions are thrown during color extraction; fallback colors are always returned.

## Default Fallback Colors

If no custom fallback colors are specified:

- **Primary**: `#6B7280` (Gray)
- **Secondary**: `#D1D5DB` (Light Gray)

## Browser and Node.js Compatibility

This package works in both environments:

- **Browser**: Supports `fetch` API and `File` objects
- **Node.js**: Uses `fetch` for URLs and native `ArrayBuffer` handling

## Development

Build the package:

```bash
pnpm build
```

Run tests:

```bash
pnpm test
```

## License

MIT
