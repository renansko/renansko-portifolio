// Renderizador WebGL2 dos cumes em sumi-e: um quad, um programa, sem texturas; desenha sob demanda.
// Shader adaptado de ink-ridges (ryanonline1234/ease-atlas, MIT) para as cores do design:
// céu em gradiente (fases de luz), tinta por profundidade (--hill-*), sol/lua, estrelas e nuvens claras.
// @wiki docs/brain/conventions/ScrollScene.md
import { MAX_LAYERS } from './ridges.js';

const VERT = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

// Cada crista é fbm + um termo "ridged" para picos mais vivos; abaixo dela a tinta afina até o pé,
// quebrada pela textura do pincel e mais carregada na crista; névoa sobe de cada pé; uma varredura
// irregular da esquerda para a direita pinta cada cume. O disco do sol tem borda ondulada pelo ruído,
// pigmento acumulado na borda e granulação; o cume mais distante pinta por cima dele.
const FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform vec2 uResolution;
uniform float uTime;
uniform float uSeed;
uniform float uMist;
uniform float uDrift;
uniform float uGrain;
uniform int uLayers;
uniform vec4 uLayer[5];
uniform float uPaint[5];
uniform float uPaintAll;
uniform vec2 uShift;
uniform float uLift;
uniform vec3 uSkyTop;
uniform vec3 uSkyMid;
uniform vec3 uSkyBottom;
uniform vec3 uInkFar;
uniform vec3 uInkNear;
uniform vec3 uInkDeep;
uniform vec3 uCloudColor;
uniform float uClouds;
uniform float uStars;
uniform vec3 uSunColor;
uniform vec4 uSun;
uniform float uSunAlpha;
uniform float uMoon;
uniform float uSunGrow;
uniform float uGlow;
uniform float uHorizonY;
uniform int uBirdCount;
uniform vec4 uBird[8];
uniform float uBirdAlpha;
uniform float uBirdDir;
uniform int uBirdLayer;

uint hashU(uvec2 p) {
  uint n = p.x * 1664525u ^ (p.y * 22695477u + 12345u);
  n ^= n >> 15u; n *= 2246822519u;
  n ^= n >> 13u; n *= 3266489917u;
  n ^= n >> 16u;
  return n;
}
float hash2(vec2 p) {
  ivec2 ip = ivec2(floor(p)) + 32768;
  return float(hashU(uvec2(ip))) / 4294967295.0;
}
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash2(i), hash2(i + vec2(1.0, 0.0)), u.x), mix(hash2(i + vec2(0.0, 1.0)), hash2(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 5; i++) {
    v += a * vnoise(p);
    p = m * p * 2.03 + 11.7;
    a *= 0.5;
  }
  return v;
}
float fbm3(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 3; i++) {
    v += a * vnoise(p);
    p = m * p * 2.03 + 11.7;
    a *= 0.5;
  }
  return v / 0.875 * 0.96875;
}

float birdInk(vec2 uv, float aspect) {
  float ink = 0.0;
  for (int b = 0; b < 8; b++) {
    if (b >= uBirdCount) break;
    vec4 B = uBird[b];
    vec2 q = (uv - B.xy) * vec2(aspect, 1.0) / B.z;
    if (abs(q.x) > 1.25 || abs(q.y) > 1.25) continue;
    q.x *= uBirdDir;
    float ax = abs(q.x);
    float wingY = B.w * ax - 0.28 * ax * ax + 0.06;
    float thick = 0.11 * (1.0 - ax) + 0.03;
    float wing = (1.0 - smoothstep(thick, thick + 0.05, abs(q.y - wingY))) * (1.0 - smoothstep(0.95, 1.05, ax));
    float body = 1.0 - smoothstep(0.08, 0.13, length(vec2(q.x * 0.8 - 0.05, q.y * 1.4)));
    ink = max(ink, max(wing, body));
  }
  return ink * uBirdAlpha;
}

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / uResolution.y;

  // céu: o mesmo gradiente de três paradas das fases de luz (topo, 55%, base)
  vec3 col = uv.y > 0.45
    ? mix(uSkyMid, uSkyTop, (uv.y - 0.45) / 0.55)
    : mix(uSkyBottom, uSkyMid, uv.y / 0.45);

  // estrelas: pontos esparsos por célula, piscando devagar
  if (uStars > 0.0) {
    vec2 g = uv * vec2(aspect, 1.0) * 70.0;
    float h = hash2(floor(g) + vec2(uSeed * 3.0, 0.0));
    if (h > 0.982) {
      vec2 f = fract(g) - 0.5 - (vec2(hash2(floor(g) + 17.0), hash2(floor(g) + 29.0)) - 0.5) * 0.5;
      float tw = 0.6 + 0.4 * sin(uTime * (1.0 + h * 2.0) + h * 80.0);
      float star = 1.0 - smoothstep(0.04, 0.12 + 0.06 * fract(h * 97.0), length(f));
      col = mix(col, vec3(0.992, 0.965, 0.863), star * tw * uStars * smoothstep(0.3, 0.6, uv.y));
    }
  }

  vec2 sc = uSun.xy + uShift * 0.1;
  float bloom = smoothstep(0.0, 0.2, uSunGrow) * uSunAlpha;
  if (uGlow > 0.0 && bloom > 0.0) {
    float ds = length((uv - sc) * vec2(aspect, 1.0));
    float halo = exp(-pow(ds / (uSun.z * 3.2), 2.0));
    float haze = exp(-pow((uv.y - uHorizonY) / 0.12, 2.0));
    col = mix(col, uSunColor, uGlow * (mix(0.3, 0.1, uMoon) * halo + mix(0.08, 0.02, uMoon) * haze) * bloom);
  }
  vec3 skyBack = col; // o céu sem o sol: o cume distante pinta por cima do sol, nunca através
  if (bloom > 0.0) {
    vec2 dv = (uv - sc) * vec2(aspect, 1.0);
    float d = length(dv);
    float R = uSun.z * mix(0.15, 1.0, uSunGrow);
    if (d < R * 1.2) {
      vec2 dir = dv / max(d, 1e-5);
      float wob = (fbm3(dir * 1.6 + uSeed * 0.37) - 0.5) * mix(0.07, 0.025, uMoon) + (vnoise(dir * 11.0 + uSeed) - 0.5) * mix(0.03, 0.01, uMoon);
      float r = R * (1.0 + wob);
      float disc = 1.0 - smoothstep(r - R * 0.03, r + R * 0.02, d);
      vec2 lq = dv / R;
      float gran = fbm3(lq * 7.0 + uSeed * 1.3) - 0.5;
      float pool = smoothstep(0.6, 1.0, d / r);
      float wash = clamp(dot(lq, vec2(-0.6, 0.8)) * 0.5 + 0.5, 0.0, 1.0);
      float dens = 0.86 + 0.12 * pool - 0.1 * wash + 0.12 * gran;
      vec3 pig = uSunColor * (1.0 - 0.12 * pool * pool);
      if (uMoon > 0.5) {
        dens = 0.9 - 0.16 * smoothstep(0.45, 0.72, fbm3(lq * 1.9 + 3.0 + uSeed * 0.2)) + 0.06 * gran;
        pig = uSunColor;
      }
      col = mix(col, pig, clamp(disc * dens, 0.0, 1.0) * bloom);
    }
    if (uClouds > 0.0 && d < uSun.z * 3.2) {
      vec2 mq = dv / uSun.z;
      float streak = fbm3(vec2(mq.x * 0.55 + uTime * uDrift * 0.6 + uSeed * 0.7, mq.y * 2.6 + uSeed));
      float strip = exp(-pow((mq.y + 0.42) / 0.32, 2.0));
      float wisp = smoothstep(0.42, 0.72, streak) * strip * smoothstep(3.2, 1.4, length(mq)) * smoothstep(0.0, 0.5, uClouds);
      col = mix(col, uCloudColor, wisp * 0.7 * bloom);
    }
  }
  // nuvens: pinceladas longas e claras que derivam com a névoa
  if (uClouds > 0.0) {
    vec2 cq = vec2(uv.x * aspect * 0.8 + uTime * uDrift * 0.15 + uSeed * 0.53, uv.y * 11.0);
    float streak = smoothstep(0.5, 0.8, fbm3(cq));
    float inSky = smoothstep(uHorizonY - 0.02, uHorizonY + 0.2, uv.y) * (1.0 - smoothstep(0.92, 1.0, uv.y));
    col = mix(col, uCloudColor, uClouds * 0.6 * streak * inSky * smoothstep(0.0, 0.4, uPaintAll));
  }

  for (int i = 0; i < 5; i++) {
    if (i >= uLayers) break;
    vec4 L = uLayer[i];
    float fi = float(i);
    float depth = uLayers > 1 ? fi / float(uLayers - 1) : 1.0;
    vec2 p = uv + uShift * (0.25 + depth) + vec2(0.0, uLift * (0.35 + 0.65 * depth));
    float x = p.x * aspect;
    float n = fbm(vec2(x * L.z + uSeed * 1.37 + fi * 7.31, fi * 3.7 + uSeed * 0.71));
    float ridged = 1.0 - abs(2.0 * vnoise(vec2(x * L.z * 2.3 + fi * 5.1 + uSeed, fi + uSeed * 0.3)) - 1.0);
    float h = L.x + L.y * ((n - 0.5) * 2.0 + (ridged - 0.5) * 0.35);

    float bleed = 0.0025 + 0.004 * vnoise(vec2(x * 40.0, fi * 9.0));
    float below = smoothstep(h + bleed, h - bleed, p.y);
    if (below > 0.0) {
      if (i == 0) col = mix(col, skyBack, below);
      vec3 inkCol = mix(uInkFar, uInkNear, depth);
      float fall = clamp((h - p.y) / (0.12 + 0.08 * depth), 0.0, 1.0);
      float tex = fbm3(vec2(x * 18.0, p.y * 22.0) + fi * 4.0 + uSeed);
      float dens = L.w * (1.0 - uMist * 0.95 * fall) * (0.82 + 0.36 * tex);
      float fog = smoothstep(0.42, 0.78, fbm3(vec2(x * 1.6 + uTime * uDrift * (0.4 + depth), p.y * 5.0 + fi * 2.0)));
      dens *= 1.0 - uMist * fog * fall * 0.9;

      float edge = mix(-0.2, 1.2, uPaint[i]) + (fbm3(vec2(p.y * 14.0, fi * 3.0 + uSeed)) - 0.5) * 0.18;
      float painted = 1.0 - smoothstep(edge - 0.035, edge + 0.035, uv.x);
      col = mix(col, inkCol, clamp(below * dens * painted, 0.0, 1.0));

      // a crista: o pincel aperta mais na linha do cume e falha onde seca
      float under = h - p.y;
      if (under < 0.03) {
        float crest = 1.0 - smoothstep(0.0, 0.004 + 0.01 * depth, under);
        float press = smoothstep(0.25, 0.7, vnoise(vec2(x * 9.0 + fi * 13.0, fi * 2.0 + uSeed)));
        col = mix(col, uInkDeep, clamp(crest * crest * press * (0.25 + 0.35 * depth) * below * painted, 0.0, 1.0));
      }
    }
    // a revoada passa na frente do cume que segue e atrás dos mais próximos
    if (i == uBirdLayer && uBirdCount > 0) col = mix(col, uInkDeep, birdInk(uv, aspect) * 0.85);
  }

  col += (hash2(uv * uResolution * 0.5) - 0.5) * uGrain * 0.1;
  fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

const UNIFORMS = [
  'uResolution', 'uTime', 'uSeed', 'uMist', 'uDrift', 'uGrain', 'uLayers', 'uLayer', 'uPaint', 'uPaintAll',
  'uShift', 'uLift', 'uSkyTop', 'uSkyMid', 'uSkyBottom', 'uInkFar', 'uInkNear', 'uInkDeep', 'uCloudColor',
  'uClouds', 'uStars', 'uSunColor', 'uSun', 'uSunAlpha', 'uMoon', 'uSunGrow', 'uGlow', 'uHorizonY',
  'uBirdCount', 'uBird', 'uBirdAlpha', 'uBirdDir', 'uBirdLayer',
];

export class RidgesGL {
  constructor(canvas, onRestore) {
    this.canvas = canvas;
    this.onRestore = onRestore;
    this.gl = null;
    this.program = null;
    this.loc = new Map();
    this.lost = false;
    this.handleLost = (e) => {
      e.preventDefault(); // obrigatório, senão o navegador nunca restaura o contexto
      this.lost = true;
      this.ok = false;
    };
    this.handleRestored = () => {
      this.lost = false;
      this.ok = this.init();
      if (this.ok) this.onRestore();
    };
    canvas.addEventListener('webglcontextlost', this.handleLost);
    canvas.addEventListener('webglcontextrestored', this.handleRestored);
    this.ok = this.init();
  }

  init() {
    let gl = null;
    try {
      gl = this.canvas.getContext('webgl2', { alpha: false, antialias: false, powerPreference: 'low-power' });
    } catch {
      return false;
    }
    if (!gl || gl.isContextLost()) return false;
    const compile = (type, src) => {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (gl.getShaderParameter(sh, gl.COMPILE_STATUS)) return sh;
      console.error('[ink-ridges] shader', gl.getShaderInfoLog(sh));
      return null;
    };
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return false;
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('[ink-ridges] link', gl.getProgramInfoLog(program));
      return false;
    }
    gl.useProgram(program);
    gl.bindVertexArray(gl.createVertexArray());
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    this.loc.clear();
    for (const name of UNIFORMS) this.loc.set(name, gl.getUniformLocation(program, name));
    this.gl = gl;
    this.program = program;
    return true;
  }

  resize(w, h) {
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
  }

  draw(f) {
    const gl = this.gl;
    if (!gl || !this.program || !this.ok || this.lost) return;
    const W = this.canvas.width;
    const H = this.canvas.height;
    gl.viewport(0, 0, W, H);
    const L = (n) => this.loc.get(n);
    gl.uniform2f(L('uResolution'), W, H);
    gl.uniform1f(L('uTime'), f.time);
    gl.uniform1f(L('uSeed'), f.seed);
    gl.uniform1f(L('uMist'), f.mist);
    gl.uniform1f(L('uDrift'), f.drift);
    gl.uniform1f(L('uGrain'), f.grain);
    gl.uniform1i(L('uLayers'), f.layers.length);
    const layerData = new Float32Array(MAX_LAYERS * 4);
    const paintData = new Float32Array(MAX_LAYERS);
    f.layers.forEach((l, i) => {
      layerData.set([l.base, l.amp, l.freq, l.ink], i * 4);
      paintData[i] = f.paint[i] ?? 1;
    });
    gl.uniform4fv(L('uLayer'), layerData);
    gl.uniform1fv(L('uPaint'), paintData);
    gl.uniform1f(L('uPaintAll'), f.paintAll);
    gl.uniform2f(L('uShift'), f.shift[0], f.shift[1]);
    gl.uniform1f(L('uLift'), f.lift);
    gl.uniform3f(L('uSkyTop'), ...f.sky[0]);
    gl.uniform3f(L('uSkyMid'), ...f.sky[1]);
    gl.uniform3f(L('uSkyBottom'), ...f.sky[2]);
    gl.uniform3f(L('uInkFar'), ...f.inkFar);
    gl.uniform3f(L('uInkNear'), ...f.inkNear);
    gl.uniform3f(L('uInkDeep'), ...f.inkDeep);
    gl.uniform3f(L('uCloudColor'), ...f.cloudColor);
    gl.uniform1f(L('uClouds'), f.clouds);
    gl.uniform1f(L('uStars'), f.stars);
    gl.uniform3f(L('uSunColor'), ...f.sunColor);
    gl.uniform4f(L('uSun'), ...f.sun);
    gl.uniform1f(L('uSunAlpha'), f.sunAlpha);
    gl.uniform1f(L('uMoon'), f.moon ? 1 : 0);
    gl.uniform1f(L('uSunGrow'), f.sunGrow);
    gl.uniform1f(L('uGlow'), f.glow);
    gl.uniform1f(L('uHorizonY'), f.horizonY);
    const birdData = new Float32Array(8 * 4);
    f.birds.slice(0, 8).forEach((b, i) => birdData.set([b.x, b.y, b.size, b.flap], i * 4));
    gl.uniform1i(L('uBirdCount'), Math.min(8, f.birds.length));
    gl.uniform4fv(L('uBird'), birdData);
    gl.uniform1f(L('uBirdAlpha'), f.birdAlpha);
    gl.uniform1f(L('uBirdDir'), f.birdDir);
    gl.uniform1i(L('uBirdLayer'), f.birdLayer);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  dispose() {
    this.canvas.removeEventListener('webglcontextlost', this.handleLost);
    this.canvas.removeEventListener('webglcontextrestored', this.handleRestored);
    if (this.gl && this.program && !this.lost) this.gl.deleteProgram(this.program);
    this.gl = null;
    this.program = null;
  }
}
