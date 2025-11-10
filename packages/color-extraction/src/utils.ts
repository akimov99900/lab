import type { ColorPair, ExtractionOptions } from './types';

const DEFAULT_PRIMARY = '#6B7280';
const DEFAULT_SECONDARY = '#D1D5DB';

export function getDefaultColors(
  fallbackPrimary?: string,
  fallbackSecondary?: string
): ColorPair {
  return {
    primary: fallbackPrimary || DEFAULT_PRIMARY,
    secondary: fallbackSecondary || DEFAULT_SECONDARY,
  };
}

export async function fetchImageAsBuffer(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  return response.arrayBuffer();
}

export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(color);
}

export function normalizeImageInput(
  options: ExtractionOptions
): ArrayBuffer | null {
  if (options.buffer) {
    return options.buffer;
  }
  return null;
}
