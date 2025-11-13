import React, {useEffect, useRef, useState} from 'react';
import {ColorPickerLegacy} from 'color-mapping-editor';

// Assuming these types are defined or imported from a library
interface RGB {
  r: number;
  g: number;
  b: number;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

interface HSV {
  h: number;
  s: number;
  v: number;
}

interface Color {
  rgb: RGB;
  hsl: HSL;
  hsv: HSV;
  hex: string;
}

const ColorPickerComponent = ({initialColorHex = '#FF0000'}) => {
  const [color, setColor] = useState<Color | null>({
    rgb: {r: 0, g: 0, b: 0},
    hsv: {h: 0, s: 0, v: 0},
    hex: initialColorHex,
  });
  const [colorJson, setColorJson] = useState('{}'); // Color JSON as a string
  const cpRef = useRef(null);

  useEffect(() => {
    // Initialize the ColorPicker component
    const cp = new ColorPickerLegacy(cpRef.current, {initialColor: initialColorHex});

    // Add a listener to update state when the color changes
    cp.addListener((c) => {
      const newColor = c.getColor(); // Get the color from the picker
      setColor(newColor); // Update the color (for display)
      setColorJson(JSON.stringify(newColor, null, 2)); // Update the color as JSON string
      console.log('Selected Color:', newColor);
    });

    return () => {
      // Cleanup the ColorPicker when the component unmounts
      cp.destroy();
    };
  }, [initialColorHex]); // Only run once when the component mounts

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
