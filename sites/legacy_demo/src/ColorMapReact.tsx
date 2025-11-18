import React, {useRef, useState} from 'react';
import {ColorMapEditor} from 'color-mapping-editor';
import {colorMapToColorMapString, type ColorMap} from 'color-mapping-editor';

//import ColorPicker from './ColorPicker'; // Adjust the import path as necessary

const ColorMapReact = () => {
  const [textJson, setTextJson] = useState('{}'); // Color JSON as a string
  const mapRef = useRef(null);
  const onChangeHandler = (newColorMap : ColorMap) => {
    setTextJson(JSON.stringify(colorMapToColorMapString(newColorMap), null, 2)); // Pretty-print JSON
    //console.log('Selected Color Map:', newColorMap);
  };

  return (
    <div className="relative w-full h-[550px] p-6 bg-base-100 rounded-lg flex justify-between">
      <ColorMapEditor ref={mapRef} onChange={onChangeHandler} />

      {/* JSON display - top right */}
      <pre className="w-[350px] h-full bg-gray-800 text-gray-300 p-4 rounded-lg border border-gray-600 overflow-auto relative">
        {/* Color preview inside top-right corner of pre */}
        {textJson}
      </pre>
    </div>
  );
};

export default ColorMapReact;
