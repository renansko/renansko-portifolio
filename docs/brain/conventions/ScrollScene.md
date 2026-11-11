# Cena de scroll: cumes em sumi-e

Código: `src/scene/timeline.js` (puro), `src/scene/useSceneProgress.js`, `src/scene/RidgesScene.jsx`,
`src/scene/ink/*` (partes puras + WebGL2), bloco "Cena de cumes" em `src/styles.css`. PRD original: issue #2.

Um canvas WebGL2 fixo atrás de todo o conteúdo desenha céu, estrelas, sol/lua, nuvens e quatro cumes pincelados.
Rolar a página sobe os cumes (câmera desce) e avança a luz do dia.

## Progresso `S` (índice de seção)

- `S` vai de 0 a 5 sobre `SECTION_IDS = top, about, skills, experience, projects, contact`.
  `S = i` quando o topo da seção `i` encosta no topo da viewport; linear por trechos entre elas.
- A faixa vem das posições **reais** das seções (`buildRange`): limitada ao scroll máximo, estritamente crescente
  (puxando as anteriores, para S chegar a 5 no fim da página) e com fallback `innerHeight × i` quando tudo mede zero (jsdom).
- Remede em `resize`, `ResizeObserver(body)` (com guarda se não existir) e `document.fonts.ready`. Trocar idioma ou densidade
  muda alturas, por isso **não** usar fração do documento (`scrollYProgress`).
- Sem spring: a câmera não atrasa e o flip de modo é imediato. O valor é lido de `window.scrollY` (recarga no meio da página).

## Fases de luz

- Dia: `dawn → day → golden → dusk → night`. Noite: `dusk → night → deep`. Só as fases do tema ativo são renderizadas.
- Cada fase tem um platô (`hold`) e cruza linearmente com a vizinha. **Invariante: a soma das opacidades do céu é 1 em todo S**
  (testado em `tests/timeline.test.js`). Nova fase exige platôs ordenados e sem sobreposição.
- Sol só no tema Dia (some após o crepúsculo); lua entra no fim do Dia e está sempre no tema Noite.
- Um disco só no shader: o sol enquanto existe; a lua só entra depois que ele se põe (atrás do cume distante).
- O céu do shader é `skyAt(S)`: média das cores das fases pesada pela opacidade. É o mesmo gradiente de 3 paradas (0/55/100%).

## Cumes em sumi-e (`src/scene/ink/`)

- Adaptado de *ink-ridges* (ryanonline1234/ease-atlas, **MIT**): manter a atribuição nos cabeçalhos dos arquivos.
- Cores **só dos tokens**, lidas do `body` a cada troca de `data-mode`: `--hill-back` (cume distante), `--hill-front`
  (próximo), `--hill-deep` (crista e revoada), `--scene-cloud`, `--sun-400`, `--moon`. A tinta é suavizada (~0,8 s).
  Os tokens precisam ser **hex** (`hexToRgb`); outro formato cai no fallback do Dia.
- `ridgeLineAt` (JS) espelha o ruído do GLSL para a revoada seguir a crista: mudar o ruído exige mudar os dois.
- `lift(S)` afunda os cumes (próximo afunda mais = paralaxe); sol/lua ficam no terço superior direito (foco do hero).

## Preferência de tema × modo efetivo

| Atributo no `body` | Significado | Quem escreve |
| --- | --- | --- |
| `data-theme` | preferência salva (`light`/`dark`) | `App` |
| `data-mode` | tokens efetivos: `dark` se tema Noite **ou** S na fase escura | só `RidgesScene` |
| `data-motion` | movimento efetivo (`on`/`off`) | só `RidgesScene` |

- Histerese: entra no escuro em `S ≥ 3,7`, volta ao claro em `S ≤ 3,4` (`modeFor`), para os cards não piscarem no limiar.
- **Todo CSS de tema escuro usa `body[data-mode="dark"]`.** Há teste que proíbe o seletor antigo `data-theme="dark"]`.
- `index.html` já nasce com `data-mode="light" data-motion="on"` para não haver flash antes do React.

## Contraste AA

Texto nunca fica solto sobre o céu fora do hero: cabeçalhos de seção viram pílulas de superfície, a coluna de texto do Sobre
usa `.panel`, o rodapé é uma faixa de superfície e o card de Contato é painel liso. No hero do tema Dia o céu de amanhecer
é claro; no tema Noite as nuvens são escuras e translúcidas. Cards têm transição de cor para o flip de modo.

## Performance

- `.scene`: `position: fixed`, ancorada **embaixo** com `100lvh`, `z-index: -1`, `contain: strict`, sem ponteiro,
  `aria-hidden`. O `#root` **não pode** criar stacking context (sumiria atrás do fundo do body ou na frente do conteúdo).
- Canvas em no máximo 1× DPR (0,75× até 700 px). Só a névoa derivando → ~30 fps; scroll, ponteiro, revoada e
  pincelada inicial desenham a cada frame. Aba oculta para o laço.
- Sem WebGL2 (ou em jsdom, onde `getContext` é stubado) o canvas some e `.scene-fallback` pinta o gradiente do céu.
- Motion só para o scroll (`useScroll`/MotionValue de S); a cena não usa componentes `m`.

## Movimento desligado

`effectiveMotion(tweak, prefersReduced)`: o sistema vence o tweak. Desligado → S fixo em `STATIC_S = 2,5`, sem vínculo com o
scroll, sem pincelada/névoa/revoada (um frame estático); `body[data-motion="off"]` para brilho, balanço, deriva, marquee e mostra `.reveal` sem animação. O modo passa a depender
só do tema. O tweak `motion` fica em `tweaks-v2` (linha "Movimento" no painel).

## Testes

`tests/timeline.test.js`, `tests/ridges.test.js`, `tests/sceneProgress.test.js`, cena em `tests/app.test.jsx` e `tests/scene-reduced-motion.test.jsx`
(arquivo próprio: o Motion lê `prefers-reduced-motion` uma vez por módulo, então o stub de `matchMedia` é içado com `vi.hoisted`).
Verificação manual de layout/performance não é coberta por testes (ver PRD).
