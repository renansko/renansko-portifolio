import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// jsdom não implementa matchMedia; o Motion o consulta para prefers-reduced-motion.
// ResizeObserver fica propositalmente indefinido para exercitar a guarda em useSceneProgress.
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent: () => false,
  });
}

// jsdom não tem WebGL (e avisa "not implemented" no getContext): a cena cai no fallback em CSS.
HTMLCanvasElement.prototype.getContext = () => null;

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});
