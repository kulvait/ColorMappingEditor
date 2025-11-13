import React, {useEffect, useRef, useState} from 'react';
import {ColorMapLegacy} from 'color-mapping-editor';

// Assuming these types are defined or imported from a library

const ColorPickerComponent = ({}) => {
  const [colorMap, setColorMap] = useState('{}'); // Color JSON as a string
  const [colorMapJson, setColorMapJson] = useState('{}'); // Color JSON as a string
  const cmRef = useRef(null);

  useEffect(() => {
    // Initialize the ColorMap component
    const cm = new ColorMapLegacy(cmRef.current, {
      initialColorMap: {
        colorStops: [
          {stop: 0, color: '#0f0'},
          {stop: 0.5, color: '#f00'},
          {stop: 0.75, color: '#bb00bb'},
          {stop: 1, color: '#000'},
        ],
        interpolationMethod: 'HSL',
        discrete: false,
        bins: 9,
      },
      showStopNumbers: true,
      binSelectorEditable: true,
      interpolationMethodsEditable: true,
    });

    cm.addListener((cm) => {
      const cmp = cm.discrete ? cm.getDiscreteColorMap() : cm.getColorMap();
      setColorMap(cmp);
      setColorMapJson(JSON.stringify(cmp, null, 2));
    });

    return () => {
      // Cleanup the ColorPicker when the component unmounts
      cm.destroy();
    };
  }, []); // Only run once when the component mounts

  return (
    <div className="relative w-full h-[550px] p-6 bg-base-100 rounded-lg flex justify-between">
      {/* Color Picker - top left */}
      <div ref={cmRef} className="w-[500px] h-[128px] rounded-md p-2">
        {/* Color Picker content goes here */}
      </div>

      {/* JSON display - top right */}
      <pre className="w-[350px] h-full bg-gray-800 text-gray-300 p-4 rounded-lg border border-gray-600 overflow-auto relative">
        {/* Color preview inside top-right corner of pre */}
        {colorMapJson}
      </pre>
    </div>
  );
};

export default ColorPickerComponent;
