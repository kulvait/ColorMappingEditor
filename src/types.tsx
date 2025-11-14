import chroma from 'chroma-js';

export type ChromaColor = ReturnType<typeof chroma>;

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSV {
  h: number;
  s: number;
  v: number;
}

export interface Color {
  rgb: RGB;
  hsv: HSV;
  hex: string;
  isDark: boolean;
}

/** Fallback for invalid colors */
export const INVALID_COLOR: Color = {
  rgb: {r: 0, g: 0, b: 0},
  hsv: {h: 0, s: 0, v: 0},
  hex: '#000000',
  isDark: false,
};

// Corresponding to VTK constants:
// #define VTK_CTF_RGB 0
// #define VTK_CTF_HSV 1
// #define VTK_CTF_LAB 2
export enum ColorInterpolation {
  RGB = 'RGB',
  HSV = 'HSV',
  LAB = 'LAB',
}
