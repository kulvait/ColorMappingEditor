import {useState} from 'react';
import TestColorMapping from './TestColorMapping'; // Path to your test component
import ColorPickerComponent from './ColorPickerComponent';
import './App.css';

function App() {
  return (
    <div className="App">
      <h1>Testing Color Mapping Editor</h1>
      <ColorPickerComponent />
    </div>
  );
}

export default App;
