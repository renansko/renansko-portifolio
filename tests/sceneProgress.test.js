import { describe, expect, it } from 'vitest';
import { SECTION_IDS, buildRange, progressAt } from '../src/scene/useSceneProgress.js';

describe('progresso por seção', () => {
  it('segue a ordem das seções da página', () => {
    expect(SECTION_IDS).toEqual(['top', 'about', 'skills', 'experience', 'projects', 'contact']);
  });

  it('limita ao scroll máximo para a última seção chegar a S = 5', () => {
    const range = buildRange([0, 900, 1800, 2700, 3600, 4500], 4000, 900);
    expect(range.at(-1)).toBe(4000);
    expect(progressAt(4000, range)).toBe(5);
  });

  it('força entradas estritamente crescentes quando seções colapsam no fim', () => {
    const range = buildRange([0, 900, 1800, 2700, 3900, 4500], 3000, 900);
    for (let i = 1; i < range.length; i += 1) expect(range[i]).toBeGreaterThan(range[i - 1]);
    expect(range.at(-1)).toBe(3000);
  });

  it('cai no fallback proporcional à viewport quando as medidas são zero', () => {
    expect(buildRange([0, 0, 0, 0, 0, 0], 0, 800)).toEqual([0, 800, 1600, 2400, 3200, 4000]);
  });

  it('devolve inteiros exatos nos topos das seções e interpola entre eles', () => {
    const range = buildRange([0, 1000, 1600, 2500, 3400, 4100], 5000, 900);
    range.forEach((y, i) => expect(progressAt(y, range)).toBe(i));
    expect(progressAt(1300, range)).toBeCloseTo(1.5);
    expect(progressAt(-50, range)).toBe(0);
    expect(progressAt(99999, range)).toBe(5);
  });
});
