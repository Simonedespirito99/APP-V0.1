import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Necessario per GitHub Pages quando il sito non è alla root del dominio
  server: {
    hmr: {
      overlay: true,
    },
  },
});