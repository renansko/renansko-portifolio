import { describe, expect, it } from 'vitest';
import { hexToRgb } from '../src/scene/ink/ridges.js';
import {
  MODE_DARK_ENTER,
  MODE_DARK_EXIT,
  S_MAX,
  effectiveMotion,
  interp,
  modeFor,
  PHASES,
  sceneFrame,
  sceneKeyframes,
  skyAt,
  skyLayers,
} from '../src/scene/timeline.js';

const samples = Array.from({ length: S_MAX * 10 + 1 }, (_, i) => i / 10);

describe('timeline', () => {
  it.each(['light', 'dark'])('opacidades do céu somam 1 em todo S (tema %s)', (theme) => {
    const layers = skyLayers(theme);
    for (const s of samples) {
      const sum = layers.reduce((acc, l) => acc + interp(l.input, l.output, s), 0);
      expect(sum, `S=${s}`).toBeCloseTo(1, 6);
    }
  });

  it('renderiza só as fases do tema ativo', () => {
    expect(skyLayers('light').map((l) => l.phase)).toEqual(['dawn', 'day', 'golden', 'dusk', 'night']);
    expect(skyLayers('dark').map((l) => l.phase)).toEqual(['dusk', 'night', 'deep']);
  });

  it.each(['light', 'dark'])('keyframes são crescentes e ficam em [0, 5] (tema %s)', (theme) => {
    const ranges = [
      ...skyLayers(theme).map((l) => l.input),
      ...Object.values(sceneKeyframes(theme)).flatMap((k) => (k.input ? [k.input] : Object.values(k).map((v) => v.input))),
    ];
    for (const input of ranges) {
      expect(input[0]).toBeGreaterThanOrEqual(0);
      expect(input.at(-1)).toBeLessThanOrEqual(S_MAX);
      for (let i = 1; i < input.length; i += 1) expect(input[i]).toBeGreaterThan(input[i - 1]);
    }
  });

  it('o sol só existe no tema Dia', () => {
    expect(sceneKeyframes('light').sun).toBeDefined();
    expect(sceneKeyframes('dark').sun).toBeUndefined();
    for (const s of samples) expect(sceneFrame(s, 'dark').disc.moon, `S=${s}`).toBe(true);
  });

  it('no tema Dia o sol se põe antes de a lua aparecer', () => {
    expect(sceneFrame(0, 'light').disc).toMatchObject({ moon: false, alpha: 1 });
    expect(sceneFrame(5, 'light').disc).toMatchObject({ moon: true, alpha: 1 });
    for (const s of samples) {
      const { disc } = sceneFrame(s, 'light');
      if (disc.moon) expect(sceneKeyframes('light').sun.opacity.output.at(-1)).toBe(0);
      expect(disc.alpha).toBeGreaterThanOrEqual(0);
    }
  });

  it.each(['light', 'dark'])('céu em S é a cor da fase nos platôs (tema %s)', (theme) => {
    for (const { hold, colors } of PHASES[theme]) {
      const sky = skyAt((hold[0] + hold[1]) / 2, theme);
      colors.forEach((hex, stop) => {
        hexToRgb(hex).forEach((c, ch) => expect(sky[stop][ch]).toBeCloseTo(c, 6));
      });
    }
  });

  it('a câmera desce: cumes afundados no hero, no lugar no contato', () => {
    expect(sceneFrame(0, 'light').lift).toBeGreaterThan(0);
    expect(sceneFrame(S_MAX, 'light').lift).toBe(0);
    for (let i = 1; i < samples.length; i += 1) {
      expect(sceneFrame(samples[i], 'light').lift).toBeLessThanOrEqual(sceneFrame(samples[i - 1], 'light').lift);
    }
  });

  it('modo efetivo tem histerese entre a entrada e a saída do escuro', () => {
    expect(modeFor(0, 'light')).toBe('light');
    expect(modeFor(MODE_DARK_ENTER, 'light', 'light')).toBe('dark');
    expect(modeFor(3.55, 'light', 'light')).toBe('light');
    expect(modeFor(3.55, 'light', 'dark')).toBe('dark');
    expect(modeFor(MODE_DARK_EXIT, 'light', 'dark')).toBe('light');
    expect(modeFor(5, 'light', 'light')).toBe('dark');
  });

  it('tema Noite é sempre escuro', () => {
    for (const s of samples) expect(modeFor(s, 'dark', 'light')).toBe('dark');
  });

  it('movimento reduzido do sistema desliga o movimento mesmo com o tweak ligado', () => {
    expect(effectiveMotion('on', false)).toBe('on');
    expect(effectiveMotion('on', true)).toBe('off');
    expect(effectiveMotion('off', false)).toBe('off');
  });
});
