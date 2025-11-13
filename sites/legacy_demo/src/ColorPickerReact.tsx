import React, {useRef, useState} from 'react';
import {ColorPicker} from 'color-mapping-editor';
import type {Color} from 'color-mapping-editor'; // Import the Color type
import {hexToColor} from 'color-mapping-editor'; // Path to your ColorPicker file
//import ColorPicker from './ColorPicker'; // Adjust the import path as necessary

const ColorPickerReact = ({initHexColor = '#00FF00'}) => {
  const initColor = hexToColor(initHexColor); // Convert initial hex to Color object
  const [color, setColor] = useState<Color>(initColor); // Color state
  const [colorJson, setColorJson] = useState('{}'); // Color JSON as a string
  const cpRef = useRef(null);

  const onChangeHandler = (newColor) => {
    setColor(newColor); // Update the color state for display
    setColorJson(JSON.stringify(newColor, null, 2)); // Update color as JSON string
    console.log('Selected Color:', newColor);
  };

  return (
    <div className="relative w-full h-[550px] p-6 bg-base-100 rounded-lg flex justify-between">
      <ColorPicker ref={cpRef} initHexColor={initHexColor} onChange={onChangeHandler} onConfirm={onChangeHandler} />

      {/* JSON display - top right */}
      <pre className="w-[300px] h-full bg-gray-800 text-gray-300 p-4 rounded-lg border border-gray-600 overflow-auto relative">
        {/* Color preview inside top-right corner of pre */}
        <div
          className="absolute top-2 right-2 w-[25px] h-[25px] border border-red-500 rounded-sm"
          style={{backgroundColor: color.hex}}
        ></div>

        {colorJson}
      </pre>
    </div>
  );
};

export default ColorPickerReact;
