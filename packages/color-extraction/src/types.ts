export interface ColorPair {
  primary: string;
  secondary: string;
}

export interface ExtractionOptions {
  url?: string;
  buffer?: ArrayBuffer;
  fallbackPrimary?: string;
  fallbackSecondary?: string;
}
