// --- Vanilla/D3 exports (keep original functionality)
export {TransferFunctionEditor} from './core/TransferFunctionEditor.js';
export {ColorMapEditor} from './core/ColorMapEditor.js';
export {ColorPicker as ColorPickerLegacy} from './core/ColorPicker.js';
export {TransparencyEditor} from './core/TransparencyEditor.js';

// --- React exports
export { default as ColorPicker } from './react/ColorPicker';

// For utility files / types, also add .js
export * from './core/convert.js';
export * from './core/Types.js';
