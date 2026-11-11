// Partes puras dos cumes em sumi-e: camadas, pincelada de entrada, ruído (espelho do GLSL) e revoada.
// Adaptado de ink-ridges (ryanonline1234/ease-atlas, MIT): o GLSL do ruído é o mesmo, então
// `ridgeLineAt` devolve exatamente a crista que o shader desenha. @wiki docs/brain/conventions/ScrollScene.md

export const MAX_LAYERS = 5;
export const clamp01 = (t) => Math.min(1, Math.max(0, t));

/** Cume i de n: o mais distante fica no horizonte; os próximos são mais baixos, altos, recortados e densos. */
export function layerAt(i, n, horizon) {
  const depth = n <= 1 ? 1 : i / (n - 1);
  const h = Math.min(0.82, Math.max(0.3, horizon));
  return {
    base: n <= 1 ? h : h - (h - 0.2) * depth,
    amp: 0.07 + 0.06 * depth,
    freq: 1.3 + 1.9 * depth,
    ink: 0.5 + 0.45 * depth,
    depth,
  };
}

/** Quanto do cume i de n já foi pincelado no progresso p. O mais distante começa primeiro. */
export function paintAt(p, i, n) {
  if (n <= 1) return clamp01(p);
  const stagger = Math.min(0.18, 0.6 / (n - 1));
  const span = 1 - stagger * (n - 1);
  return clamp01((p - i * stagger) / span);
}

/** Desabrochar do sol/lua no progresso p: é o último toque, como uma gota de pigmento. */
export function sunBloom(p) {
  const t = clamp01((p - 0.55) / 0.4);
  return 1 - (1 - t) ** 3;
}

function hashU(x, y) {
  let n = (Math.imul(x, 1664525) ^ (Math.imul(y, 22695477) + 12345)) >>> 0;
  n = (n ^ (n >>> 15)) >>> 0;
  n = Math.imul(n, 2246822519) >>> 0;
  n = (n ^ (n >>> 13)) >>> 0;
  n = Math.imul(n, 3266489917) >>> 0;
  n = (n ^ (n >>> 16)) >>> 0;
  return n;
}

/** Espelho do hash2 do GLSL: um valor por célula inteira, em [0, 1]. */
export function hash2(x, y) {
  return hashU(Math.floor(x) + 32768, Math.floor(y) + 32768) / 4294967295;
}

const mix = (a, b, t) => a + (b - a) * t;

export function vnoise(x, y) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  return mix(mix(hash2(ix, iy), hash2(ix + 1, iy), ux), mix(hash2(ix, iy + 1), hash2(ix + 1, iy + 1), ux), uy);
}

/** Espelho do fbm do GLSL: cinco oitavas, mesma rotação e deslocamento. */
export function fbm(x, y) {
  let v = 0;
  let a = 0.5;
  for (let i = 0; i < 5; i += 1) {
    v += a * vnoise(x, y);
    const nx = (0.8 * x - 0.6 * y) * 2.03 + 11.7;
    const ny = (0.6 * x + 0.8 * y) * 2.03 + 11.7;
    x = nx;
    y = ny;
    a *= 0.5;
  }
  return v;
}

/** Quanto o cume afunda pela câmera: o mais próximo afunda mais (paralaxe ao rolar). */
export const liftFor = (lift, depth) => lift * (0.35 + 0.65 * depth);

/**
 * Altura (uv, 0 embaixo a 1 em cima) da crista do cume i em x, igual ao shader.
 * o = { n, horizon, seed, aspect, shift: [x, y], lift }
 */
export function ridgeLineAt(i, uvx, o) {
  const L = layerAt(i, o.n, o.horizon);
  const k = 0.25 + L.depth;
  const x = (uvx + o.shift[0] * k) * o.aspect;
  const n = fbm(x * L.freq + o.seed * 1.37 + i * 7.31, i * 3.7 + o.seed * 0.71);
  const ridged = 1 - Math.abs(2 * vnoise(x * L.freq * 2.3 + i * 5.1 + o.seed, i + o.seed * 0.3) - 1);
  const h = L.base + L.amp * ((n - 0.5) * 2 + (ridged - 0.5) * 0.35);
  return h - o.shift[1] * k - liftFor(o.lift ?? 0, L.depth);
}

/**
 * A revoada t segundos depois de partir: um V solto que segue o cume `layer`, batendo asas e planando.
 * f = { duration, dir: 1 | -1, count, layer, seed }
 */
export function birdsAt(f, t, o) {
  const u = clamp01(t / f.duration);
  const lead = f.dir > 0 ? -0.12 + 1.3 * u : 1.12 - 1.3 * u;
  const alpha = clamp01(Math.min(u / 0.08, (1 - u) / 0.08, 1));
  const L = layerAt(f.layer, o.n, o.horizon);
  const cruise = L.base + L.amp - liftFor(o.lift ?? 0, L.depth);
  const birds = [];
  for (let k = 0; k < f.count; k += 1) {
    const rank = Math.ceil(k / 2);
    const side = k === 0 ? 0 : k % 2 ? 1 : -1;
    const r = hash2(k * 3.1 + f.seed * 7.7, f.seed * 1.3 + k);
    const x = lead - f.dir * rank * (0.028 + 0.008 * r);
    const ridge = ridgeLineAt(f.layer, x, o);
    const bob = 0.005 * Math.sin(t * 1.6 + k * 1.9);
    const y = Math.max(ridge + 0.07, 0.5 * (cruise + ridge) + 0.08) + side * rank * 0.018 + bob;
    const glide = 0.5 + 0.5 * Math.sin(t * 0.8 + k * 2.3);
    const flap = (0.15 + 0.4 * glide) * Math.sin(t * (8 + 2 * r) + k * 1.3);
    birds.push({ x, y, size: 0.011 + 0.004 * r, flap });
  }
  return { alpha, birds };
}

/** Suavização exponencial que se comporta igual a 60 Hz e 120 Hz. */
export function damp(current, target, lambda, dt) {
  return target + (current - target) * Math.exp(-lambda * dt);
}

function cubicBezier(x1, y1, x2, y2) {
  const bx = (t) => 3 * (1 - t) * (1 - t) * t * x1 + 3 * (1 - t) * t * t * x2 + t * t * t;
  const by = (t) => 3 * (1 - t) * (1 - t) * t * y1 + 3 * (1 - t) * t * t * y2 + t * t * t;
  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let lo = 0;
    let hi = 1;
    let t = x;
    for (let i = 0; i < 40; i += 1) {
      t = (lo + hi) / 2;
      if (bx(t) < x) lo = t;
      else hi = t;
    }
    return by(t);
  };
}

/** Curva da pincelada: cubic-bezier(0.7, 0, 0.2, 1). */
export const brush = cubicBezier(0.7, 0, 0.2, 1);

/** '#rgb' ou '#rrggbb' → [r, g, b] em [0, 1]; null se não for hex. */
export function hexToRgb(css) {
  const m = String(css).trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  const hex = m[1].length === 3 ? m[1].split('').map((c) => c + c).join('') : m[1];
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
}
