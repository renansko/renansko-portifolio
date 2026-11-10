# Conteúdo e i18n

Código: `src/i18n.js`, `src/i18n-context.jsx`, `src/data.js`, `src/storage.js`.

## Onde fica cada coisa

| Conteúdo | Arquivo |
| --- | --- |
| Textos traduzíveis (PT/EN), podendo ter `<strong>`, `<em>`, `<br/>` | `src/i18n.js` |
| Listas estruturadas: skills, experiências, projetos, stats, contatos | `src/data.js` |
| Conteúdo do CapiBot | `src/capibot/knowledge.js` (ver [CapiBot](../services/CapiBot.md)) |

- Projetos usam chaves por convenção: `proj_scope{n}`, `proj_role{n}`, `proj_desc{n}`. Novo projeto exige as três chaves
  nos dois idiomas.
- `T` renderiza a tradução com `dangerouslySetInnerHTML`: **só conteúdo estático do repositório**, nunca entrada do usuário.
- Chave ausente em EN cai para PT e depois para o nome da chave.
- Alguns rótulos (painel de tweaks, textos fixos do CapiBot) são só em PT, como no site original.

## Preferências persistidas

`src/storage.js` grava `lang` e `tweaks-v2` (accent, theme, density, motion; ver [DesignSystem](DesignSystem.md)) no `localStorage`, com `try/catch`
para janela privada. O `App` aplica `body[data-accent|data-theme|data-density]`; `data-mode` e `data-motion` são efetivos e escritos pela cena
([ScrollScene](ScrollScene.md)).
