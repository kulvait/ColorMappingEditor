// --- Vanilla/D3 exports (keep original functionality)
export {ColorPicker as ColorPickerLegacy} from './core/ColorPicker.js';
export {ColorMapEditor as ColorMapLegacy} from './core/ColorMapEditor.js';
export {TransferFunctionEditor} from './core/TransferFunctionEditor.js';
export {TransparencyEditor} from './core/TransparencyEditor.js';

// --- React exports
export {default as ColorPicker} from './react/ColorPicker';

// --- Utility exports
export {hexToColor} from './utils';

// --- Type exports
export type {RGB, HSV, Color} from './types';

// --- Constant exports
export {INVALID_COLOR} from './types';
export {ColorInterpolation} from './types';

// For utility files / types, also add .js
export * from './core/convert.js';
export * from './core/Types.js';
