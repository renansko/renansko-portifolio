// Timeline pura da cena de scroll: fases de luz, keyframes da cena e regras de modo.
// Tudo é função de S (índice contínuo de seção, 0 = hero … 5 = contato).
// @wiki docs/brain/conventions/ScrollScene.md
import { hexToRgb } from './ink/ridges.js';

export const S_MAX = 5;

/** Progresso usado quando o movimento está desligado (cena parada, sem vínculo com o scroll). */
export const STATIC_S = 2.5;

/** Histerese do modo efetivo: entra no escuro em 3,7 e volta ao claro em 3,4. */
export const MODE_DARK_ENTER = 3.7;
export const MODE_DARK_EXIT = 3.4;

/**
 * Fases por tema. `hold` é o trecho de S em que a fase está plena; entre o fim de uma
 * e o início da próxima as duas cruzam linearmente (por isso a soma é sempre 1).
 * `colors` = gradiente do céu de cima para baixo.
 */
export const PHASES = {
  light: [
    { phase: 'dawn', hold: [0, 0.3], colors: ['#fde4cf', '#fdf1e4', '#f4f8fb'] },
    { phase: 'day', hold: [1, 2], colors: ['#8ccdf5', '#bfe3fa', '#eaf5fd'] },
    { phase: 'golden', hold: [2.8, 3.1], colors: ['#f2a65e', '#f8cd8f', '#fde9c8'] },
    { phase: 'dusk', hold: [3.8, 4.1], colors: ['#2b2d5c', '#6e4a7c', '#d9846a'] },
    { phase: 'night', hold: [4.8, 5], colors: ['#070f1d', '#0e1a2b', '#1b2b3e'] },
  ],
  dark: [
    { phase: 'dusk', hold: [0, 0.4], colors: ['#141c3a', '#262a52', '#4a3d62'] },
    { phase: 'night', hold: [1.5, 3], colors: ['#070f1d', '#0e1a2b', '#1b2b3e'] },
    { phase: 'deep', hold: [4.5, 5], colors: ['#03070f', '#070f1d', '#0e1a2b'] },
  ],
};

/** Interpolação linear por trechos, limitada às pontas (mesma semântica do `interpolate` do Motion). */
export function interp(input, output, s) {
  if (s <= input[0]) return output[0];
  const last = input.length - 1;
  if (s >= input[last]) return output[last];
  let i = 1;
  while (s > input[i]) i += 1;
  const t = (s - input[i - 1]) / (input[i] - input[i - 1]);
  return output[i - 1] + (output[i] - output[i - 1]) * t;
}

/** Camadas do céu do tema: opacidade em forma de tenda (com platô) sobre S. */
export function skyLayers(theme) {
  const phases = PHASES[theme] ?? PHASES.light;
  return phases.map(({ phase, hold, colors }, k) => {
    const prev = phases[k - 1];
    const next = phases[k + 1];
    const input = [];
    const output = [];
    if (prev) input.push(prev.hold[1]), output.push(0);
    input.push(hold[0], hold[1]);
    output.push(1, 1);
    if (next) input.push(next.hold[0]), output.push(0);
    return { phase, colors, input, output };
  });
}

const kf = (input, output) => ({ input, output });
const at = (k, s) => interp(k.input, k.output, s);

/**
 * Trajetória em parábola entre S = input[0] e input[1]: x anda linear da esquerda para a direita
 * e y passa por (início, ápice, fim). Como x é linear em S, o caminho na tela é uma parábola.
 */
const arc = (input, x, y) => ({ input, x, y });

/** Posição (uv) de um disco na parábola em S; fora da faixa, fica parado na ponta. */
export function arcAt(path, s) {
  const [s0, s1] = path.input;
  const t = Math.min(1, Math.max(0, (s - s0) / (s1 - s0)));
  const [y0, ya, y1] = path.y;
  // Ápice em tp, com y(0) = y0 e y(1) = y1: tp / (1 - tp) = √((ya - y0) / (ya - y1)).
  const r0 = Math.sqrt(Math.max(0, ya - y0));
  const r1 = Math.sqrt(Math.max(0, ya - y1));
  const tp = r0 + r1 > 0 ? r0 / (r0 + r1) : 0.5;
  const a = tp > 0 ? (ya - y0) / (tp * tp) : ya - y1;
  return { x: path.x[0] + (path.x[1] - path.x[0]) * t, y: ya - a * (t - tp) ** 2 };
}

/**
 * Keyframes escalares da cena (uv: 0 embaixo, 1 em cima). `lift` afunda os cumes: alto no hero (mais céu),
 * zero no contato (a câmera chegou ao chão). Camadas ausentes num tema não existem (ex.: sol no tema Noite).
 */
export function sceneKeyframes(theme) {
  const night = theme === 'dark';
  return {
    lift: kf([0, 5], [0.3, 0]),
    clouds: night ? kf([0, 2.6], [0.45, 0]) : kf([0, 1.8, 3.2], [0.9, 0.9, 0]),
    stars: night ? kf([0, 5], [1, 1]) : kf([3.8, 4.6], [0, 1]),
    // Lua: no tema Dia nasce à esquerda quando escurece e sobe até o alto à direita no contato;
    // no tema Noite cruza o céu inteiro da esquerda para a direita.
    moon: night
      ? { arc: arc([0, 5], [0.08, 0.92], [0.7, 0.86, 0.66]), opacity: kf([0, 5], [1, 1]) }
      : { arc: arc([3.9, 5], [0.06, 0.72], [0.38, 0.82, 0.82]), opacity: kf([3.9, 4.6], [0, 1]) },
    // Sol: parábola da esquerda (manhã) ao ápice no dia e se põe à direita, atrás dos cumes.
    ...(night ? {} : { sun: { arc: arc([0, 3.9], [0.08, 0.94], [0.7, 0.88, 0.2]), opacity: kf([0, 3.65, 3.9], [1, 1, 0]) } }),
  };
}

/** Gradiente do céu em S: média das fases pesada pela opacidade (a soma dos pesos é 1). */
export function skyAt(s, theme) {
  const out = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (const layer of skyLayers(theme)) {
    const w = interp(layer.input, layer.output, s);
    if (!w) continue;
    layer.colors.forEach((hex, stop) => {
      hexToRgb(hex).forEach((c, ch) => { out[stop][ch] += c * w; });
    });
  }
  return out;
}

/** Tudo que a cena precisa em S, além das cores de tinta (que vêm dos tokens CSS). */
export function sceneFrame(s, theme) {
  const k = sceneKeyframes(theme);
  const sunAlpha = k.sun ? at(k.sun.opacity, s) : 0;
  // Um disco só: o sol enquanto existe; a lua entra depois que ele se põe.
  const disc = sunAlpha > 0
    ? { moon: false, ...arcAt(k.sun.arc, s), alpha: sunAlpha }
    : { moon: true, ...arcAt(k.moon.arc, s), alpha: at(k.moon.opacity, s) };
  return {
    sky: skyAt(s, theme),
    lift: at(k.lift, s),
    clouds: at(k.clouds, s),
    stars: at(k.stars, s),
    disc,
  };
}

/** Modo efetivo dos tokens: escuro no tema Noite ou quando a fase é crepúsculo/noite (com histerese). */
export function modeFor(s, theme, prevMode = 'light') {
  if (theme === 'dark') return 'dark';
  if (s >= MODE_DARK_ENTER) return 'dark';
  if (s <= MODE_DARK_EXIT) return 'light';
  return prevMode === 'dark' ? 'dark' : 'light';
}

/** Movimento efetivo: o pedido do sistema por movimento reduzido vence o tweak. */
export function effectiveMotion(tweak, reducedMotion) {
  return reducedMotion || tweak === 'off' ? 'off' : 'on';
}
