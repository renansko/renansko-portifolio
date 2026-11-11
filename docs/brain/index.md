# Brain — renansko-portifolio

Wiki com o contexto **não evidente no código**. Comece por aqui; regras de manutenção em [AGENTS.md](AGENTS.md).

Portfólio pessoal em React 19 + Vite, publicado como site estático no GitHub Pages e na Vercel.

## Páginas

| Página | Descrição |
| --- | --- |
| [services/CapiBot](services/CapiBot.md) | Assistente do portfólio: respostas locais e OpenAI com a chave do visitante (invariantes de segurança). |
| [conventions/Deploy](conventions/Deploy.md) | Build Vite, `base` relativo (Pages + Vercel) e deploy via GitHub Actions. |
| [conventions/ScrollScene](conventions/ScrollScene.md) | Cena de planícies ligada ao scroll: progresso por seção, fases de luz, `data-theme` × `data-mode`, performance. |
| [conventions/DesignSystem](conventions/DesignSystem.md) | Tokens, paleta AA, grid de 8 px e composição do visual "Dia de Sol"; limite de uso da referência. |
| [conventions/Content](conventions/Content.md) | Onde fica cada texto (i18n, dados, CapiBot) e como manter PT/EN em sincronia. |

## Mapa símbolo → página

| Símbolo | Página |
| --- | --- |
| `src/capibot/*` | [services/CapiBot](services/CapiBot.md) |
| `vite.config.js`, `.github/workflows/deploy.yml` | [conventions/Deploy](conventions/Deploy.md) |
| `src/styles.css`, `src/components/Hero.jsx`, `src/components/TweaksPanel.jsx` | [conventions/ScrollScene](conventions/ScrollScene.md) | Cena de planícies ligada ao scroll: progresso por seção, fases de luz, `data-theme` × `data-mode`, performance. |
| [conventions/DesignSystem](conventions/DesignSystem.md) |
| `src/scene/*`, bloco "Cena de planícies" de `src/styles.css` | [conventions/ScrollScene](conventions/ScrollScene.md) |
| `src/i18n.js`, `src/data.js`, `src/storage.js` | [conventions/Content](conventions/Content.md) |

Histórico de mudanças relevantes: [log.md](log.md).
