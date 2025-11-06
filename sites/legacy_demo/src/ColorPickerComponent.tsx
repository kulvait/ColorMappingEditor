import React, {useEffect, useRef, useState} from 'react';
import {ColorPicker} from 'color-mapping-editor';

const ColorPickerComponent = () => {
  const [color, setColor] = useState('cyan'); // Default color as a string
  const [colorJson, setColorJson] = useState('{}'); // Color JSON as a string
  const cpRef = useRef(null);

  useEffect(() => {
    // Initialize the ColorPicker component
    const cp = new ColorPicker(cpRef.current, {initialColor: color});

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
    <div>
      <h2 className="text-2xl font-semibold text-center">Color Picker</h2>
      <div className="flex flex-row items-center space-y-6 p-6">
        {/* Color Picker component */}
        <div ref={cpRef} className="w-[500px] h-[256px] mb-6 border border-gray-300">
          {/* Color Picker content goes here */}
        </div>

        {/* Display color as background */}
        <div className="w-[25px] h-[25px] mb-6 border border-red-500" style={{backgroundColor: color.hex}}></div>

        {/* Display JSON string of color */}
        <pre className="w-[300px] bg-gray-800 text-gray-300 p-4 rounded-lg whitespace-pre-wrap border border-gray-600 text-left">
          {colorJson}
        </pre>
      </div>
    </div>
  );
};

export default ColorPickerComponent;
