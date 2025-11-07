import React, {useEffect, useRef, useState} from 'react';
import {ColorPicker} from 'color-mapping-editor';
import tinycolor from 'tinycolor2';

import './ColorPickerReact.css';

interface RGB {
  r: number;
  g: number;
  b: number;
}
interface HSV {
  h: number;
  s: number;
  v: number;
}
interface Color {
  rgb: RGB;
  hsv: HSV;
  hex: string;
}

const hexToColor = (hex: string): Color => {
  const color = tinycolor(hex);
  if (!color.isValid()) {
    console.error('Invalid hex color:', hex);
    return {rgb: {r: 0, g: 0, b: 0}, hsv: {h: 0, s: 0, v: 0}, hex: '#000000'};
  } else {
    const rgb = color.toRgb();
    const hsv = color.toHsv();
    return {rgb: {r: rgb.r, g: rgb.g, b: rgb.b}, hsv: {h: hsv.h, s: hsv.s, v: hsv.v}, hex: color.toHexString()};
  }
};

const ColorPickerReact = ({height = 256, initHexColor = '#ff0000'}) => {
  const initColor = tinycolor(initHexColor).isValid() ? hexToColor(initHexColor) : hexToColor('#ff0000');
  const [color, setColor] = useState<Color>(initColor);

  const [width, setWidth] = useState(1.5 * height); // Width is 1.5 times height
  const cpRef = useRef(null);

  // Handlers for HSV changes
  const handleHChange = (value: number) => {
    const newHSV = {...color.hsv, h: value};
    const newHex = tinycolor(newHSV).toHexString();
    const newRGB = tinycolor(newHSV).toRgb();
    setColor({hsv: newHSV, rgb: newRGB, hex: newHex});
  };

  const handleSChange = (value: number) => {
    const newHSV = {...color.hsv, s: value / 100};
    const newHex = tinycolor(newHSV).toHexString();
    const newRGB = tinycolor(newHSV).toRgb();
    setColor({hsv: newHSV, rgb: newRGB, hex: newHex});
  };

  const handleVChange = (value: number) => {
    const newHSV = {...color.hsv, v: value / 100};
    const newHex = tinycolor(newHSV).toHexString();
    const newRGB = tinycolor(newHSV).toRgb();
    setColor({hsv: newHSV, rgb: newRGB, hex: newHex});
  };

  // Handlers for RGB changes
  const handleRChange = (value: number) => {
    const newRGB = {...color.rgb, r: value};
    const newHex = tinycolor(newRGB).toHexString();
    const newHSV = tinycolor(newRGB).toHsv();
    setColor({hsv: newHSV, rgb: newRGB, hex: newHex});
  };

  const handleGChange = (value: number) => {
    const newRGB = {...color.rgb, g: value};
    const newHex = tinycolor(newRGB).toHexString();
    const newHSV = tinycolor(newRGB).toHsv();
    setColor({hsv: newHSV, rgb: newRGB, hex: newHex});
  };

  const handleBChange = (value: number) => {
    const newRGB = {...color.rgb, b: value};
    const newHex = tinycolor(newRGB).toHexString();
    const newHSV = tinycolor(newRGB).toHsv();
    setColor({hsv: newHSV, rgb: newRGB, hex: newHex});
  };

  return (
    <div
      className="color-picker-react-root relative border border-red-500 bg-base-100"
      style={{width: `${width}px`, height: `${height}px`}}
    >
      {/* SL Picker */}
      <div
        className="color-picker-react-sl-picker absolute top-0 left-0 border border-gray-400 rounded-sm"
        style={{width: `${0.66 * width}px`, height: `${height}px`}}
      >
        <div
          className="color-picker-react-sl-placeholder w-full h-full flex items-center justify-center"
          style={{
            backgroundImage: `
	linear-gradient(to right, rgba(255,255,255,1), hsl(${color.hsv.h}, 100%, 50%)),
	linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0))
      `,
            backgroundBlendMode: 'multiply',
          }}
        >
          SL Picker
        </div>
      </div>

      {/* H Picker */}
      <div
        className="color-picker-react-h-picker absolute top-0 right-0 border border-gray-400 color-picker-react-hue-vertical"
        style={{width: '20px', height: `${height}px`, left: `${0.66 * width + 4}px`}}
      ></div>

      {/* Input / Preview Form */}
      <div
        className="absolute top-0 flex flex-col gap-2"
        style={{
          left: `${0.66 * width + 28}px`,
          width: `${width - (0.66 * width + 28)}px`,
          height: `${height}px`,
          padding: '2px',
        }}
      >
        {/* Placeholder inputs */}
        <div className="flex flex-col gap-2">
          {/* Color Preview */}
          <div
            className="color-picker-react-preview w-15 h-6 border border-gray-500 rounded-sm"
            style={{backgroundColor: color.hex}}
          ></div>
          {/* H Input */}{' '}
          <div className="color-picker-react-h-input-div w-15 h-6 flex items-center justify-between text-xs">
            {' '}
            <span>H</span>{' '}
            <input
              type="number"
              className="color-picker-react-h-input border border-gray-400 w-12 h-6 rounded-sm text-right"
              min={0}
              max={360}
              value={Math.round(color.hsv.h)}
              onChange={(e) => handleHChange(Number(e.target.value))}
            />{' '}
          </div>
          {/* S Input */}
          <div className="color-picker-react-s-input-div w-15 h-6 flex items-center justify-between text-xs">
            <span>S</span>
            <input
              type="number"
              className="color-picker-react-s-input border border-gray-400 w-12 h-6 rounded-sm text-xs text-right"
              min={0}
              max={100}
              value={Math.round(color.hsv.s * 100)}
              onChange={(e) => handleSChange(Number(e.target.value))}
            />
          </div>
          {/* V Input */}
          <div className="color-picker-react-v-input-div w-15 h-6 flex items-center justify-between text-xs">
            <span>V</span>
            <input
              type="number"
              className="color-picker-react-v-input border border-gray-400 w-12 h-6 rounded-sm text-xs text-right"
              min={0}
              max={100}
              value={Math.round(color.hsv.v * 100)}
              onChange={(e) => handleVChange(Number(e.target.value))}
            />
          </div>
          {/* R Input */}
          <div className="color-picker-react-r-input-div w-15 h-6 flex items-center justify-between text-xs">
            <span>R</span>
            <input
              type="number"
              className="color-picker-react-r-input border border-gray-400 w-12 h-6 rounded-sm text-xs text-right"
              min={0}
              max={255}
              value={color.rgb.r}
              onChange={(e) => handleRChange(Number(e.target.value))}
            />
          </div>
          {/* G Input */}
          <div className="color-picker-react-g-input-div w-15 h-6 flex items-center justify-between text-xs">
            <span>G</span>
            <input
              type="number"
              className="color-picker-react-g-input border border-gray-400 w-12 h-6 rounded-sm text-xs text-right"
              min={0}
              max={255}
              value={color.rgb.g}
              onChange={(e) => handleGChange(Number(e.target.value))}
            />
          </div>
          {/* B Input */}
          <div className="color-picker-react-b-input-div w-15 h-6 flex items-center justify-between text-xs">
            <span>B</span>
            <input
              type="number"
              className="color-picker-react-b-input border border-gray-400 w-12 h-6 rounded-sm text-xs text-right"
              min={0}
              max={255}
              value={color.rgb.b}
              onChange={(e) => handleBChange(Number(e.target.value))}
            />
          </div>
          {/* Hex Input */}
          <label className="flex items-center text-xs mt-2">
            <input
              className="color-picker-react-hex-input border border-gray-400 rounded-sm ml-1 px-1 w-16 text-xs"
              type="text"
              maxLength={7}
              value={color.hex}
              readOnly
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default ColorPickerReact;
