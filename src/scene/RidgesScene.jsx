// Cena fixa atrás do conteúdo: cumes em sumi-e (WebGL2) pintados com as cores do design.
// S (progresso por seção) move a câmera, a luz e o sol/lua; as tintas vêm dos tokens --hill-* do modo efetivo.
// Desenha só enquanto algo se move (pincelada inicial, névoa, revoada, scroll, ponteiro, troca de modo);
// a névoa sozinha roda a ~30 fps. Sem WebGL fica o gradiente do céu em CSS.
// Único escritor de body[data-mode] e body[data-motion]. @wiki docs/brain/conventions/ScrollScene.md
import { useMotionValueEvent, useReducedMotion } from 'motion/react';
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { RidgesGL } from './ink/RidgesGL.js';
import { birdsAt, brush, clamp01, damp, hexToRgb, layerAt, paintAt, sunBloom } from './ink/ridges.js';
import { effectiveMotion, modeFor, sceneFrame } from './timeline.js';
import { useSceneProgress } from './useSceneProgress.js';

const LAYERS = 4;
const HORIZON = 0.58;
const SEED = 7;
const PAINT_IN = 2400; // ms da pincelada inicial
const MIST = 0.55;
const DRIFT = 0.05;
const PARALLAX = 0.015;
const GRAIN = 0.25;
const GLOW = 0.55;
const SUN_SIZE = 0.06;
const BIRDS = 5;
const BIRDS_EVERY = 16; // s, ±40%
const AMBIENT_FRAME = 33; // ms: só a névoa se mexendo → ~30 fps

/** Tokens de cor lidos do body (trocam com data-mode); fallback = tema Dia. */
const TOKENS = {
  inkFar: ['--hill-back', '#cfe08a'],
  inkNear: ['--hill-front', '#a8b838'],
  inkDeep: ['--hill-deep', '#5f7d22'],
  cloud: ['--scene-cloud', '#ffffff'],
  sun: ['--sun-400', '#f5c533'],
  moon: ['--moon', '#f4ecd0'],
};

function readTokens() {
  const cs = getComputedStyle(document.body);
  return Object.fromEntries(
    Object.entries(TOKENS).map(([key, [name, fallback]]) => [key, hexToRgb(cs.getPropertyValue(name)) ?? hexToRgb(fallback)]),
  );
}

const rgbCss = (c) => `rgb(${c.map((v) => Math.round(v * 255)).join(' ')})`;

export default function RidgesScene({ theme, motion: motionTweak }) {
  const reduced = useReducedMotion();
  const on = effectiveMotion(motionTweak, reduced) === 'on';
  const S = useSceneProgress(on);
  const mode = useRef(null);
  const canvasRef = useRef(null);
  const fallbackRef = useRef(null);
  const live = useRef({ theme, on, S });
  live.current = { theme, on, S };
  const ctl = useRef({ kick() {}, retheme() {} });

  const applyMode = useCallback(
    (s) => {
      const next = modeFor(s, theme, mode.current ?? 'light');
      if (next === mode.current) return;
      mode.current = next;
      document.body.dataset.mode = next;
      ctl.current.retheme();
    },
    [theme],
  );

  useMotionValueEvent(S, 'change', (s) => {
    applyMode(s);
    ctl.current.kick();
  });
  useLayoutEffect(() => applyMode(S.get()), [S, applyMode, on]);
  useLayoutEffect(() => {
    document.body.dataset.motion = on ? 'on' : 'off';
  }, [on]);
  useEffect(() => {
    ctl.current.retheme();
    ctl.current.kick();
  }, [theme, on, S]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const fallback = fallbackRef.current;
    let raf = 0;
    let last = 0;
    let lastDraw = 0;
    let dirty = true;
    let time = 0;
    const paintStart = performance.now();
    const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
    let flight = null;
    let nextFlightAt = paintStart + PAINT_IN + 1500;
    let target = readTokens();
    const ink = Object.fromEntries(Object.entries(target).map(([k, v]) => [k, [...v]]));

    // Sem WebGL (ou em teste): só o gradiente do céu, atualizado a cada mudança de S.
    const paintFallback = () => {
      const { S: s, theme: t } = live.current;
      const [top, mid, bottom] = sceneFrame(s.get(), t).sky;
      fallback.style.background = `linear-gradient(180deg, ${rgbCss(top)} 0%, ${rgbCss(mid)} 55%, ${rgbCss(bottom)} 100%)`;
    };

    const kick = () => {
      dirty = true;
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const gl = new RidgesGL(canvas, kick);
    if (!gl.ok) {
      canvas.hidden = true;
      ctl.current = { kick: paintFallback, retheme() {} };
      paintFallback();
      return () => gl.dispose();
    }

    const resize = () => {
      const scale = Math.min(window.devicePixelRatio || 1, 1) * (window.innerWidth <= 700 ? 0.75 : 1);
      gl.resize(Math.max(1, Math.round(canvas.clientWidth * scale)), Math.max(1, Math.round(canvas.clientHeight * scale)));
      kick();
    };

    const scheduleFlight = (from) => {
      nextFlightAt = from + BIRDS_EVERY * 1000 * (0.6 + 0.8 * Math.random());
    };

    function frame(now) {
      raf = 0;
      const { theme: t, on: moving, S: progress } = live.current;
      const busy = flight || now - paintStart < PAINT_IN;
      // Só a névoa derivando: segura em ~30 fps. Scroll, ponteiro e troca de modo marcam `dirty` e passam na hora.
      if (moving && !dirty && !busy && now - lastDraw < AMBIENT_FRAME) {
        raf = requestAnimationFrame(frame);
        return;
      }
      dirty = false;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      lastDraw = now;
      const p = moving ? clamp01((now - paintStart) / PAINT_IN) : 1;
      if (moving) {
        time += dt;
        ptr.x = damp(ptr.x, ptr.tx, 6, dt);
        ptr.y = damp(ptr.y, ptr.ty, 6, dt);
      } else {
        ptr.x = ptr.y = ptr.tx = ptr.ty = 0;
      }
      // Tintas seguem os tokens com suavização (~0,8 s), como a transição de cor dos cards.
      let inkSettling = false;
      for (const k of Object.keys(ink)) {
        for (let ch = 0; ch < 3; ch += 1) {
          ink[k][ch] = moving ? damp(ink[k][ch], target[k][ch], 5, dt) : target[k][ch];
          if (Math.abs(ink[k][ch] - target[k][ch]) > 1e-3) inkSettling = true;
        }
      }

      const sf = sceneFrame(progress.get(), t);
      const layers = Array.from({ length: LAYERS }, (_, i) => layerAt(i, LAYERS, HORIZON));
      const aspect = canvas.width / Math.max(1, canvas.height);
      const ridgeOpts = { n: LAYERS, horizon: HORIZON, seed: SEED, aspect, shift: [ptr.x, ptr.y], lift: sf.lift };

      if (!flight && moving && p >= 1 && now >= nextFlightAt) {
        flight = {
          start: now,
          duration: 9 + Math.random() * 3,
          dir: Math.random() < 0.5 ? 1 : -1,
          count: BIRDS,
          layer: 1,
          seed: Math.floor(Math.random() * 1000),
        };
      }
      let flock = { alpha: 0, birds: [] };
      if (flight) {
        const ft = (now - flight.start) / 1000;
        if (ft >= flight.duration || !moving) {
          flight = null;
          scheduleFlight(now);
        } else {
          flock = birdsAt(flight, ft, ridgeOpts);
        }
      }

      gl.draw({
        time,
        seed: SEED,
        mist: MIST,
        drift: moving ? DRIFT : 0,
        grain: GRAIN,
        layers,
        paint: layers.map((_, i) => brush(paintAt(p, i, LAYERS))),
        paintAll: p,
        shift: [ptr.x, ptr.y],
        lift: sf.lift,
        sky: sf.sky,
        inkFar: ink.inkFar,
        inkNear: ink.inkNear,
        inkDeep: ink.inkDeep,
        cloudColor: ink.cloud,
        clouds: sf.clouds,
        stars: sf.stars,
        sunColor: sf.disc.moon ? ink.moon : ink.sun,
        sun: [sf.disc.x, sf.disc.y, SUN_SIZE, 1],
        sunAlpha: sf.disc.alpha,
        moon: sf.disc.moon,
        sunGrow: sunBloom(p),
        glow: GLOW,
        horizonY: layerAt(0, LAYERS, HORIZON).base - sf.lift * 0.35,
        birds: flock.birds,
        birdAlpha: flock.alpha,
        birdDir: flight?.dir ?? 1,
        birdLayer: flight ? flight.layer : -1,
      });

      const settling = Math.abs(ptr.x - ptr.tx) > 1e-4 || Math.abs(ptr.y - ptr.ty) > 1e-4;
      if (moving && !document.hidden) {
        // DRIFT > 0: a névoa sempre deriva, então o laço segue (limitado a ~30 fps quando ocioso).
        if (DRIFT > 0 || p < 1 || settling || inkSettling || flight) raf = requestAnimationFrame(frame);
      } else {
        last = 0; // a próxima partida não dá salto de tempo
      }
    }

    const onPointer = (e) => {
      if (!live.current.on || e.pointerType === 'touch') return;
      ptr.tx = (e.clientX / window.innerWidth - 0.5) * PARALLAX;
      ptr.ty = -(e.clientY / window.innerHeight - 0.5) * PARALLAX;
      kick();
    };
    const onLeave = () => {
      ptr.tx = 0;
      ptr.ty = 0;
      kick();
    };
    const onVisibility = () => {
      last = 0;
      kick();
    };

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointer, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    document.addEventListener('visibilitychange', onVisibility);
    ctl.current = {
      kick,
      retheme: () => {
        target = readTokens();
        kick();
      },
    };
    resize();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ctl.current = { kick() {}, retheme() {} };
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointer);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('visibilitychange', onVisibility);
      gl.dispose();
    };
  }, []);

  return (
    <div className="scene" aria-hidden="true" data-scene-theme={theme}>
      <div ref={fallbackRef} className="scene-fallback" />
      <canvas ref={canvasRef} className="scene-canvas" />
    </div>
  );
}
