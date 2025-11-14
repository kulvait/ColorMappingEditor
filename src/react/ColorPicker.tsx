import React, {useEffect, useRef, useState} from 'react';
import chroma from 'chroma-js';
import {Color} from '../types';
import {hexToColor, clamp} from '../utils';

import './ColorPicker.css';

const ColorPicker = ({height = 256, initHexColor = '#ff0000', onChange = null, onConfirm = null}) => {
  const initColor = chroma.valid(initHexColor) ? hexToColor(initHexColor) : hexToColor('#ff0000');
  const [color, setColor] = useState<Color>(initColor);
  const hAreaDivRef = useRef<HTMLDivElement | null>(null);
  const slAreaDivRef = useRef<HTMLDivElement | null>(null);

  //Put it in Rem  = 16px
  const hueGap = 3;
  const hueWidth = 16;
  const inputGap = 3;
  const inputWidth = 75;
  const width = height + hueGap + hueWidth + inputGap + inputWidth;
  console.log('ColorPicker width:', width);

  const cpRef = useRef(null);

  // useEffect to trigger onChange whenever color changes
  useEffect(() => {
    if (onChange && typeof onChange === 'function') {
      onChange(color);
    }
  }, [color, onChange]); // Dependency array includes color and onChange

  // Handlers for HSV changes
  const handleHChange = (value: number) => {
    const clampedHue = clamp(value, 0, 360);
    const newHSV = {...color.hsv, h: clampedHue};
    const newcolor = hexToColor(newHSV);
    //Fix 360 identical 0
    newcolor.hsv.h = clampedHue;
    setColor(newcolor);
  };

  const handleSChange = (value: number) => {
    const clampedSaturation = clamp(value, 0, 100); // Clamp saturation between 0 and 100
    const newHSV = {...color.hsv, s: clampedSaturation / 100};
    const newcolor = hexToColor(newHSV);
    //Fix 360 identical 0
    newcolor.hsv.h = color.hsv.h;
    setColor(newcolor);
  };

  const handleVChange = (value: number) => {
    const clampedValue = clamp(value, 0, 100); // Clamp value (brightness) between 0 and 100
    const newHSV = {...color.hsv, v: clampedValue / 100};
    const newcolor = hexToColor(newHSV);
    //Fix 360 identical 0
    newcolor.hsv.h = color.hsv.h;
    setColor(newcolor);
  };

  const handleSVChange = (sValue: number, vValue: number) => {
    const clampedSaturation = clamp(sValue, 0, 100);
    const clampedValue = clamp(vValue, 0, 100);
    const newHSV = {...color.hsv, s: clampedSaturation / 100, v: clampedValue / 100};
    const newcolor = hexToColor(newHSV);
    //Fix 360 identical 0
    newcolor.hsv.h = color.hsv.h;
    setColor(newcolor);
  };

  // Handlers for RGB changes
  const handleRChange = (value: number) => {
    const clampedR = clamp(value, 0, 255); // Clamp R channel between 0 and 255
    const newRGB = {...color.rgb, r: clampedR};
    const newcolor = hexToColor(newRGB);
    setColor(newcolor);
  };

  const handleGChange = (value: number) => {
    const clampedG = clamp(value, 0, 255); // Clamp G channel between 0 and 255
    const newRGB = {...color.rgb, g: clampedG};
    const newcolor = hexToColor(newRGB);
    setColor(newcolor);
  };

  const handleBChange = (value: number) => {
    const clampedB = clamp(value, 0, 255); // Clamp B channel between 0 and 255
    const newRGB = {...color.rgb, b: clampedB};
    const newcolor = hexToColor(newRGB);
    setColor(newcolor);
  };

  const handleSLClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const areaDiv = slAreaDivRef.current; // Get the current div
    if (!areaDiv) return; // Early return if ref is not assigned

    const rect = areaDiv.getBoundingClientRect(); // Get dimensions
    const x = event.clientX - rect.left; // Click position X
    const y = event.clientY - rect.top; // Click position Y
    const s = x / rect.width;
    const v = 1 - y / rect.height;
    handleSVChange(s * 100, v * 100);
  };

  const lastSLMoveTimeRef = useRef(0);

  const handleSLPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.buttons !== 1) return; // Only proceed if the left mouse button is pressed
    //throttle
    if (event.timeStamp - lastSLMoveTimeRef.current < 50) {
      return;
    }
    lastSLMoveTimeRef.current = event.timeStamp;
    handleSLClick(event); // Reuse the click handler logic
  };

  const handleHClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const areaDiv = hAreaDivRef.current; // Get the current div
    if (!areaDiv) return; // Early return if ref is not assigned

    const rect = areaDiv.getBoundingClientRect(); // Get dimensions
    const y = event.clientY - rect.top; // Click position Y
    const h = 360 - (360 * y) / rect.height;
    handleHChange(h);
  };

  const lastHMoveTimeRef = useRef(0);

  const handleHMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.buttons !== 1) return; // Only proceed if the left mouse button is pressed
    //throttle
    if (event.timeStamp - lastHMoveTimeRef.current < 50) {
      return;
    }
    lastHMoveTimeRef.current = event.timeStamp;
    handleHClick(event); // Reuse the click handler logic
  };

  useEffect(() => {
    console.log(JSON.stringify(color, null, 2));
  }, [color]); // Only run once when the component mounts

  return (
    <div ref={cpRef} className="color-picker-react-root" style={{width: `${width}px`, height: `${height}px`}}>
      {/* SL Picker */}
      <div
        className="color-picker-react-sl-area"
        ref={slAreaDivRef}
        onClick={handleSLClick}
        onPointerMove={handleSLPointerMove}
        onPointerDown={(e) => {
          e.preventDefault();
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerUp={(e) => {
          e.preventDefault();
          e.currentTarget.releasePointerCapture(e.pointerId);
        }}
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
            border: `2px solid ${color.isDark ? '#fff' : '#000'}`, // Set border color
          }}
        ></div>
      </div>

      {/* H Picker */}
      <div
        className="color-picker-react-h-area color-picker-react-hue-vertical"
        ref={hAreaDivRef}
        onClick={handleHClick}
        onPointerMove={handleHMove}
        onPointerDown={(e) => {
          e.preventDefault();
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerUp={(e) => {
          e.preventDefault();
          e.currentTarget.releasePointerCapture(e.pointerId);
        }}
        style={{width: `${hueWidth}px`, height: `${height}px`, left: `${height + hueGap}px`}}
        title="Hue selector: sets the base color tone (0–360° around the color wheel)"
      >
        <div className="color-picker-react-h-picker-line" style={{top: `${100 - color.hsv.h / 3.6}%`}}></div>
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

        {/* Confirm Button */}
        {onConfirm && typeof onConfirm === 'function' && (
          <button
            className="color-picker-react-confirm-button"
            onClick={() => {
              onConfirm(color);
            }}
          >
            Confirm
          </button>
        )}
      </div>
    </div>
  );
};

export default ColorPicker;
