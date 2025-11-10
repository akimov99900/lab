export interface VibrantColor {
  hex: string;
}

export interface VibrantPalette {
  Vibrant?: VibrantColor;
  LightVibrant?: VibrantColor;
  DarkVibrant?: VibrantColor;
  Muted?: VibrantColor;
  LightMuted?: VibrantColor;
  DarkMuted?: VibrantColor;
}

export interface ExtractedColors {
  primary: string;
  secondary: string;
}