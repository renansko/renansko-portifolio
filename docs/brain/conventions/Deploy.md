# Deploy

Código: `vite.config.js`, `.github/workflows/deploy.yml`, `public/`.

## Como funciona

- Push na `main` → GitHub Actions roda `npm ci`, `npm test` e `npm run build`, e publica `dist/` no Pages.
- Em **Settings → Pages**, a origem precisa ser **GitHub Actions**. Com a origem antiga ("Deploy from a branch"),
  o Pages serviria o `index.html` de desenvolvimento, que não funciona sem build.
- URL: <https://renansko.github.io/renansko-portifolio/>.

## Caminho base

- `base: '/renansko-portifolio/'` no Vite, porque é um site de projeto, não `renansko.github.io`.
  Renomear o repositório ou usar domínio próprio exige mudar o `base`.
- Assets estáticos ficam em `public/uploads/` e são referenciados com caminho **relativo** (`uploads/...`).
  Isso funciona porque a página é única e servida na raiz do `base`. Se entrar roteamento com paths,
  troque para `import.meta.env.BASE_URL`.
- Não há roteador. Se adicionar um, use `HashRouter` ou gere `404.html`: o Pages não tem fallback de SPA.

## Atenção

`public/uploads/` vai inteiro para o deploy, inclusive mídias que a página não usa
(`capivara_walk.gif`, os `.mp4` e o `.webp`).
