# CapiBot

Mascote (capivara) + assistente no canto da página.

Código: `src/capibot/CapiBot.jsx`, `src/capibot/knowledge.js`, `src/capibot/openai.js`.
Testes: `tests/capibot.test.jsx`.

## Dois modos

| Modo | Quando | Fonte |
| --- | --- | --- |
| Local | campo de API key vazio | `DIALOG_KNOWLEDGE` + `matchTopic` (palavras-chave, sem acento, a primeira regra que casar vence) |
| OpenAI | visitante colou uma chave | `POST https://api.openai.com/v1/responses`, modelo `gpt-4.1-mini`, prompt `CAPY_SYSTEM_PROMPT` |

Não existe RAG nem backend: o currículo está embutido no system prompt. Se o currículo mudar, atualize
`CAPY_SYSTEM_PROMPT`, `DIALOG_KNOWLEDGE` (PT e EN) e as seções da página juntos.

## Invariantes de segurança (cobertas por teste)

- A chave fica **só no estado React** do componente. Nada de `localStorage`, `sessionStorage`, cookies ou URL.
- O módulo `src/storage.js` é só para preferências; os arquivos do CapiBot não podem importá-lo.
- A chave é enviada **apenas** à OpenAI, no header `Authorization`, com `store: false`.
- Respostas do modelo passam por `renderAssistantText` (escapa HTML) antes do `dangerouslySetInnerHTML`.
  Os textos de `DIALOG_KNOWLEDGE` são HTML estático e confiável.
- O histórico enviado é limitado às últimas 6 mensagens.

## Decisão

Chave do proprietário no front-end está fora de questão (ficaria pública no bundle; o Vite expõe `VITE_*`).
Para respostas de IA sem a chave do visitante, é preciso um backend/proxy, que hoje não existe.

## Mascote

A pose estática é `uploads/capivara_idle.png`; o hover e o balão aberto mostram `uploads/capivara.gif`
(pré-carregado na montagem).
