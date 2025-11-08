import React, {useEffect, useRef, useState} from 'react';
import tinycolor from 'tinycolor2';

import './ColorPicker.css';

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

const ColorPicker = ({height = 256, initHexColor = '#ff0000'}) => {
  const initColor = tinycolor(initHexColor).isValid() ? hexToColor(initHexColor) : hexToColor('#ff0000');
  const [color, setColor] = useState<Color>(initColor);
  const hAreaDivRef = useRef(null);
  const slAreaDivRef = useRef(null);

  //Put it in Rem  = 16px
  const hueGap = 3;
  const hueWidth = 16;
  const inputGap = 3;
  const inputWidth = 75;
  const width = height + hueGap + hueWidth + inputGap + inputWidth;

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

  const handleSLClick = (event) => {
    const areaDiv = slAreaDivRef.current; // Get the current div
    if (!areaDiv) return; // Early return if ref is not assigned

    const rect = areaDiv.getBoundingClientRect(); // Get dimensions
    const x = event.clientX - rect.left; // Click position X
    const y = event.clientY - rect.top; // Click position Y
    const s = x / rect.width;
    const v = 1 - y / rect.height;
    const newHSV = {...color.hsv, v: v, s: s};
    const newHex = tinycolor(newHSV).toHexString();
    const newRGB = tinycolor(newHSV).toRgb();
    // Update circle position
    setColor({hsv: newHSV, rgb: newRGB, hex: newHex});
  };

  const handleHClick = (event) => {
    const areaDiv = hAreaDivRef.current; // Get the current div
    if (!areaDiv) return; // Early return if ref is not assigned

    const rect = areaDiv.getBoundingClientRect(); // Get dimensions
    const x = event.clientX - rect.left; // Click position X
    const y = event.clientY - rect.top; // Click position Y
    const h = 360 - (360 * y) / rect.height;
    const newHSV = {...color.hsv, h: h};
    const newHex = tinycolor(newHSV).toHexString();
    const newRGB = tinycolor(newHSV).toRgb();
    // Update circle position
    setColor({hsv: newHSV, rgb: newRGB, hex: newHex});
  };

  useEffect(() => {
    console.log(JSON.stringify(color, null, 2));
  }, [color]); // Only run once when the component mounts

  return (
    <div className="color-picker-react-root" style={{width: `${width}px`, height: `${height}px`}}>
      {/* SL Picker */}
      <div
        className="color-picker-react-sl-area"
        ref={slAreaDivRef}
        onClick={handleSLClick}
        style={{
          backgroundImage: `
          linear-gradient(to right, rgba(255,255,255,1), hsl(${color.hsv.h}, 100%, 50%)),
          linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0))
        `,
          width: `${height}px`,
          height: `${height}px`,
        }}
        title="Adjusts the saturation (horizontal) and brightness/value (vertical) for the current hue."
      >
        <div
          className="color-picker-react-sl-picker"
          style={{
            left: `${100 * color.hsv.s}%`,
            top: `${100 - 100 * color.hsv.v}%`, // invert V for top-origin coordinates
          }}
        ></div>
      </div>

      {/* H Picker */}
      <div
        className="color-picker-react-h-area color-picker-react-hue-vertical"
        ref={hAreaDivRef}
        onClick={handleHClick}
        style={{width: `${hueWidth}px`, height: `${height}px`, left: `${height + hueGap}px`}}
        title="Hue selector: sets the base color tone (0–360° around the color wheel)"
      >
        <div className="color-picker-react-h-picker" style={{top: `${100 - color.hsv.h / 3.6}%`}}></div>
      </div>

      <div
        className="color-picker-react-input-panel"
        style={{
          left: `${height + hueGap + hueWidth + inputGap}px`,
          width: `${inputWidth}px`,
          height: `${height}px`,
        }}
      >
        {/* Color preview */}
        <div className="color-picker-react-preview" style={{backgroundColor: color.hex}} />

        {/* Inputs */}

        {/* === HSV Inputs === */}
        <div className="color-picker-react-input-group">
          {/* H Input */}
          <div className="color-picker-react-input-div" title="Hue selector: 0–360°">
            <span>H</span>
            <input
              type="number"
              min={0}
              max={360}
              value={Math.round(color.hsv.h)}
              onChange={(e) => handleHChange(Number(e.target.value))}
            />
          </div>

          {/* S Input */}
          <div className="color-picker-react-input-div" title="Saturation selector: 0–100%">
            <span>S</span>
            <input
              type="number"
              min={0}
              max={100}
              value={Math.round(color.hsv.s * 100)}
              onChange={(e) => handleSChange(Number(e.target.value))}
            />
          </div>

          {/* V Input */}
          <div className="color-picker-react-input-div" title="Brightness/Value selector: 0–100%">
            <span>V</span>
            <input
              type="number"
              min={0}
              max={100}
              value={Math.round(color.hsv.v * 100)}
              onChange={(e) => handleVChange(Number(e.target.value))}
            />
          </div>
        </div>

        {/* === RGB Inputs === */}
        <div className="color-picker-react-input-group">
          {/* R Input */}
          <div className="color-picker-react-input-div" title="Red component: 0–255">
            <span>R</span>
            <input
              type="number"
              min={0}
              max={255}
              value={color.rgb.r}
              onChange={(e) => handleRChange(Number(e.target.value))}
            />
          </div>

          {/* G Input */}
          <div className="color-picker-react-input-div" title="Green component: 0–255">
            <span>G</span>
            <input
              type="number"
              min={0}
              max={255}
              value={color.rgb.g}
              onChange={(e) => handleGChange(Number(e.target.value))}
            />
          </div>

          {/* B Input */}
          <div className="color-picker-react-input-div" title="Blue component: 0–255">
            <span>B</span>
            <input
              type="number"
              min={0}
              max={255}
              value={color.rgb.b}
              onChange={(e) => handleBChange(Number(e.target.value))}
            />
          </div>
        </div>

        {/* HEX input */}
        <input className="color-picker-react-hex-input" type="text" maxLength={7} value={color.hex} readOnly />
      </div>
    </div>
  );
};

export default ColorPicker;
