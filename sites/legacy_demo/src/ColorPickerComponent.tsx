import React, {useEffect, useRef, useState} from 'react';
import {ColorPickerLegacy} from 'color-mapping-editor';

const ColorPickerComponent = () => {
  const [color, setColor] = useState('cyan'); // Default color as a string
  const [colorJson, setColorJson] = useState('{}'); // Color JSON as a string
  const cpRef = useRef(null);

  useEffect(() => {
    // Initialize the ColorPicker component
    const cp = new ColorPickerLegacy(cpRef.current, {initialColor: color});

    // Add a listener to update state when the color changes
    cp.addListener((c) => {
      const newColor = c.getColor(); // Get the color from the picker
      setColor(newColor); // Update the color (for display)
      setColorJson(JSON.stringify(newColor, null, 2)); // Update the color as JSON string
      console.log('Selected Color:', newColor);
    });

    return () => {
      // Cleanup the ColorPicker when the component unmounts
      cp.removeListener();
    };
  }, []); // Only run once when the component mounts

  return (
    <div className="relative w-full h-[550px] p-6 bg-base-100 rounded-lg flex justify-between">
      {/* Color Picker - top left */}
      <div ref={cpRef} className="w-[500px] h-[256px] rounded-md p-2">
        {/* Color Picker content goes here */}
      </div>

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

export default ColorPickerComponent;
