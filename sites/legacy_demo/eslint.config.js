import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import {defineConfig, globalIgnores} from 'eslint/config';
import reactDom from 'eslint-plugin-react-dom';
//import reactX from 'eslint-plugin-react'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // JavaScript (JS) and TypeScript configurations
      js.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.recommendedTypeChecked, // Typescript type-checked rules
      tseslint.configs.stylisticTypeChecked, // Typescript stylistic type-checked rules

      // Enable lint rules for React
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
      reactDom.configs.recommended,

      // Enabling lint rules for ReactX is causing too many issues
      //      reactX.configs['recommended-typescript'],
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
]);
