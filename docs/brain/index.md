# Brain — renansko-portifolio

Wiki com o contexto **não evidente no código**. Comece por aqui; regras de manutenção em [AGENTS.md](AGENTS.md).

Portfólio pessoal em React 19 + Vite, publicado como site estático no GitHub Pages.

## Páginas

| Página | Descrição |
| --- | --- |
| [services/CapiBot](services/CapiBot.md) | Assistente do portfólio: respostas locais e OpenAI com a chave do visitante (invariantes de segurança). |
| [conventions/Deploy](conventions/Deploy.md) | Build Vite, caminho base `/renansko-portifolio/` e deploy via GitHub Actions. |
| [conventions/Content](conventions/Content.md) | Onde fica cada texto (i18n, dados, CapiBot) e como manter PT/EN em sincronia. |

## Mapa símbolo → página

| Símbolo | Página |
| --- | --- |
| `src/capibot/*` | [services/CapiBot](services/CapiBot.md) |
| `vite.config.js`, `.github/workflows/deploy.yml` | [conventions/Deploy](conventions/Deploy.md) |
| `src/i18n.js`, `src/data.js`, `src/storage.js` | [conventions/Content](conventions/Content.md) |

Histórico de mudanças relevantes: [log.md](log.md).
