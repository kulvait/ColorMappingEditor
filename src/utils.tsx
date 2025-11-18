import chroma from 'chroma-js';
import {Color, ColorMap, ColorMapString, INVALID_COLOR} from './types'; // import types & constants

export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

type ColorInput =
  | string
  | {r: number; g: number; b: number; a?: number}
  | {h: number; s: number; v: number; a?: number};

export const hexToColor = (hex: ColorInput): Color => {
  if (!chroma.valid(hex)) {
    console.error('Invalid color:', hex);
    return INVALID_COLOR;
  } else {
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


//Helper for ColorMapEditor
type ChromaInterpolationMode =
  | "rgb"
  | "hsv"
  | "lab"
  | "hcl"
  | "hsi"
  | "hsl"
  | "lch"
  | "lrgb"
  | "oklab"
  | "oklch";
export function getColorAtPosition(colorMap: ColorMap, position: number): Color {
  const {controlPoints, interpolationMethod, startRange = 0, endRange = 1} = colorMap;

  if (!controlPoints || controlPoints.length === 0) {
    return INVALID_COLOR;
  }

  // Normalize position to [0,1] range of the gradient
  const t = (position - startRange) / (endRange - startRange === 0 ? 1 : endRange - startRange);

  // Clamp
  const u = Math.min(1, Math.max(0, t));

  // If only one stop → trivial case
  if (controlPoints.length === 1) {
    return controlPoints[0].color;
  }

  // Find surrounding control points
  let left = controlPoints[0];
  let right = controlPoints[controlPoints.length - 1];

  for (let i = 0; i < controlPoints.length - 1; i++) {
    const a = controlPoints[i];
    const b = controlPoints[i + 1];

    if (u >= a.position && u <= b.position) {
      left = a;
      right = b;
      break;
    }
  }
  // Normalize between local interval
  const localT = (u - left.position) / (right.position - left.position === 0 ? 1 : right.position - left.position);
  const colors = [left.color, right.color];

  // Pick chroma interpolation mode
  const mode = interpolationMethod.toLowerCase() as ChromaInterpolationMode; // "rgb", "hsv" or "lab" are implemented
  return hexToColor(chroma.mix(colors[0].hex, colors[1].hex, localT, mode).hex());
}

/** Converts a ColorMapString → ColorMap (parsed color objects) */
export const colorMapStringToColorMap = (color_map_string: ColorMapString): ColorMap => {
  return {
    controlPoints: color_map_string.controlPoints.map((cp) => {
      const color = hexToColor(cp.color);
      if (color.hex === INVALID_COLOR.hex && color.isDark === INVALID_COLOR.isDark) {
        console.warn(`Invalid color string "${cp.color}" in ColorMapString; using fallback color.`);
      }
      return {
        position: cp.position,
        color,
      };
    }),
    interpolationMethod: color_map_string.interpolationMethod,
    startRange: color_map_string.startRange ?? 0, // default to 0
    endRange: color_map_string.endRange ?? 1,     // default to 1
  };
};

/** Converts a ColorMap → ColorMapString (string colors only) */
export const colorMapToColorMapString = (color_map: ColorMap): ColorMapString => {
  return {
    controlPoints: color_map.controlPoints.map((cp) => ({
      position: cp.position,
      color: cp.color.hex,
    })),
    interpolationMethod: color_map.interpolationMethod,
    startRange: color_map.startRange,
    endRange: color_map.endRange,
  };
};
