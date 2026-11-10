// Timeline pura da cena de planícies: fases de luz, keyframes por camada e regras de modo.
// Tudo é função de S (índice contínuo de seção, 0 = hero … 5 = contato).
// @wiki docs/brain/conventions/ScrollScene.md

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

/**
 * Keyframes por camada. `y` em vh (positivo = mais para baixo), `scale` e `opacity` adimensionais.
 * Camadas ausentes num tema não são renderizadas (ex.: sol no tema Noite).
 */
export function sceneLayers(theme) {
  const night = theme === 'dark';
  return {
    cloudsA: { y: kf([0, 2.6], [0, -55]), opacity: kf([0, 1.8, 2.6], [1, 1, 0]) },
    cloudsB: { y: kf([0, 3.2], [0, -75]), opacity: kf([0, 2.2, 3.2], [0.9, 0.9, 0]) },
    hillsFar: { y: kf([0, 5], [22, 0]), scale: kf([0, 5], [1, 1.12]) },
    tree: { scale: kf([0, 5], [1, 1.12]) },
    hillsNear: { y: kf([1, 5], [42, 0]), scale: kf([1, 5], [1, 1.2]) },
    grass: { y: kf([3.4, 5], [22, 0]) },
    veil: { opacity: night ? kf([0, 5], [0.35, 0.55]) : kf([2.8, 5], [0, 0.5]) },
    stars: { y: kf([0, 5], [0, -4]), opacity: night ? kf([0, 5], [1, 1]) : kf([3.8, 4.6], [0, 1]) },
    moon: night
      ? { y: kf([0, 5], [0, 8]), opacity: kf([0, 5], [1, 1]) }
      : { y: kf([3.7, 5], [15, 0]), opacity: kf([3.7, 4.5], [0, 1]) },
    ...(night ? {} : { sun: { y: kf([0, 3.8], [0, 40]), opacity: kf([0, 3.2, 3.9], [1, 1, 0]) } }),
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
