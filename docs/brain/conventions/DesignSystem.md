# Design system "Dia de Sol"

Código: `src/styles.css` (tokens no `:root`), `src/components/Hero.jsx` (cena), `src/components/TweaksPanel.jsx`.

## Origem e limite de uso

A atmosfera veio de uma referência no Behance ("DONGURURU", filme promocional de Daegu Dong-gu, autor `kwaksu`):
céu, nuvens, campo e o visual 3D macio, de massinha. **Os personagens da referência pertencem ao distrito e não são usados.**
Toda a arte do site é original (cena SVG do hero e colinas do contato). O mascote é a capivara própria do projeto.

## Tokens

- **Paleta:** `--sky-*`, `--cloud*`, `--grass-*`, `--forest-*`, `--stripe-*`, `--sun-*`, `--blush-400`, `--graphite-700`.
  Os componentes usam **papéis** (`--bg`, `--surface`, `--fg`, `--fg-muted`, `--accent`, `--on-accent`, `--accent-text`,
  `--cta`), nunca a paleta crua. Os temas (Dia/Noite) e os destaques só redefinem papéis.
- **Contraste AA validado:** texto `--fg`/`--fg-muted` ≥ 5,2:1 nos dois temas. `--accent` é **preenchimento**;
  texto colorido usa `--accent-text`, que tem uma versão escura por destaque. Novo destaque exige os três papéis.
- **Espaço:** `--s-1..8` = 4, 8, 16, 24, 32, 48, 64, 96 (ritmo de 8; o 4 só para ajuste fino).
  `font-size`/`line-height` em múltiplos de 4.
- **Forma:** raios `--r-sm..xl` (12–32) e `--r-pill`. Profundidade com `--shadow-sm/md/lg` (difusa) +
  `--clay` (sombra interna inferior que dá o aspecto de massinha em botões, chips e swatches).
- **Fontes:** Fredoka (títulos) + Nunito (texto), carregadas no `index.html`.

## Composição (skill `fundamentos-ui`, projeto chemyia)

- Hero em **Z**: promessa à esquerda (7 col.), cena à direita (5 col.) com a árvore no terço superior direito,
  CTA no fim da coluna de texto. Prova (números) numa faixa única, por região comum.
- Seções com cabeçalho numerado no mesmo eixo. Cards só onde há grupo real (categoria, emprego, projeto).
- Cor de categoria dos projetos: `ai` = céu, `backend` = sol, `cloud` = campo (faixa superior do card).
- `prefers-reduced-motion` desliga marquee, nuvens, reveal e transições.
- Auditoria: `node /mnt/d/projetos/chemyia/.claude/skills/simetria-e-grid/scripts/grid-audit.mjs src`.

## Preferências

Ficam em `tweaks-v2` no localStorage (accent `grass|sky|stripe|sun`, theme `light|dark`, density).
A chave mudou de `tweaks` para `tweaks-v2` para não aplicar o cyan/dark do visual antigo.
