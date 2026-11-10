// Arquivo separado: o Motion lê prefers-reduced-motion uma vez por módulo,
// então o stub precisa existir antes de qualquer import do App.
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from '../src/App.jsx';

vi.hoisted(() => {
  window.matchMedia = (query) => ({
    matches: query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent: () => false,
  });
});

describe('prefers-reduced-motion', () => {
  it('desliga o movimento mesmo com o tweak ligado', () => {
    render(<App />);
    expect(JSON.parse(window.localStorage.getItem('tweaks-v2')).motion).toBe('on');
    expect(document.body.dataset.motion).toBe('off');
    expect(document.body.dataset.mode).toBe('light');
  });
});
