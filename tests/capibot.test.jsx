import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CapiBot from '../src/capibot/CapiBot.jsx';
import { DIALOG_KNOWLEDGE, matchTopic } from '../src/capibot/knowledge.js';
import { askOpenAI, OPENAI_RESPONSES_URL, renderAssistantText } from '../src/capibot/openai.js';
import { LangProvider } from '../src/i18n-context.jsx';

const SRC = join(__dirname, '..', 'src');
const css = readFileSync(join(SRC, 'styles.css'), 'utf8');

function sourceFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? sourceFiles(full) : [full];
  });
}

function renderBot() {
  return render(
    <LangProvider>
      <CapiBot />
    </LangProvider>,
  );
}

describe('tema', () => {
  it('balão do CapiBot usa cores do tema para texto legível', () => {
    const bubbleCss = css.match(/\.capy-speech-bubble \{([\s\S]*?)\n\}/)?.[1] || '';
    expect(bubbleCss).toMatch(/background:\s*var\(--surface\)/);
    expect(bubbleCss).toMatch(/color:\s*var\(--fg\)/);
    expect(bubbleCss).not.toMatch(/rgba\(18,\s*18,\s*18/);
  });

  it('seleção usa fundo fixo claro e texto escuro fixo, legível nos dois temas', () => {
    const selectionCss = css.match(/::selection\s*\{([^}]*)\}/)?.[1] || '';
    expect(selectionCss).toMatch(/background:\s*var\(--sun-400\)/);
    expect(selectionCss).toMatch(/color:\s*#2f4a22/i);
    expect(selectionCss).not.toMatch(/color:\s*var\(--(bg|fg)\)/);
  });
});

describe('API key do visitante', () => {
  it('o CapiBot não importa o módulo de storage', () => {
    for (const name of ['CapiBot.jsx', 'openai.js', 'knowledge.js']) {
      expect(readFileSync(join(SRC, 'capibot', name), 'utf8')).not.toMatch(/storage/i);
    }
  });

  it('o campo é do tipo password', () => {
    renderBot();
    expect(screen.getByLabelText('OpenAI API key')).toHaveAttribute('type', 'password');
  });

  it('nunca é persistida em storage nem cookies em nenhum arquivo do front-end', () => {
    for (const file of sourceFiles(SRC)) {
      const code = readFileSync(file, 'utf8');
      expect(code, file).not.toMatch(/(localStorage|sessionStorage)\.setItem\(\s*['"`][^'"`]*(api|key)/i);
      expect(code, file).not.toMatch(/writeStorage\(\s*['"`][^'"`]*(api|key)/i);
      expect(code, file).not.toMatch(/document\.cookie/);
    }
  });

  it('não é gravada no storage ao digitar e esquecer', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    renderBot();
    const input = screen.getByLabelText('OpenAI API key');
    fireEvent.change(input, { target: { value: 'sk-test-123' } });
    fireEvent.click(screen.getByText('Esquecer'));
    expect(input).toHaveValue('');
    for (const [, value] of setItem.mock.calls) expect(value).not.toContain('sk-test-123');
    setItem.mockRestore();
  });

  it('é enviada apenas à OpenAI, com store: false', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ output_text: 'Oi!' }),
    });
    const result = await askOpenAI({ question: 'Quem é o Renan?', apiKey: 'sk-x', history: [], fetchImpl });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe(OPENAI_RESPONSES_URL);
    expect(url).toBe('https://api.openai.com/v1/responses');
    expect(init.headers.Authorization).toBe('Bearer sk-x');
    expect(JSON.parse(init.body).store).toBe(false);
    expect(result.answer).toBe('Oi!');
    expect(result.history).toHaveLength(2);
  });

  it('propaga a mensagem de erro da API', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: { message: 'Incorrect API key' } }),
    });
    await expect(askOpenAI({ question: 'x', apiKey: 'sk-bad', history: [], fetchImpl })).rejects.toThrow('Incorrect API key');
  });
});

describe('respostas locais', () => {
  it('casa palavras-chave com tópicos, ignorando acentos', () => {
    expect(matchTopic('Qual a stack?')).toBe('stack');
    expect(matchTopic('Formação na UFPR')).toBe('ufpr');
    expect(matchTopic('Como faço contato?')).toBe('contato');
    expect(matchTopic('xyz')).toBeNull();
  });

  it('escapa HTML vindo do modelo', () => {
    expect(renderAssistantText('<img src=x> **ok**')).toBe('&lt;img src=x&gt; <strong>ok</strong>');
  });

  it('sem chave, responde a partir do currículo local', () => {
    vi.useFakeTimers();
    renderBot();
    fireEvent.change(screen.getByLabelText('Pergunta para o CapiBot'), { target: { value: 'qual a stack?' } });
    fireEvent.click(screen.getByLabelText('Enviar'));
    act(() => vi.runAllTimers());
    const bubble = document.querySelector('.capy-bubble-text');
    const expected = document.createElement('div');
    expected.innerHTML = DIALOG_KNOWLEDGE.pt.stack;
    expect(bubble.innerHTML).toBe(expected.innerHTML);
    vi.useRealTimers();
  });
});
