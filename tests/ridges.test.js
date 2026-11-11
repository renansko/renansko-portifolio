import { describe, expect, it } from 'vitest';
import { birdsAt, fbm, hexToRgb, layerAt, paintAt, ridgeLineAt, sunBloom } from '../src/scene/ink/ridges.js';

const opts = { n: 4, horizon: 0.58, seed: 7, aspect: 16 / 9, shift: [0, 0], lift: 0 };

describe('cumes em sumi-e (partes puras)', () => {
  it('cumes próximos são mais baixos e mais densos', () => {
    const far = layerAt(0, 4, 0.58);
    const near = layerAt(3, 4, 0.58);
    expect(far.base).toBeGreaterThan(near.base);
    expect(near.ink).toBeGreaterThan(far.ink);
    expect(near.ink).toBeLessThanOrEqual(1);
  });

  it('a pincelada começa pelo cume distante e termina em 1', () => {
    expect(paintAt(0.2, 0, 4)).toBeGreaterThan(paintAt(0.2, 3, 4));
    for (let i = 0; i < 4; i += 1) expect(paintAt(1, i, 4)).toBe(1);
    expect(sunBloom(0)).toBe(0);
    expect(sunBloom(1)).toBe(1);
  });

  it('o ruído é determinístico e fica em [0, 1]', () => {
    expect(fbm(1.3, 2.7)).toBe(fbm(1.3, 2.7));
    for (let x = 0; x < 5; x += 0.37) {
      const v = fbm(x, x * 0.5);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });

  it('lift afunda mais o cume próximo que o distante', () => {
    const lifted = { ...opts, lift: 0.3 };
    const dropFar = ridgeLineAt(0, 0.5, opts) - ridgeLineAt(0, 0.5, lifted);
    const dropNear = ridgeLineAt(3, 0.5, opts) - ridgeLineAt(3, 0.5, lifted);
    expect(dropNear).toBeGreaterThan(dropFar);
  });

  it('a revoada voa acima do cume que segue', () => {
    const flight = { duration: 10, dir: 1, count: 5, layer: 1, seed: 3 };
    const { birds, alpha } = birdsAt(flight, 5, opts);
    expect(alpha).toBe(1);
    for (const b of birds) expect(b.y).toBeGreaterThan(ridgeLineAt(1, b.x, opts));
  });

  it('converte hex dos tokens e recusa o resto', () => {
    expect(hexToRgb('#fff')).toEqual([1, 1, 1]);
    expect(hexToRgb(' #000000 ')).toEqual([0, 0, 0]);
    expect(hexToRgb('var(--x)')).toBeNull();
  });
});
