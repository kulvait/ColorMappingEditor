import React, {useRef, useState} from 'react';
import {ColorPicker} from 'color-mapping-editor';
//import ColorPicker from './ColorPicker'; // Adjust the import path as necessary

const ColorPickerReact = () => {
  const [color, setColor] = useState('cyan'); // Default color as a string
  const [colorJson, setColorJson] = useState('{}'); // Color JSON as a string
  const cpRef = useRef(null);

  const onChangeHandler = (newColor) => {
    setColor(newColor); // Update the color state for display
    setColorJson(JSON.stringify(newColor, null, 2)); // Update color as JSON string
    console.log('Selected Color:', newColor);
  };

  return (
    <div className="relative w-full h-[550px] p-6 bg-base-100 rounded-lg flex justify-between">
      <ColorPicker ref={cpRef} initHexColor="#FF0000" onChange={onChangeHandler} onConfirm={onChangeHandler} />

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
