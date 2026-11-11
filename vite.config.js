import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Base relativo: o mesmo build funciona no GitHub Pages (/renansko-portifolio/) e na Vercel (/).
// @wiki docs/brain/conventions/Deploy.md
export default defineConfig({
  base: './',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
  },
});
