// Mapeia o scroll da janela para S (índice contínuo de seção, 0..5).
// @wiki docs/brain/conventions/ScrollScene.md
import { useMotionValue, useMotionValueEvent, useScroll } from 'motion/react';
import { useCallback, useLayoutEffect, useRef } from 'react';
import { STATIC_S } from './timeline.js';

/** Ordem das seções: S = i quando o topo da seção i encosta no topo da viewport. */
export const SECTION_IDS = ['top', 'about', 'skills', 'experience', 'projects', 'contact'];

/**
 * Posições de scroll (px) em que S vale 0, 1, …, n-1.
 * - Limita ao scroll máximo: a última seção pode não alcançar o topo da viewport.
 * - Força entradas estritamente crescentes (puxando as anteriores para baixo), para que S chegue ao fim no scroll máximo.
 * - Sem medidas (primeiro render, jsdom): fallback proporcional à altura da viewport.
 */
export function buildRange(tops, maxScroll, viewport) {
  if (tops.every((t) => !t) || !(maxScroll > 0)) {
    const step = viewport > 0 ? viewport : 1;
    return tops.map((_, i) => i * step);
  }
  const range = tops.map((t) => Math.min(Math.max(t, 0), maxScroll));
  for (let i = range.length - 2; i >= 0; i -= 1) {
    range[i] = Math.min(range[i], range[i + 1] - 1);
  }
  return range;
}

/** Scroll (px) → S, linear por trechos sobre a faixa construída por `buildRange`. */
export function progressAt(y, range) {
  const last = range.length - 1;
  if (y <= range[0]) return 0;
  if (y >= range[last]) return last;
  let i = 1;
  while (y > range[i]) i += 1;
  return i - 1 + (y - range[i - 1]) / (range[i] - range[i - 1]);
}

function measure() {
  const scrollY = window.scrollY || 0;
  const tops = SECTION_IDS.map((id) => {
    const el = document.getElementById(id);
    return el ? el.getBoundingClientRect().top + scrollY : 0;
  });
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  return buildRange(tops, maxScroll, window.innerHeight);
}

/**
 * MotionValue de S. Com `enabled` falso, fica parado em STATIC_S.
 * Sem spring: a câmera acompanha o scroll sem atraso.
 */
export function useSceneProgress(enabled) {
  const { scrollY } = useScroll();
  const progress = useMotionValue(enabled ? 0 : STATIC_S);
  const range = useRef(null);

  const update = useCallback(() => {
    if (!enabled) {
      progress.set(STATIC_S);
      return;
    }
    if (!range.current) range.current = measure();
    // Lê a janela diretamente: na recarga no meio da página o scrollY do Motion ainda está em 0.
    progress.set(progressAt(window.scrollY || 0, range.current));
  }, [enabled, progress]);

  useMotionValueEvent(scrollY, 'change', update);

  useLayoutEffect(() => {
    if (!enabled) {
      update();
      return undefined;
    }
    const remeasure = () => {
      range.current = measure();
      update();
    };
    remeasure();
    window.addEventListener('resize', remeasure);
    let ro;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(remeasure);
      ro.observe(document.body);
    }
    let alive = true;
    document.fonts?.ready?.then(() => alive && remeasure());
    return () => {
      alive = false;
      window.removeEventListener('resize', remeasure);
      ro?.disconnect();
    };
  }, [enabled, update]);

  return progress;
}
