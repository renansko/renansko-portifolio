# Deploy

Código: `vite.config.js`, `.github/workflows/deploy.yml`, `public/`.

## Como funciona

- Push na `main` → GitHub Actions roda `npm ci`, `npm test` e `npm run build`, e publica `dist/` no Pages.
- Em **Settings → Pages**, a origem precisa ser **GitHub Actions**. Com a origem antiga ("Deploy from a branch"),
  o Pages serviria o `index.html` de desenvolvimento, que não funciona sem build.
- URLs: <https://renansko.github.io/renansko-portifolio/> (Pages) e <https://renansko-portifolio.vercel.app/>
  (Vercel, integração Git do próprio painel da Vercel, fora deste repositório).

## Caminho base

- `base: './'` (relativo) no Vite: o mesmo `dist/` serve no Pages (subcaminho `/renansko-portifolio/`)
  e na Vercel (raiz). Um `base` absoluto quebra um dos dois — foi o que deixou a Vercel em branco
  (assets em 404) até 2026-11-10.
- Assets estáticos ficam em `public/uploads/` e são referenciados com caminho **relativo** (`uploads/...`).
  Isso funciona porque a página é única e servida na raiz do `base`. Se entrar roteamento com paths,
  o `base` relativo deixa de servir: aí será preciso um `base` por ambiente (ex.: `process.env.VERCEL`).
- Não há roteador. Se adicionar um, use `HashRouter` ou gere `404.html`: o Pages não tem fallback de SPA.

## Atenção

`public/uploads/` vai inteiro para o deploy, inclusive mídias que a página não usa
(`capivara_walk.gif`, os `.mp4` e o `.webp`).
