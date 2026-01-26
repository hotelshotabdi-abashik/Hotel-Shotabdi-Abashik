
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // This bridges the gap between Vite's env system and the required process.env usage
    // Fix: In the Vite config (Node.js environment), use process.env instead of import.meta.env
    'process.env': {
      API_KEY: JSON.stringify(process.env.API_KEY || '')
    }
  },
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
  }
});
