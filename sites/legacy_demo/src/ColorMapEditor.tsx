import React, {useEffect, useRef, useState} from 'react';
import {ColorPicker} from 'color-mapping-editor';
import type {Color} from 'color-mapping-editor';
import {hexToColor} from 'color-mapping-editor';
import {INVALID_COLOR} from 'color-mapping-editor';
import {ColorInterpolation} from 'color-mapping-editor';

import chroma from 'chroma-js';

import './ColorMapEditor.css';

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
  interpolationMethod: ColorInterpolation;

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
  interpolationMethod: ColorInterpolation;
  startRange?: number;
  endRange?: number;
}

export function getColorAtPosition(colorMap: ColorMap, position: number): Color {
  const {controlPoints, interpolationMethod, startRange = 0, endRange = 1} = colorMap;

  if (!controlPoints || controlPoints.length === 0) {
    return '#000000'; // fallback
  }

  // Normalize position to [0,1] range of the gradient
  const t = (position - startRange) / (endRange - startRange === 0 ? 1 : endRange - startRange);

  // Clamp
  const u = Math.min(1, Math.max(0, t));

  // If only one stop → trivial case
  if (controlPoints.length === 1) {
    console.log('Find color of ', controlPoints[0].color);
    return controlPoints[0].color;
  }

  console.log(controlPoints);

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
  const mode = interpolationMethod.toLowerCase(); // "rgb", "lab", "hsl", etc.

  return hexToColor(chroma.mix(colors[0].hex, colors[1].hex, localT, mode).hex());
}

/** Converts a ColorMapString → ColorMap (parsed color objects) */
export const colorMapStringToColorMap = (map: ColorMapString): ColorMap => {
  return {
    controlPoints: map.controlPoints.map((cp) => {
      const color = hexToColor(cp.color);
      if (color.hex === INVALID_COLOR.hex && color.isDark === INVALID_COLOR.isDark) {
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
  stripHeight: number;

  showRuler: boolean;

  /** Callback when the color map changes */
  onChange?: (colorMap: ColorMap) => void;
}

const defaultOptions: ColorMapEditorOptions = {
  initialColorMap: {
    controlPoints: [
      {position: 0, color: 'green'},
      {position: 0.5, color: 'yellow'},
      {position: 1, color: 'red'},
      // {position: 0, color: 'blue'},
      // {position: 1, color: 'red'},
    ],
    interpolationMethod: ColorInterpolation.LAB,
    startRange: 0, // optional
    endRange: 1, // optional
  },
  showStopNumbers: false,
  interpolationMethodsEditable: true,
  binSelectorEditable: true,
  controlPointSize: 7,
  width: 500,
  stripHeight: 50,
  showRuler: true,
};

const getColorMapGradient = (colorMap: ColorMap): string => {
  if (!colorMap.controlPoints.length) return '';

  // Build gradient stops
  const stops = colorMap.controlPoints.map((cp) => {
    return `${cp.color.hex} ${cp.position * 100}%`;
  });

  let colorSpace: string;
  switch (colorMap.interpolationMethod) {
    case ColorInterpolation.HSV:
      colorSpace = 'hsl'; // Equivalent to HSV in CSS
      break;
    case ColorInterpolation.RGB:
      colorSpace = 'srgb'; // Use RGB in srgb color space
      break;
    case ColorInterpolation.LAB:
      colorSpace = 'oklab'; // CSS supports oklab, a good approximation for LAB
      break;
    default:
      colorSpace = 'srgb';
  }

  // Return linear-gradient string
  return `linear-gradient(in ${colorSpace} to right, ${stops.join(', ')})`;
};

function computeCommonExponent(start: number, end: number, zeroExponentRange: [number, number] = [-2, 2]) {
  const maxAbs = Math.max(Math.abs(start), Math.abs(end));
  if (maxAbs === 0) return 0;

  const exponent = Math.floor(Math.log10(maxAbs));

  // Only use exponent if outside the normal range (-2 to 2) for more readable ticks
  if (exponent >= zeroExponentRange[0] && exponent <= zeroExponentRange[1]) return 0;

  return exponent;
}

function formatSmart(value: number): string {
  if (value === 0) return '0';
  const exponent = computeCommonExponent(value, value, [0, 0]);

  if (exponent > 1) {
    return value.toFixed(0);
  } else if (exponent == 0) {
    return value.toFixed(1);
  } else {
    return value.toFixed(-exponent);
  }
}

function renderRulerTicksNormalized(start: number, end: number, steps: number) {
  const exponent = computeCommonExponent(start, end);
  const factor = Math.pow(10, exponent);
  const ticks = [];
  const stepSize = (end - start) / (steps - 1);

  for (let i = 0; i < steps; i++) {
    const value = start + stepSize * i;
    const normalized = value / factor;
    ticks.push(
      <div key={i} className="color-map-editor-react-ruler-tick-wrapper" style={{left: `${(i / (steps - 1)) * 100}%`}}>
        <div className="color-map-editor-react-ruler-tick"></div>
        <div className="color-map-editor-react-ruler-label">{formatSmart(normalized)}</div>
      </div>
    );
  }

  return {ticks, exponent};
}

const ColorMapEditor: React.FC<Partial<ColorMapEditorOptions>> = ({
  width = defaultOptions.width,
  stripHeight = defaultOptions.stripHeight,
  showStopNumbers = defaultOptions.showStopNumbers,
  interpolationMethodsEditable = defaultOptions.interpolationMethodsEditable,
  binSelectorEditable = defaultOptions.binSelectorEditable,
  controlPointSize = defaultOptions.controlPointSize,
  initialColorMap = defaultOptions.initialColorMap,
  showRuler = defaultOptions.showRuler,
  onChange,
}) => {
  // State to hold the current color map
  const initiaalCM = colorMapStringToColorMap(initialColorMap);
  const [colorMap, setColorMap] = useState<ColorMap>(initiaalCM);
  const canvasRef = useRef<HTMLDivElement>(null);

  //Store picker properties
  const [pickerPointIndex, setPickerPointIndex] = useState<number | null>(null);
  const [pickerPos, setPickerPos] = useState({x: 0, y: 0});
  const [pickerColor, setPickerColor] = useState<Color | null>(null);

  useEffect(() => {
    if (pickerPointIndex === null || pickerColor === null) return;

    setColorMap((prevMap) => {
      const updated = {...prevMap};
      updated.controlPoints = [...prevMap.controlPoints];

      // Update the color of the selected point
      updated.controlPoints[pickerPointIndex] = {
        ...updated.controlPoints[pickerPointIndex],
        color: pickerColor, // store as hex or as object
      };

      return updated;
    });
  }, [pickerColor, pickerPointIndex]);

  // Effect to render the color map on the canvas
  useEffect(() => {
    if (onChange && typeof onChange === 'function') {
      onChange(colorMap);
      console.log('ColorMapEditor: onChange called with colorMap:', colorMap);
    }
  }, [colorMap, onChange]);

  const interpolationOptions = Object.values(ColorInterpolation);
  let rulerHeight = 0;

  let ticks, exponent;
  if (showRuler) {
    rulerHeight = 30;
    ({ticks, exponent} = renderRulerTicksNormalized(colorMap.startRange ?? 0, colorMap.endRange ?? 1, 5));
  }
  const settingsHeight = 30;
  const settingsTopMargin = 10;
  const height = stripHeight + rulerHeight + settingsHeight + settingsTopMargin;

  function handleRemoveIndex(e: React.MouseEvent, index: number) {
    e.preventDefault();

    const cpDiv = e.currentTarget as HTMLDivElement; // the clicked div
    const rect = cpDiv.getBoundingClientRect();

    const isInside =
      e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;

    if (!isInside) return;

    if (colorMap.controlPoints.length < 2) {
      return;
    }

    console.log('Purge index:', index);
    // Right click → remove control point at index
    setColorMap((prev) => ({
      ...prev,
      controlPoints: prev.controlPoints.filter((_, i) => i !== index),
    }));
    setPickerPointIndex(null);
    setPickerColor(null);
    return;
  }

  function handleOnClick(e: React.MouseEvent, index: number) {
    if (moveHandled) {
      setMoveHandled(false);
      return;
    }
    e.stopPropagation();

    const cpDiv = e.currentTarget as HTMLDivElement; // the clicked div
    const rect = cpDiv.getBoundingClientRect();

    const isInside =
      e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;

    if (!isInside) return;

    console.log('Opening color picker at point index:', index);

    // get canvas rect for positioning picker
    const canvasRect = canvasRef.current.getBoundingClientRect();
    setPickerPos({
      x: e.clientX - canvasRect.left,
      y: stripHeight + 8, // below the strip
    });

    setPickerPointIndex(index);
    setPickerColor(colorMap.controlPoints[index].color);
  }

  const lastPointMoveTimeRef = useRef(0);
  const [moveHandled, setMoveHandled] = useState(false);
  const handlePickerMove = (e: React.PointerEvent<HTMLDivElement>, index: number) => {
    if (e.buttons !== 1) return; // only if left button is pressed

    // throttle
    if (e.timeStamp - lastPointMoveTimeRef.current < 16) return;
    lastPointMoveTimeRef.current = e.timeStamp;

    if (!canvasRef.current) return;

    //Compute new position
    const rect = canvasRef.current.getBoundingClientRect();
    let newT = (e.clientX - rect.left) / rect.width;
    newT = Math.max(0, Math.min(1, newT));
    // compute actual position in the colorMap domain
    const start = colorMap.startRange ?? 0;
    const end = colorMap.endRange ?? 1;
    let newPos = start + newT * (end - start);

    // update the colorMap state immutably
    setColorMap((prev) => {
      const newControlPoints = [...prev.controlPoints];
      if (newPos > pointerDownPosRef.current) {
        index = Math.max(...pointerDownIndicesRef.current);
      } else {
        index = Math.min(...pointerDownIndicesRef.current);
      }

      // --- Sanity: force all other points at pointerDownPos to stay at pointerDownPos ---
      pointerDownIndicesRef.current.forEach((i) => {
        if (i !== index) {
          newControlPoints[i] = {
            ...newControlPoints[i],
            position: pointerDownPosRef.current,
          };
        }
      });

      const prevPos = newControlPoints[index].position;
      //Clamp newPos based on neighbors
      const leftNeighbor = colorMap.controlPoints[index - 1];
      const rightNeighbor = colorMap.controlPoints[index + 1];

      // --- NEW LOGIC: clamp outermost points to map range ---
      const minLimit = leftNeighbor ? leftNeighbor.position : start;
      const maxLimit = rightNeighbor ? rightNeighbor.position : end;

      // clamp to allowed range
      newPos = Math.max(minLimit, Math.min(maxLimit, newPos));

      if (newPos === prevPos) return prev; // no change after clamping

      newControlPoints[index] = {
        ...newControlPoints[index],
        position: newPos,
      };
      return {...prev, controlPoints: newControlPoints};
    });
    setMoveHandled(true);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (moveHandled) {
      setMoveHandled(false);
      return;
    }
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    let t = (e.clientX - rect.left) / rect.width;

    // clamp between 0 and 1
    t = Math.max(0, Math.min(1, t));

    // compute actual position in the colorMap domain
    const start = colorMap.startRange ?? 0;
    const end = colorMap.endRange ?? 1;
    const pos = start + t * (end - start);

    console.log('Adding new control point at position:', pos);

    // Add a new control point with color sampled from the gradient at that position
    const colorAtPos = getColorAtPosition(colorMap, pos);

    // find the correct insertion point without sorting
    let insertIndex = colorMap.controlPoints.findIndex((cp) => cp.position > pos);
    if (insertIndex === -1) insertIndex = colorMap.controlPoints.length;

    // update the color map by INSERTING, not sorting
    setColorMap((prev) => {
      const newControlPoints = [
        ...prev.controlPoints.slice(0, insertIndex),
        {
          position: pos,
          color: colorAtPos,
        },
        ...prev.controlPoints.slice(insertIndex),
      ];
      return {
        ...prev,
        controlPoints: newControlPoints,
      };
    });
  };

  const consolidateColorMap = () => {
    setColorMap((prev) => {
      const newControlPoints = [...prev.controlPoints];
      const indicesToRemove: number[] = [];
      const start = prev.startRange ?? 0;
      const end = prev.endRange ?? 1;

      for (let i = 0; i < newControlPoints.length; i++) {
        const current = newControlPoints[i];
        const prevPoint = newControlPoints[i - 1];
        const nextPoint = newControlPoints[i + 1];

        if (current.position === start && nextPoint?.position === start) {
          // Remove duplicates at start: keep last
          indicesToRemove.push(i);
        } else if (current.position === end && prevPoint?.position === end) {
          // Remove duplicates at end: keep first
          indicesToRemove.push(i);
        } else if (
          current.position !== start &&
          current.position !== end &&
          prevPoint?.position === current.position &&
          nextPoint?.position === current.position
        ) {
          // Remove middle duplicates in internal points
          indicesToRemove.push(i);
        }
      }

      // Remove indices in descending order to avoid reindexing issues
      indicesToRemove.sort((a, b) => b - a).forEach((i) => newControlPoints.splice(i, 1));

      return {...prev, controlPoints: newControlPoints};
    });
  };

  const [isDragging, setIsDragging] = useState(false);
  const pointerDownPosRef = useRef(null);
  const pointerDownIndicesRef = useRef([]);
  return (
    <div className="color-map-editor-react-root" style={{width: `${width}px`, height: `${height}px`}}>
      {/* Strip with actual interpolation */}
      <div
        className="color-map-editor-react-canvas-area"
        ref={canvasRef}
        style={{
          width: `${width}px`,
          height: `${stripHeight}px`,
          background: getColorMapGradient(colorMap),
        }}
        title="Actual color map"
        onClick={handleCanvasClick}
      >
        {/* Render control points inside canvas */}
        {colorMap.controlPoints.map((cp, index) => {
          const t =
            (cp.position - (colorMap.startRange ?? 0)) / ((colorMap.endRange ?? 1) - (colorMap.startRange ?? 0) || 1);
          const pointColor = getColorAtPosition(colorMap, t);
          const isDark = pointColor.isDark;
          return (
            <div
              key={index}
              className={`${isDark ? 'color-map-editor-react-picker-white' : 'color-map-editor-react-picker-black'}`}
              style={{
                left: `${t * width}px`,
                background: `${pointColor.hex}`,
                ...(isDragging ? {cursor: 'none'} : {}),
              }}
              onClick={(e) => handleOnClick(e, index)}
              onPointerDown={(e) => {
                e.preventDefault();
                e.currentTarget.setPointerCapture(e.pointerId);
                const pos = colorMap.controlPoints[index].position;
                pointerDownPosRef.current = pos;
                pointerDownIndicesRef.current = colorMap.controlPoints
                  .map((p, i) => [p, i]) // keep both
                  .filter(([p]) => p.position === pos) // filter by p
                  .map(([_, i]) => i); // extract index
                setIsDragging(true); // start hiding cursor
              }}
              onPointerMove={(e) => {
                handlePickerMove(e, index);
              }}
              onPointerUp={(e) => {
                e.preventDefault();
                e.currentTarget.releasePointerCapture(e.pointerId);
                setIsDragging(false); // restore cursor
                consolidateColorMap();
              }}
              onContextMenu={(e) => handleRemoveIndex(e, index)}
              title={`Index: ${index}, Position: ${formatSmart(cp.position)}, Color: ${pointColor.hex}`}
            />
          );
        })}
      </div>

      {/* Ruler */}
      {showRuler && (
        <div className="color-map-editor-react-ruler" style={{width: `${width}px`}}>
          {ticks}
          {exponent !== 0 && (
            <div className="color-map-editor-react-ruler-multiplier">
              ×10<sup>{exponent}</sup>
            </div>
          )}
        </div>
      )}

      {/*Color picker*/}
      {pickerPointIndex !== null && pickerColor && (
        <div
          style={{
            position: 'absolute',
            left: pickerPos.x,
            top: pickerPos.y,
            zIndex: 100,
          }}
        >
          <ColorPicker
            key={pickerPointIndex} //Forces remount
            initHexColor={pickerColor.hex}
            onChange={(newColor) => {
              setPickerColor(newColor); // update picker preview
            }}
            onConfirm={(newColor) => {
              // Update the actual color in your colorMap.controlPoints
              setPickerColor(newColor);
              setPickerPointIndex(null); // close picker
            }}
          />
        </div>
      )}

      {/* Settings panel */}
      <div
        className="color-map-editor-react-settings"
        style={{
          display: 'flex',
          flexFlow: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <label className="color-map-editor-react-interpolation-method-label">
          Interpolation:{' '}
          <select
            className="color-map-editor-react-interpolation-method-select"
            value={colorMap.interpolationMethod}
            onChange={(e) =>
              setColorMap((prev) => ({
                ...prev,
                interpolationMethod: e.target.value as ColorInterpolation,
              }))
            }
          >
            {interpolationOptions.map((method) => (
              <option key={method} className="color-map-editor-react-interpolation-method-option" value={method}>
                {method}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
};

export default ColorMapEditor;
