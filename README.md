# Renan Skonicezny Vilela — Portfólio

Site pessoal e portfólio profissional de Renan Skonicezny Vilela.

- **Stack**: React 19 + Vite (JavaScript/JSX), CSS puro, Vitest + Testing Library.
- **Mascote & Assistente**: CapiBot, com respostas locais baseadas no currículo e integração opcional com a OpenAI Responses API.
- **Deploy**: site estático no GitHub Pages via GitHub Actions — <https://renansko.github.io/renansko-portifolio/>.
- **Contexto para agentes/devs**: [`docs/brain/index.md`](docs/brain/index.md).

## Como o CapiBot funciona

O RAG não está disponível nesta versão. Sem uma API key, o bot responde localmente a tópicos conhecidos do currículo. O visitante também pode informar temporariamente a própria chave para fazer perguntas livres: o contexto profissional fica embutido no prompt e a requisição parte diretamente do navegador para a OpenAI.

```text
sem chave: visitante → respostas locais do currículo
com chave: visitante → OpenAI Responses API + contexto do currículo → resposta
```

A chave digitada:

- fica só no estado em memória do componente durante a aba atual;
- não usa `localStorage`, `sessionStorage`, cookies nem backend do portfólio;
- é enviada apenas para `https://api.openai.com/v1/responses`;
- pode ser removida pelo botão **Esquecer** e desaparece ao recarregar ou fechar a aba.

Como a chamada é feita no navegador, prefira uma chave temporária, restrita e com limite de gastos. Nunca coloque uma chave do proprietário em variáveis `VITE_*`: elas vão para o bundle público.

## Desenvolvimento

```bash
npm install
npm run dev      # http://localhost:5173/renansko-portifolio/
npm test         # Vitest
npm run build    # gera dist/
npm run preview  # serve o build localmente
```

## Estrutura

```text
index.html            # shell do Vite (meta tags, fontes)
public/uploads/       # CV e imagens da capivara (copiados como estão)
src/
  App.jsx             # composição das seções + tweaks de tema
  components/         # Nav, Hero, About, Skills, Experience, Projects, Contact...
  capibot/            # CapiBot: UI, base local e cliente OpenAI
  i18n.js / data.js   # textos PT/EN e dados estruturados
  styles.css
tests/                # Vitest
```

## Deploy

Todo push na `main` dispara `.github/workflows/deploy.yml` (testes → build → GitHub Pages). Em **Settings → Pages**, a origem precisa estar como **GitHub Actions**.
