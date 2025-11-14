import {defineConfig} from 'vite';
//import postcss from 'rollup-plugin-postcss';
//import { libInjectCss } from 'vite-plugin-lib-inject-css'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts(),
    cssInjectedByJsPlugin({
      relativeCSSInjection: true,
    }),
  ],
  build: {
    lib: {
      entry: 'src/index.ts', // your main entry
      name: 'ColorMappingEditor',
      formats: ['es', 'umd'],
      fileName: (format) => `color-mapping-editor.${format}.js`,
    },
    cssCodeSplit: true,
    rollupOptions: {
      external: ['react', 'react-dom', 'd3-color', 'd3-hsv', 'd3-interpolate', 'd3-scale', 'vtk.js'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'vtk.js': 'vtk',
          'd3-color': 'd3Color',
          'd3-hsv': 'd3Hsv',
          'd3-interpolate': 'd3Interpolate',
          'd3-scale': 'd3Scale',
        },
      },
    },
  },
});
