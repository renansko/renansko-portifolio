# Cena de scroll "entrando na planície"

Código: `src/scene/timeline.js` (puro), `src/scene/useSceneProgress.js`, `src/scene/PlainsScene.jsx`,
bloco "Cena de planícies" em `src/styles.css`. PRD: issue #2.

Um fundo fixo em camadas (céu, estrelas, sol/lua, nuvens, colinas + árvore, véu, capim) fica atrás de todo o conteúdo.
Rolar a página desce a câmera do céu ao chão e avança a luz do dia.

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
- Colinas tingem pelo véu inferior (opacidade por S) e pelos tokens `--hill-*`, que trocam com `data-mode`. Sem `mix-blend-mode`.

## Preferência de tema × modo efetivo

| Atributo no `body` | Significado | Quem escreve |
| --- | --- | --- |
| `data-theme` | preferência salva (`light`/`dark`) | `App` |
| `data-mode` | tokens efetivos: `dark` se tema Noite **ou** S na fase escura | só `PlainsScene` |
| `data-motion` | movimento efetivo (`on`/`off`) | só `PlainsScene` |

- Histerese: entra no escuro em `S ≥ 3,7`, volta ao claro em `S ≤ 3,4` (`modeFor`), para os cards não piscarem no limiar.
- **Todo CSS de tema escuro usa `body[data-mode="dark"]`.** Há teste que proíbe o seletor antigo `data-theme="dark"]`.
- `index.html` já nasce com `data-mode="light" data-motion="on"` para não haver flash antes do React.

## Contraste AA

Texto nunca fica solto sobre o céu fora do hero: cabeçalhos de seção viram pílulas de superfície, a coluna de texto do Sobre
usa `.panel`, o rodapé é uma faixa de superfície e o card de Contato é painel liso. No hero do tema Dia o céu de amanhecer
é claro; no tema Noite as nuvens são escuras e translúcidas. Cards têm transição de cor para o flip de modo.

## Performance

- `.scene`: `position: fixed`, ancorada **embaixo** com `100lvh` (capim não corta no iOS), `z-index: -1`, `contain: strict`,
  sem ponteiro, `aria-hidden`. O `#root` **não pode** criar stacking context (sumiria atrás do fundo do body ou na frente do conteúdo).
- Só `transform` e `opacity` mudam por frame. `will-change` só em camadas do tamanho do próprio conteúdo, nunca no céu.
- Até 700 px: sem 2º banco de nuvens, sem margaridas, metade das estrelas; no máximo cinco camadas com `will-change`.
- Motion via `m` + `LazyMotion features={domMin}`. **`m` sem `LazyMotion` não atualiza os estilos** (renderiza só o valor inicial).
  Usar `motion.*` completo custa ~+150 kB no bundle.

## Movimento desligado

`effectiveMotion(tweak, prefersReduced)`: o sistema vence o tweak. Desligado → S fixo em `STATIC_S = 2,5`, sem vínculo com o
scroll; `body[data-motion="off"]` para brilho, balanço, deriva, marquee e mostra `.reveal` sem animação. O modo passa a depender
só do tema. O tweak `motion` fica em `tweaks-v2` (linha "Movimento" no painel).

## Testes

`tests/timeline.test.js`, `tests/sceneProgress.test.js`, cena em `tests/app.test.jsx` e `tests/scene-reduced-motion.test.jsx`
(arquivo próprio: o Motion lê `prefers-reduced-motion` uma vez por módulo, então o stub de `matchMedia` é içado com `vi.hoisted`).
Verificação manual de layout/performance não é coberta por testes (ver PRD).
