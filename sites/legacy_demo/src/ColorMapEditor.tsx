import React, {useEffect, useRef, useState} from 'react';

import type {Color} from 'color-mapping-editor';
import {hexToColor} from 'color-mapping-editor';

import './ColorMapEditor.css';

// The interpolation method options (adjust if your enum differs)
// Will be subset of the VTK enum values:
// #define VTK_CTF_RGB 0
// #define VTK_CTF_HSV 1
// #define VTK_CTF_LAB 2
// #define VTK_CTF_DIVERGING 3
// #define VTK_CTF_LAB_CIEDE2000 4
// #define VTK_CTF_STEP 5
// #define VTK_CTF_PROLAB 6
export enum InterpolationMethod {
  RGB = 'RGB',
  HSV = 'HSV',
  LAB = 'LAB',
}

/** Fallback for invalid colors */
const invalidColor: Color = {
  rgb: {r: 0, g: 0, b: 0},
  hsv: {h: 0, s: 0, v: 0},
  hex: '#000000',
  isDark: false,
};

/** A single color stop in the color map */
export interface ControlPoint {
  /** Full color information */
  color: Color;
  /** Position along the gradient (relative to startRange/endRange) */
  position: number;
}

// Represents the initial color map definition
/** Full color-map definition */
export interface ColorMap {
  /** Ordered list of color stops */
  controlPoints: ControlPoint[];

  /** Interpolation method between color stops */
  interpolationMethod: InterpolationMethod;

  /** Domain range covered by the color map */
  startRange?: number;
  endRange?: number;
}

/** A single color stop in the color map */
interface ControlPointString {
  color: string;
  position: number;
}

interface ColorMapString {
  controlPoints: ControlPointString[];
  interpolationMethod: InterpolationMethod;
  startRange?: number;
  endRange?: number;
}

/** Converts a ColorMapString → ColorMap (parsed color objects) */
export const colorMapStringToColorMap = (map: ColorMapString): ColorMap => {
  return {
    controlPoints: map.controlPoints.map((cp) => {
      const color = hexToColor(cp.color);
      if (color.hex === invalidColor.hex && color.isDark === invalidColor.isDark) {
        console.warn(`Invalid color string "${cp.color}" in ColorMapString; using fallback color.`);
      }
      return {
        position: cp.position,
        color,
      };
    }),
    interpolationMethod: map.interpolationMethod,
    startRange: map.startRange,
    endRange: map.endRange,
  };
};

/** Converts a ColorMap → ColorMapString (string colors only) */
export const colorMapToColorMapString = (map: ColorMap): ColorMapString => {
  return {
    controlPoints: map.controlPoints.map((cp) => ({
      position: cp.position,
      color: cp.color.hex,
    })),
    interpolationMethod: map.interpolationMethod,
    startRange: map.startRange,
    endRange: map.endRange,
  };
};

export interface ColorLookupEntry {
  /** The color assigned to this bin. */
  color: Color;
  /** Lower bound of the bin in the domain (can be absolute or normalized). */
  lowerBound: number;
  /** Center position of the bin. */
  center: number;
  /** Upper bound of the bin in the domain. */
  upperBound: number;
}

/**
 * A lookup table generated from a ColorMap for discrete rendering or classification.
 */
export interface ColorLookupTable {
  ColorLookupEntry: Entries[];
  entryCount: number;
}

/** Options for initializing the ColorMapEditor component */
export interface ColorMapEditorOptions {
  /** The initial color map */
  initialColorMap: ColorMapString;

  /** Show numbers at the color stops */
  showStopNumbers?: boolean;

  /** Whether interpolation methods are editable by the user */
  interpolationMethodsEditable?: boolean;

  /** Whether the bin selector (for discrete gradients) is editable */
  binSelectorEditable?: boolean;

  /** Size of the control points in pixels */
  controlPointSize?: number;

  /** Width of the editor in pixels */
  width: number;

  /** Height of the editor in pixels */
  height: number;

  /** Callback when the color map changes */
  onChange?: (colorMap: ColorMap) => void;
}

const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

const defaultOptions: ColorMapEditorOptions = {
  initialColorMap: {
    controlPoints: [
      //      { position: 0, color: 'green' },
      //      { position: 0.5, color: 'yellow' },
      //      { position: 1, color: 'red' },
      {position: 0, color: 'blue'},
      {position: 1, color: 'red'},
    ],
    interpolationMethod: InterpolationMethod.RGB,
    startRange: 0, // optional
    endRange: 1, // optional
  },
  showStopNumbers: false,
  interpolationMethodsEditable: true,
  binSelectorEditable: true,
  controlPointSize: 7,
  width: 353,
  height: 50,
};

const getColorMapGradient = (colorMap: ColorMap): string => {
  if (!colorMap.controlPoints.length) return '';

  // Build gradient stops
  const stops = colorMap.controlPoints.map((cp) => {
    return `${cp.color.hex} ${cp.position * 100}%`;
  });

  var colorSpace: string;
  switch (colorMap.interpolationMethod) {
    case InterpolationMethod.HSV:
      colorSpace = 'hsl'; // Equivalent to HSV in CSS
      break;
    case InterpolationMethod.RGB:
      colorSpace = 'srgb'; // Use RGB in srgb color space
      break;
    case InterpolationMethod.LAB:
      colorSpace = 'oklab'; // CSS supports oklab, a good approximation for LAB
      break;
    default:
      colorSpace = 'srgb';
  }

  // Return linear-gradient string
  return `linear-gradient(in ${colorSpace} to right, ${stops.join(', ')})`;
};

const ColorMapEditor: React.FC<Partial<ColorMapEditorOptions>> = ({
  width = defaultOptions.width,
  height = defaultOptions.height,
  showStopNumbers = defaultOptions.showStopNumbers,
  interpolationMethodsEditable = defaultOptions.interpolationMethodsEditable,
  binSelectorEditable = defaultOptions.binSelectorEditable,
  controlPointSize = defaultOptions.controlPointSize,
  initialColorMap = defaultOptions.initialColorMap,
  onChange,
}) => {
  // State to hold the current color map
  const initiaalCM = colorMapStringToColorMap(initialColorMap);
  const [colorMap, setColorMap] = useState<ColorMap>(initiaalCM);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Effect to render the color map on the canvas
  useEffect(() => {
    if (onChange && typeof onChange === 'function') {
      onChange(colorMap);
      console.log('ColorMapEditor: onChange called with colorMap:', colorMap);
    }
  }, [colorMap, onChange]);

  return (
    <div className="color-map-editor-react-root" style={{width: `${width}px`, height: `${height}px`}}>
      {/* Strip with actual interpolation */}
      <div
        className="color-map-editor-react-canvas-area"
        ref={canvasRef}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          background: getColorMapGradient(colorMap),
        }}
        title="Actual color map"
      ></div>
    </div>
  );
};

export default ColorMapEditor;
