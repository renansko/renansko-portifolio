# Design system "Dia de Sol"

Código: `src/styles.css` (tokens no `:root`), `src/components/Hero.jsx`, `src/components/TweaksPanel.jsx`, `src/scene/*`.

## Origem e limite de uso

A atmosfera veio de uma referência no Behance ("DONGURURU", filme promocional de Daegu Dong-gu, autor `kwaksu`):
céu, nuvens, campo e o visual 3D macio, de massinha. **Os personagens da referência pertencem ao distrito e não são usados.**
Toda a arte do site é original (cumes em sumi-e em WebGL com as cores dos tokens, ver [ScrollScene](ScrollScene.md); o shader é adaptado de código MIT). O mascote é a capivara própria do projeto.

## Tokens

- **Paleta:** `--sky-*`, `--cloud*`, `--grass-*`, `--forest-*`, `--stripe-*`, `--sun-*`, `--blush-400`, `--graphite-700`.
  Os componentes usam **papéis** (`--bg`, `--surface`, `--fg`, `--fg-muted`, `--accent`, `--on-accent`, `--accent-text`,
  `--cta`), nunca a paleta crua. Os destaques e o **modo efetivo** (`body[data-mode]`) só redefinem papéis.
  O tema salvo (`data-theme`) não dirige CSS; ver [ScrollScene](ScrollScene.md).
- **Contraste AA validado:** texto `--fg`/`--fg-muted` ≥ 5,2:1 nos dois temas. `--accent` é **preenchimento**;
  texto colorido usa `--accent-text`, que tem uma versão escura por destaque. Novo destaque exige os três papéis.
- **Espaço:** `--s-1..8` = 4, 8, 16, 24, 32, 48, 64, 96 (ritmo de 8; o 4 só para ajuste fino).
  `font-size`/`line-height` em múltiplos de 4.
- **Forma:** raios `--r-sm..xl` (12–32) e `--r-pill`. Profundidade com `--shadow-sm/md/lg` (difusa) +
  `--clay` (sombra interna inferior que dá o aspecto de massinha em botões, chips e swatches).
- **Fontes:** Fredoka (títulos) + Nunito (texto), carregadas no `index.html`.

## Composição (skill `fundamentos-ui`, projeto chemyia)

- Hero em **Z**: promessa à esquerda (7 col.); as 5 col. da direita ficam vazias de propósito e o sol/lua da cena de fundo
  ocupa o terço superior direito no início do percurso. CTA no fim da coluna de texto. Prova (números) numa faixa única.
- A paisagem é o backdrop fixo de toda a página (não há mais card ilustrado no hero nem paisagem própria no Contato).
- Seções com cabeçalho numerado no mesmo eixo; título e tag são pílulas de superfície. Cards só onde há grupo real
  (categoria, emprego, projeto). **Exceção:** `.panel` na coluna de texto do Sobre, porque texto corrido sobre o céu não garante AA.
- Marquee é fita com a largura do container e cantos arredondados (não deve ler como linha do horizonte).
- Cor de categoria dos projetos: `ai` = céu, `backend` = sol, `cloud` = campo (faixa superior do card).
- `prefers-reduced-motion` ou o tweak Movimento desligado param a cena, o marquee e o reveal (`body[data-motion="off"]`).
- Auditoria: `node /mnt/d/projetos/chemyia/.claude/skills/simetria-e-grid/scripts/grid-audit.mjs src`.

## Preferências

Ficam em `tweaks-v2` no localStorage (accent `grass|sky|stripe|sun`, theme `light|dark`, density, motion `on|off`).
A chave mudou de `tweaks` para `tweaks-v2` para não aplicar o cyan/dark do visual antigo.
