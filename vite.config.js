import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serve o projeto em https://renansko.github.io/renansko-portifolio/
// @wiki docs/brain/conventions/Deploy.md
export default defineConfig({
  base: '/renansko-portifolio/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
  },
});
