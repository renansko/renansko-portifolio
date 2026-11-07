// Chamada direta navegador → OpenAI com a chave do visitante.
// Invariante: a chave nunca é persistida nem enviada a outro destino.
// @wiki docs/brain/services/CapiBot.md
import { CAPY_SYSTEM_PROMPT } from './knowledge.js';

export const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';
export const CAPY_MODEL = 'gpt-4.1-mini';
const HISTORY_WINDOW = 6;

export function responseText(payload) {
  if (typeof payload.output_text === 'string') return payload.output_text;
  return (payload.output || [])
    .flatMap((item) => item.content || [])
    .filter((item) => item.type === 'output_text')
    .map((item) => item.text || '')
    .join('\n');
}

/** Escapa HTML e aplica um markdown mínimo (**negrito** e quebras de linha). */
export function renderAssistantText(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
}

/**
 * Envia a pergunta e devolve { answer, history } com o novo histórico.
 * Lança Error com a mensagem da API em caso de falha.
 */
export async function askOpenAI({ question, apiKey, history, fetchImpl = fetch }) {
  const response = await fetchImpl(OPENAI_RESPONSES_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: CAPY_MODEL,
      instructions: CAPY_SYSTEM_PROMPT,
      input: [...history.slice(-HISTORY_WINDOW), { role: 'user', content: question }],
      max_output_tokens: 500,
      store: false,
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error?.message || `HTTP ${response.status}`);
  }

  const answer = responseText(payload).trim();
  if (!answer) throw new Error('A API respondeu sem texto. A capivara ficou contemplativa demais.');
  return {
    answer,
    history: [...history, { role: 'user', content: question }, { role: 'assistant', content: answer }],
  };
}
