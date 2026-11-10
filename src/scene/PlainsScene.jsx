// Cenário fixo de planícies atrás do conteúdo: a câmera desce do céu ao capim conforme S avança.
// Usa `m` + LazyMotion(domMin) para manter o bundle leve: só estilos ligados a MotionValues, sem gestos/drag.
// Único escritor de body[data-mode] e body[data-motion]. @wiki docs/brain/conventions/ScrollScene.md
import { LazyMotion, domMin, m, useMotionValueEvent, useReducedMotion, useTransform } from 'motion/react';
import { useCallback, useLayoutEffect, useRef } from 'react';
import { effectiveMotion, interp, modeFor, sceneLayers, skyLayers } from './timeline.js';
import { useSceneProgress } from './useSceneProgress.js';

const ident = { input: [0, 1], output: [0, 0] };
const one = { input: [0, 1], output: [1, 1] };

/** Estilo ligado a S para uma camada: só transform (y/scale) e opacity. Quantidade fixa de hooks. */
function useLayerStyle(S, layer = {}) {
  const y = useTransform(S, (s) => `${interp((layer.y ?? ident).input, (layer.y ?? ident).output, s)}vh`);
  const scale = useTransform(S, (s) => interp((layer.scale ?? one).input, (layer.scale ?? one).output, s));
  const opacity = useTransform(S, (s) => interp((layer.opacity ?? one).input, (layer.opacity ?? one).output, s));
  return { y, scale, opacity };
}

function SkyLayer({ S, layer }) {
  const opacity = useTransform(S, (s) => interp(layer.input, layer.output, s));
  const [top, mid, bottom] = layer.colors;
  return (
    <m.div
      className="scene-sky-layer"
      data-phase={layer.phase}
      style={{ opacity, background: `linear-gradient(180deg, ${top} 0%, ${mid} 55%, ${bottom} 100%)` }}
    />
  );
}

// Estrelas em posições determinísticas (LCG), em três grupos para o brilho alternado.
const STARS = (() => {
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  return Array.from({ length: 42 }, (_, i) => ({ x: rnd() * 100, y: rnd() * 100, r: 1 + rnd() * 1.5, g: i % 3 }));
})();

function Stars({ S, layer }) {
  const style = useLayerStyle(S, layer);
  return (
    <m.div className="scene-stars" style={style}>
      {[0, 1, 2].map((g) => (
        <div key={g} className={`scene-star-group g${g}`}>
          {STARS.filter((s) => s.g === g).map((s, i) => (
            <span key={i} className="scene-star" style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.r * 2, height: s.r * 2 }} />
          ))}
        </div>
      ))}
    </m.div>
  );
}

function Cloud({ x, y, w, fill }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${w})`} fill={fill}>
      <ellipse cx="0" cy="20" rx="56" ry="24" />
      <ellipse cx="-24" cy="8" rx="28" ry="24" />
      <ellipse cx="20" cy="0" rx="32" ry="28" />
    </g>
  );
}

function Clouds({ S, layer, bank, theme }) {
  const style = useLayerStyle(S, layer);
  // Tema Noite: nuvens escuras e translúcidas, para o texto claro seguir legível.
  const fill = theme === 'dark' ? '#2a3a50' : '#ffffff';
  const items = bank === 'a'
    ? [[180, 60, 1.2], [620, 30, 0.9], [1180, 80, 1.4]]
    : [[360, 50, 0.8], [900, 20, 1.1], [1340, 40, 0.7]];
  return (
    <m.div className={`scene-clouds scene-clouds-${bank}`} style={style}>
      <div className="scene-drift">
        <svg viewBox="0 0 1440 160" preserveAspectRatio="xMidYMid slice" opacity={theme === 'dark' ? 0.6 : 1}>
          {items.map(([x, y, w]) => <Cloud key={x} x={x} y={y + 40} w={w} fill={fill} />)}
        </svg>
      </div>
    </m.div>
  );
}

function Tree({ S, layer }) {
  const style = useLayerStyle(S, layer);
  return (
    <div className="scene-tree">
      <m.svg viewBox="0 0 120 200" style={style}>
        <rect x="54" y="110" width="12" height="90" rx="4" fill="#6b4a2b" />
        <ellipse cx="60" cy="110" rx="52" ry="32" fill="#2f4a22" />
        <ellipse cx="60" cy="76" rx="44" ry="30" fill="#3d5f2e" />
        <ellipse cx="60" cy="44" rx="32" ry="26" fill="#4c7a36" />
      </m.svg>
    </div>
  );
}

const DAISIES = [6, 14, 23, 31, 42, 50, 61, 69, 78, 88, 95];

function SceneLayers({ S, theme }) {
  const layers = sceneLayers(theme);
  const far = useLayerStyle(S, layers.hillsFar);
  const near = useLayerStyle(S, layers.hillsNear);
  const grass = useLayerStyle(S, layers.grass);
  const veil = useLayerStyle(S, layers.veil);
  const moon = useLayerStyle(S, layers.moon);
  const sun = useLayerStyle(S, layers.sun);

  return (
    <>
      <div className="scene-sky">
        {skyLayers(theme).map((l) => <SkyLayer key={l.phase} S={S} layer={l} />)}
      </div>
      <Stars S={S} layer={layers.stars} />
      {layers.sun && <m.div className="scene-sun" style={sun} />}
      <m.div className="scene-moon" style={moon} />
      <Clouds S={S} layer={layers.cloudsB} bank="b" theme={theme} />
      <Clouds S={S} layer={layers.cloudsA} bank="a" theme={theme} />
      <m.div className="scene-hills scene-hills-far" style={far}>
        <svg viewBox="0 0 1440 400" preserveAspectRatio="none">
          <path d="M0 120 Q 240 40 480 100 T 960 90 T 1440 70 L1440 400 L0 400 Z" fill="var(--hill-back)" />
        </svg>
        <Tree S={S} layer={layers.tree} />
      </m.div>
      <m.div className="scene-hills scene-hills-near" style={near}>
        <svg viewBox="0 0 1440 400" preserveAspectRatio="none">
          <path d="M0 140 Q 360 40 720 120 T 1440 100 L1440 400 L0 400 Z" fill="var(--hill-front)" />
        </svg>
      </m.div>
      <m.div className="scene-veil" style={veil} />
      <m.div className="scene-grass" style={grass}>
        <svg viewBox="0 0 1440 200" preserveAspectRatio="none">
          <path
            d="M0 60 Q 40 20 80 56 Q 120 16 160 52 Q 200 12 240 50 Q 280 18 320 54 Q 360 14 400 50 Q 440 20 480 56 Q 520 10 560 52 Q 600 18 640 54 Q 680 14 720 50 Q 760 20 800 56 Q 840 12 880 52 Q 920 18 960 54 Q 1000 14 1040 50 Q 1080 20 1120 56 Q 1160 10 1200 52 Q 1240 18 1280 54 Q 1320 14 1360 50 Q 1400 20 1440 56 L1440 200 L0 200 Z"
            fill="var(--hill-front)"
          />
        </svg>
        <div className="scene-daisies">
          {DAISIES.map((x) => (
            <span key={x} className="scene-daisy" style={{ left: `${x}%`, top: `${30 + ((x * 7) % 40)}%` }} />
          ))}
        </div>
      </m.div>
    </>
  );
}

export default function PlainsScene({ theme, motion: motionTweak }) {
  const reduced = useReducedMotion();
  const on = effectiveMotion(motionTweak, reduced) === 'on';
  const S = useSceneProgress(on);
  const mode = useRef(null);

  const applyMode = useCallback(
    (s) => {
      const next = modeFor(s, theme, mode.current ?? 'light');
      if (next === mode.current) return;
      mode.current = next;
      document.body.dataset.mode = next;
    },
    [theme],
  );

  useMotionValueEvent(S, 'change', applyMode);
  useLayoutEffect(() => applyMode(S.get()), [S, applyMode, on]);
  useLayoutEffect(() => {
    document.body.dataset.motion = on ? 'on' : 'off';
  }, [on]);

  return (
    <div className="scene" aria-hidden="true" data-scene-theme={theme}>
      {/* `m` sem LazyMotion não tem renderer e não aplica as atualizações dos MotionValues. */}
      <LazyMotion features={domMin} strict>
        {/* Remonta por tema: as camadas e keyframes de cada tema são diferentes. */}
        <SceneLayers key={theme} S={S} theme={theme} />
      </LazyMotion>
    </div>
  );
}
