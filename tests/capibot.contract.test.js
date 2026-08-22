const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

test('CapiBot bubble uses theme colors for readable text', () => {
  const bubbleCss = html.match(/\.capy-speech-bubble \{([\s\S]*?)\n\}/)?.[1] || '';
  assert.match(bubbleCss, /background:\s*var\(--bg-elev\)/);
  assert.match(bubbleCss, /color:\s*var\(--fg\)/);
  assert.doesNotMatch(bubbleCss, /rgba\(18,\s*18,\s*18/);
});

test('visitor API key is never persisted or sent to the portfolio backend', () => {
  const keyInput = html.match(/<input[^>]*id="capyApiKey"[^>]*>/)?.[0] || '';
  assert.match(keyInput, /type="password"/);
  assert.match(html, /fetch\('https:\/\/api\.openai\.com\/v1\/responses'/);
  assert.match(html, /store:\s*false/);
  assert.doesNotMatch(html, /localStorage\.setItem\([^)]*(api|key)/i);
  assert.doesNotMatch(html, /sessionStorage\.setItem\([^)]*(api|key)/i);
});

test('AI answers are grounded in the resume and rendered as escaped text', () => {
  assert.match(html, /CURRÍCULO DE REFERÊNCIA/);
  assert.match(html, /50 milhões\+ de mensagens/);
  assert.match(html, /replace\(\/<\/g, '&lt;'\)/);
});

test('inline JavaScript has valid syntax', () => {
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);
  for (const source of scripts) assert.doesNotThrow(() => new Function(source));
});
