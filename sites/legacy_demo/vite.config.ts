import {defineConfig} from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import os from 'os';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    tailwindcss(),
  ],
  server: {
    https: {
      key: fs.readFileSync(path.resolve(os.homedir(), 'server_keys/server-key.pem')),
      cert: fs.readFileSync(path.resolve(os.homedir(), 'server_keys/server-cert-AMBCAT.pem')),
    },
    host: true,
    port: 5173, // or your preferred port
  },
});
