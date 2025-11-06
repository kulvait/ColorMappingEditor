import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [react(), dts()],
  build: {
    lib: {
      entry: 'src/index.ts', // your main entry
      name: 'ColorMappingEditor',
      formats: ['es', 'umd'],
      fileName: (format) => `color-mapping-editor.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'd3-color', 'd3-hsv', 'd3-interpolate', 'd3-scale', 'vtk.js'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'vtk.js': 'vtk',
        },
      },
    },
  },
});
