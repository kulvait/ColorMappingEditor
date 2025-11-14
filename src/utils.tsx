import chroma from 'chroma-js';
import { Color, INVALID_COLOR } from './types';  // import types & constants

export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

type ColorInput =
  | string
  | { r: number; g: number; b: number; a?: number }
  | { h: number; s: number; v: number; a?: number }

export const hexToColor = (hex: ColorInput): Color => {
  if (!chroma.valid(hex)) {
    console.error('Invalid color:', hex);
    return INVALID_COLOR;
  }else
  {
    return chromaColorToColor(chroma(hex));
  }
};

/* eslint-disable @typescript-eslint/no-unsafe-call,
   @typescript-eslint/no-unsafe-member-access,
   @typescript-eslint/no-unsafe-assignment */
const chromaColorToColor = (tcolor): Color => {
  if (!chroma.valid(tcolor)) {
    return INVALID_COLOR;
  } else {
    const rgb = tcolor.rgb();
    const hsv = tcolor.hsv();
    const dark = tcolor.luminance() < 0.5;
    return {
      rgb: {r: rgb[0], g: rgb[1], b: rgb[2]},
      hsv: {h: hsv[0], s: hsv[1], v: hsv[2]},
      hex: tcolor.hex(),
      isDark: dark,
    };
  }
};
/* eslint-enable @typescript-eslint/no-unsafe-call,
   @typescript-eslint/no-unsafe-member-access,
   @typescript-eslint/no-unsafe-assignment */
