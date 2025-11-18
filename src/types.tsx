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

/** A single color control point in the color map */
/** Include color and position along the gradient (relative to startRange/endRange) */
export interface ControlPoint {
  color: Color;
  position: number;
}

/** Full color-map specification */
/** Contains ordered list of color stops, interpolation and range */
export interface ColorMap {
  controlPoints: ControlPoint[];
  interpolationMethod: ColorInterpolation;
  startRange: number;
  endRange: number;
}

/** A single color stop in the color map */
export interface ControlPointString {
  color: string;
  position: number;
}

/** Full color-map specification with colors as strings */
export interface ColorMapString {
  controlPoints: ControlPointString[];
  interpolationMethod: ColorInterpolation;
  startRange?: number;
  endRange?: number;
}
