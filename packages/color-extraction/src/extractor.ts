import Vibrant from 'node-vibrant';
import type { ColorPair, ExtractionOptions } from './types';
import {
  getDefaultColors,
  fetchImageAsBuffer,
  isValidHexColor,
} from './utils';

async function extractColorsInternal(
  buffer: ArrayBuffer
): Promise<ColorPair | null> {
  try {
    const uint8Array = new Uint8Array(buffer);
    const vibrant = new Vibrant(uint8Array);
    const palette = await vibrant.getPalette();

    const dominant = palette.Vibrant || palette.Muted;
    const secondary =
      palette.DarkVibrant || palette.LightVibrant || palette.DarkMuted;

    if (!dominant || !secondary) {
      return null;
    }

    const primaryColor = dominant.hex;
    const secondaryColor = secondary.hex;

    if (isValidHexColor(primaryColor) && isValidHexColor(secondaryColor)) {
      return {
        primary: primaryColor,
        secondary: secondaryColor,
      };
    }

    return null;
  } catch {
    return null;
  }
}

export async function extractColors(
  options: ExtractionOptions
): Promise<ColorPair> {
  let buffer: ArrayBuffer | null = null;

  if (options.buffer) {
    buffer = options.buffer;
  } else if (options.url) {
    try {
      buffer = await fetchImageAsBuffer(options.url);
    } catch {
      return getDefaultColors(
        options.fallbackPrimary,
        options.fallbackSecondary
      );
    }
  } else {
    return getDefaultColors(
      options.fallbackPrimary,
      options.fallbackSecondary
    );
  }

  if (!buffer) {
    return getDefaultColors(
      options.fallbackPrimary,
      options.fallbackSecondary
    );
  }

  const colors = await extractColorsInternal(buffer);
  if (colors) {
    return colors;
  }

  return getDefaultColors(options.fallbackPrimary, options.fallbackSecondary);
}

export async function extractColorsFromUrl(
  url: string,
  fallbackPrimary?: string,
  fallbackSecondary?: string
): Promise<ColorPair> {
  return extractColors({
    url,
    fallbackPrimary,
    fallbackSecondary,
  });
}

export async function extractColorsFromBuffer(
  buffer: ArrayBuffer,
  fallbackPrimary?: string,
  fallbackSecondary?: string
): Promise<ColorPair> {
  return extractColors({
    buffer,
    fallbackPrimary,
    fallbackSecondary,
  });
}
