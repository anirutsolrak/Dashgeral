# Plano 7: Redesign Visual Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir a paleta decorativa atual (5 accents de KPICard, 8 cores de gráfico, roxo/rosa/laranja/teal usados sem significado) por uma identidade visual restrita: azul (marca), um verde (destaque/positivo), cinza `slate` (neutro, já em uso) e âmbar/vermelho só para estados semânticos (aviso/erro/negativo).

**Architecture:** Tokens de cor centralizados em `src/index.css` — um bloco `@theme` novo (`--color-brand-*`, `--color-accent-*`) que gera utilitários Tailwind (`bg-brand-600` etc.), mais variáveis `--chart-series-N` (para os gráficos Recharts, que já resolvem cor via `var()`) e um par de arrays hex literais para o ECharts (que precisa de hex resolvido, não `var()`, porque calcula tons derivados em JS). Um único arquivo (`chartTheme.ts`) continua sendo a fonte de verdade dos gráficos Recharts; `echarts/palette.ts` já importa dele. `KPICard` troca o prop `accent` de 5 nomes de cor arbitrários para 5 papéis semânticos.

**Tech Stack:** Tailwind 4 (`@theme`), CSS custom properties, Recharts 3, Apache ECharts 6 — sem novas dependências.

**Validação de contraste (já rodada, valores abaixo já aprovados pelo script da skill `dataviz`):**

Conjunto categórico (4 cores + 1 neutro "outros"), validado `--pairs all` contra o fundo real dos cards (`#ffffff` claro / `#0f172a` escuro):

| Papel | Claro | Escuro |
|---|---|---|
| azul (marca) | `#2a78d6` | `#3987e5` |
| verde (destaque) | `#1baf7a` | `#199e70` |
| âmbar (aviso) | `#eda100` | `#a88500` |
| vermelho (crítico) | `#d03b3b` | `#e66767` |
| neutro "outros" | `slate-400`/`slate-500` (sem cor de identidade; só para uma 5ª fatia de baixa ênfase, nunca como 4ª+ cor competindo) | — |

Rampa completa de marca e destaque (para fundos/textos sólidos de UI, não gráfico):

```
brand:  50 #eef4fd  100 #dbe7fb  200 #b8d0f7  300 #8ab3f1  400 #5590e8
        500 #2a78d6  600 #2158b3  700 #1a4590  800 #163a76  900 #142f5e
        950 #0d2140  (dark-mode "500" visível = #3987e5; dark-mode "600" = #2f6fd6)
accent: 50 #e6f7f1  100 #c3ecdf  300 #5ecda3
        500 #1baf7a  600 #158f63  700 #0f6f4c
        950 #06251a  (dark-mode "500" visível = #199e70; dark-mode "600" = #158f63)
```

## Global Constraints

- TypeScript `strict: true`, sem `any` explícito.
- Não inventar cores novas fora do conjunto validado acima. Qualquer novo caso que "pareça precisar" de uma 5ª cor de identidade vira "Outros" em `slate`, nunca uma cor nova.
- `shared` não importa de `@/app`, `@/data` nem de `features`.
- Nenhum arquivo com mais de ~150 linhas escrito numa única chamada.
- Critério de "pronto" por tarefa: `npm test`, `npm run typecheck`, `npm run lint` (zero warnings) e `npm run build` limpos, **mais** checagem visual no navegador (claro e escuro) das telas que a tarefa tocou. Não é TDD tradicional — cor não é comportamento testável por unidade na maior parte dos casos, mas os testes existentes que fixam classes/hex precisam ser atualizados e continuar passando.
- Commits com o trailer `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`.
- Branch: `design/visual-refresh` (criada a partir de `main`). Não fazer push para `main` ao final — a controladora para para revisão do usuário antes.

## Mapa de arquivos

```
src/index.css                          tokens @theme + --chart-series-N (Task 1)
src/shared/charts/chartTheme.ts        CHART_COLORS/ACCENT_HEX novos (Task 2)
  + consumidores: LineChartCard, FinancialDetails, LogisticsCharts,
    DetailsContent (card-processing), InventoryCharts, RechartsPage (gallery)
src/shared/echarts/palette.ts          LIGHT/DARK.series explícitos (Task 3)
src/features/gallery/colors.ts         auditoria de contagem de séries (Task 3)
src/shared/ui/KPICard.tsx              accent semântico (Task 4)
  + consumidores: OverviewCards, FinancialKpis, InventoryKpis, LogisticsKpis
src/app/layout/AppLayout.tsx           nav ativo -> brand (Task 5)
src/shared/ui/Modal.tsx, DataTable.tsx, GlobalFiltersBar.tsx,
src/app/filters/AgreementFilters.tsx, src/features/logistics/LogisticsFilters.tsx
src/shared/maps/colors.ts, RegionMap.tsx, CoverageMap.tsx, RouteMap.tsx  (Task 5)
src/shared/flow/*, src/features/gallery/flow/GraphDiagram.tsx  (Task 6, auditoria)
```

---

### Task 1: Tokens de marca em `src/index.css`

**Files:**
- Modify: `src/index.css`

**Interfaces:**
- Produces: utilitários Tailwind `bg-brand-{50..950}`, `text-brand-*`, `border-brand-*`, `ring-brand-*` (idem para `accent-*`), via `@theme`. Variáveis `--chart-series-1` a `--chart-series-5` (`:root` e `.dark`), para uso direto em `chartTheme.ts`.

- [ ] **Step 1: Acrescentar o bloco `@theme` e as variáveis de série**

Editar `src/index.css` (arquivo inteiro fica assim; a ordem dos blocos `@theme`/`:root`/`.dark` importa para o Tailwind resolver certo):

```css
@import 'tailwindcss';
@custom-variant dark (&:where(.dark, .dark *));

@theme {
  --color-brand-50: #eef4fd;
  --color-brand-100: #dbe7fb;
  --color-brand-200: #b8d0f7;
  --color-brand-300: #8ab3f1;
  --color-brand-400: #5590e8;
  --color-brand-500: #2a78d6;
  --color-brand-600: #2158b3;
  --color-brand-700: #1a4590;
  --color-brand-800: #163a76;
  --color-brand-900: #142f5e;
  --color-brand-950: #0d2140;

  --color-accent-50: #e6f7f1;
  --color-accent-100: #c3ecdf;
  --color-accent-300: #5ecda3;
  --color-accent-500: #1baf7a;
  --color-accent-600: #158f63;
  --color-accent-700: #0f6f4c;
  --color-accent-950: #06251a;
}

body {
  @apply bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100;
}

:root {
  --chart-text: #64748b;
  --chart-grid: #e2e8f0;
  --chart-tooltip-bg: #ffffff;
  --chart-tooltip-border: #e2e8f0;
  --chart-tooltip-text: #0f172a;

  --chart-series-1: #2a78d6;
  --chart-series-2: #1baf7a;
  --chart-series-3: #eda100;
  --chart-series-4: #d03b3b;
  --chart-series-5: #94a3b8;

  /* Valores "vivos" das rampas de marca no tema claro (para código que precisa do hex
     resolvido em vez do nome da classe Tailwind, ex.: mapas e ECharts). */
  --color-brand-live: var(--color-brand-500);
  --color-accent-live: var(--color-accent-500);
}

.dark {
  --chart-text: #94a3b8;
  --chart-grid: #334155;
  --chart-tooltip-bg: #1e293b;
  --chart-tooltip-border: #334155;
  --chart-tooltip-text: #f1f5f9;

  --chart-series-1: #3987e5;
  --chart-series-2: #199e70;
  --chart-series-3: #a88500;
  --chart-series-4: #e66767;
  --chart-series-5: #64748b;

  --color-brand-500: #3987e5;
  --color-brand-600: #2f6fd6;
  --color-accent-500: #199e70;
  --color-accent-600: #158f63;
}
```

Nota: sobrescrever `--color-brand-500`/`600` e `--color-accent-500`/`600` dentro de `.dark` funciona porque o Tailwind v4 gera utilitários que referenciam a variável CSS (`background-color: var(--color-brand-500)`), então o valor é resolvido em tempo de uso, não de build — a mesma técnica já usada por `--chart-text` etc. Não sobrescrever os demais steps (50–400, 700–950): eles já têm contraste suficiente nos dois temas como estão (serão usados principalmente como fundo de tint claro + texto escuro, ou vice-versa, dentro de pares fixos por componente, não trocados dinamicamente).

- [ ] **Step 2: Verificar que o Tailwind gera as classes**

Run: `npm run dev` (ou `npm run build`) e confirmar que uma classe de teste como `bg-brand-500` aparece no CSS gerado:

```bash
npm run build 2>&1 | tail -5
grep -c "brand-500\|accent-500" dist/assets/*.css
```

Expected: build limpo e ao menos uma ocorrência de `brand-500`/`accent-500` no CSS (mesmo que nenhum componente use ainda — o Tailwind só emite classes referenciadas em algum arquivo `src/**`; se a contagem vier zero, é porque nada usa a classe ainda, o que é esperado nesta tarefa — não é falha. Confirmar em vez disso que `npm run build` não lança nenhum erro sobre `@theme` ou sintaxe CSS inválida).

- [ ] **Step 3: Rodar a verificação completa**

Run: `npm test && npm run typecheck && npm run lint && npm run build`
Expected: tudo passa (nenhum componente foi alterado ainda, então nada deveria mudar visualmente).

- [ ] **Step 4: Commit**

```bash
git add src/index.css && git commit -m "feat: add brand/accent color tokens and chart-series CSS variables

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 2: Paleta dos gráficos Recharts (`chartTheme.ts` e consumidores)

**Files:**
- Modify: `src/shared/charts/chartTheme.ts`, `src/shared/charts/LineChartCard.tsx`, `src/features/financial/FinancialDetails.tsx`, `src/features/logistics/LogisticsCharts.tsx`, `src/features/card-processing/details/DetailsContent.tsx`, `src/features/inventory/InventoryCharts.tsx`, `src/features/gallery/recharts/RechartsPage.tsx`

**Interfaces:**
- Consumes: `--chart-series-1..5` (Task 1).
- Produces: `CHART_COLORS: readonly string[]` (5 entradas, `var(--chart-series-N)`), `ACCENT_HEX: { blue; green; amber; red }` (sem mais `purple`/`pink`).

- [ ] **Step 1: Reescrever `chartTheme.ts`**

Trocar as duas constantes do topo do arquivo (mantém tudo o resto igual):

```ts
export const CHART_COLORS = [
  'var(--chart-series-1)',
  'var(--chart-series-2)',
  'var(--chart-series-3)',
  'var(--chart-series-4)',
  'var(--chart-series-5)',
] as const

export const ACCENT_HEX = {
  blue: 'var(--chart-series-1)',
  green: 'var(--chart-series-2)',
  amber: 'var(--chart-series-3)',
  red: 'var(--chart-series-4)',
} as const
```

- [ ] **Step 2: Atualizar os consumidores de `ACCENT_HEX.purple`/`ACCENT_HEX.pink`**

Cada um vira `ACCENT_HEX.blue` ou `ACCENT_HEX.green`, escolhido pelo significado do dado (não por gosto):

- `src/shared/charts/LineChartCard.tsx:32` — `color = ACCENT_HEX.purple` (valor padrão do componente) → `color = ACCENT_HEX.blue` (linha de tendência genérica; a página que já passa `color={ACCENT_HEX.red}` explicitamente, como `InventoryCharts` "Perdas no período", não é afetada por este default).
- `src/features/financial/FinancialDetails.tsx:104` — série `'Uso médio'` hoje `ACCENT_HEX.purple` → `ACCENT_HEX.blue` (é o valor "principal", a série `'Disponível médio'` ao lado já usa `ACCENT_HEX.green`, então o par fica azul/verde).
- `src/features/logistics/LogisticsCharts.tsx:19` — `color={ACCENT_HEX.pink}` (um `LineChartCard` sozinho) → `ACCENT_HEX.blue`.
- `src/features/logistics/LogisticsCharts.tsx:38` — série `'Flash'` hoje `ACCENT_HEX.purple` (ao lado de `'Terceiros'`, conferir a cor atual dela no arquivo e manter a outra ponta do par) → `ACCENT_HEX.blue`; se `'Terceiros'` já for `ACCENT_HEX.green`, manter; senão ajustar para `ACCENT_HEX.green` também, para o par ficar azul/verde.
- `src/features/card-processing/details/DetailsContent.tsx:29` — `{ label: 'Não digitadas', value: ..., color: ACCENT_HEX.pink }` → `ACCENT_HEX.red` (é uma métrica negativa; a fatia `'Digitadas'` ao lado deve usar `ACCENT_HEX.green`, conferir e ajustar se necessário).
- `src/features/inventory/InventoryCharts.tsx:19` — série `'Em trânsito'` hoje `ACCENT_HEX.purple` → `ACCENT_HEX.blue` (é neutra, nem "disponível" nem "perdido"; as séries vizinhas `'Disponíveis'`/`'Perdidos'` devem ser `ACCENT_HEX.green`/`ACCENT_HEX.red` — conferir e ajustar se necessário).
- `src/features/gallery/recharts/RechartsPage.tsx:52-53` — exemplo genérico de demonstração, `barSeries` com `ACCENT_HEX.purple` → `ACCENT_HEX.blue`; `lineSeries` com `ACCENT_HEX.pink` → `ACCENT_HEX.green` (mantém as duas séries do exemplo com cores diferentes).

Rodar `git grep -n "ACCENT_HEX\.\(purple\|pink\)" -- src` antes de finalizar o Step para confirmar que não sobrou nenhuma ocorrência.

- [ ] **Step 3: Rodar a verificação e checar visualmente**

Run: `npm test && npm run typecheck && npm run lint && npm run build`
Expected: os testes que comparavam classes/strings de cor podem precisar de ajuste (ex. `charts.test.tsx`, `GroupedBarChartCard.test.tsx` — se algum teste falhar comparando `style` ou `fill` a um hex literal antigo, atualizar a expectativa para `var(--chart-series-N)` correspondente. Isso é esperado, não é regressão).

Run: `npm run dev`, abrir cada página que este Task tocou (Card Processing → modal "Taxa de Integração", Financial → modal "Média de Uso", Inventory (gráfico "Estoque por item"), Logistics (gráfico principal e o "Flash vs. Terceiros"), Galeria → Recharts) nos temas claro e escuro. Confirmar que não sobrou nenhum roxo/rosa e que os pares fazem sentido (positivo=verde, negativo=vermelho, neutro=azul).

- [ ] **Step 4: Commit**

```bash
git add src/shared/charts src/features/financial/FinancialDetails.tsx src/features/logistics/LogisticsCharts.tsx src/features/card-processing/details/DetailsContent.tsx src/features/inventory/InventoryCharts.tsx src/features/gallery/recharts/RechartsPage.tsx && git commit -m "feat: apply blue/green/amber/red chart palette to Recharts components

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 3: Paleta do ECharts (`palette.ts`) e auditoria da Galeria

**Files:**
- Modify: `src/shared/echarts/palette.ts`

**Interfaces:**
- Consumes: `CHART_COLORS` (Task 2, agora 5 slots via `var()`).
- Produces: `LIGHT.series`/`DARK.series` como arrays de hex **literais** (não `var()` — o ECharts calcula tons derivados em JavaScript no momento da renderização e precisa da cor já resolvida, ele não entende `var(--x)` dentro do array `color` de tema).

- [ ] **Step 1: Separar `LIGHT.series` de `DARK.series`**

Hoje as duas constantes (`LIGHT` e `DARK`) apontam para o mesmo `CHART_COLORS` (que, depois do Task 2, virou uma lista de `var(--chart-series-N)` — isso não serve mais para o ECharts). Substituir o import e as duas constantes:

```ts
import type { EChartsOption } from './core'

export interface EChartPalette {
  text: string
  grid: string
  tooltipBg: string
  tooltipBorder: string
  tooltipText: string
  series: readonly string[]
}

const LIGHT_SERIES = ['#2a78d6', '#1baf7a', '#eda100', '#d03b3b', '#94a3b8'] as const
const DARK_SERIES = ['#3987e5', '#199e70', '#a88500', '#e66767', '#64748b'] as const

const LIGHT: EChartPalette = {
  text: '#64748b',
  grid: '#e2e8f0',
  tooltipBg: '#ffffff',
  tooltipBorder: '#e2e8f0',
  tooltipText: '#0f172a',
  series: LIGHT_SERIES,
}
const DARK: EChartPalette = {
  text: '#94a3b8',
  grid: '#334155',
  tooltipBg: '#1e293b',
  tooltipBorder: '#334155',
  tooltipText: '#f1f5f9',
  series: DARK_SERIES,
}
```

O resto do arquivo (`chartPalette`, `tooltipStyle`, `themeBase`) não muda.

- [ ] **Step 2: Auditar a contagem de categorias da Galeria**

Rodar `git grep -n "CHART_COLORS\[" -- src/shared/charts` e `cat src/features/gallery/colors.ts` para confirmar que `withColors` (que faz `CHART_COLORS[i % CHART_COLORS.length]`) nunca recebe mais de 5 séries em nenhum exemplo da Galeria — já checado pela controladora: o maior caso real no repo é 5 categorias (ex.: status de logística), e o array agora tem exatamente 5 slots, então `i % 5` nunca repete cor em nenhum uso atual. Se este Step encontrar algum lugar com mais de 5 categorias visíveis ao mesmo tempo (rodar `git grep -rn "label:" -- src/data/mock/gallery src/data/mock/breakdowns.ts src/data/mock/financial.ts` e contar entradas por array), reportar como concern em vez de inventar uma 6ª cor — a mitigação correta é reduzir para as 4-5 categorias mais relevantes e agrupar o resto, não adicionar cor nova.

- [ ] **Step 3: Rodar a verificação e checar visualmente**

Run: `npm test && npm run typecheck && npm run lint && npm run build`

Run: `npm run dev`, abrir `/gallery/echarts` nos dois temas e conferir os 5 exemplos (mapa de calor, funil, gauge, treemap, sankey) — nenhum deve mostrar cores diferentes do conjunto azul/verde/âmbar/vermelho/cinza.

- [ ] **Step 4: Commit**

```bash
git add src/shared/echarts/palette.ts && git commit -m "fix: give ECharts its own light/dark literal series colors

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 4: `KPICard` com accent semântico e seus 4 consumidores

**Files:**
- Modify: `src/shared/ui/KPICard.tsx`, `src/shared/ui/KPICard.test.tsx`, `src/features/card-processing/OverviewCards.tsx`, `src/features/financial/FinancialKpis.tsx`, `src/features/inventory/InventoryKpis.tsx`, `src/features/logistics/LogisticsKpis.tsx`

**Interfaces:**
- Produces: `export type KPIAccent = 'primary' | 'secondary' | 'warning' | 'critical' | 'neutral'` (era `'blue' | 'purple' | 'teal' | 'orange' | 'pink'`). `primary`→azul, `secondary`→verde, `warning`→âmbar, `critical`→vermelho, `neutral`→slate. Valor padrão do prop continua sendo o primeiro (`primary`).

- [ ] **Step 1: Reescrever `ACCENT_CLASSES` em `KPICard.tsx`**

```ts
export type KPIAccent = 'primary' | 'secondary' | 'warning' | 'critical' | 'neutral'

const ACCENT_CLASSES: Record<KPIAccent, string> = {
  primary: 'bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300',
  secondary: 'bg-accent-50 text-accent-600 dark:bg-accent-950 dark:text-accent-300',
  warning: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300',
  critical: 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-300',
  neutral: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
}
```

E trocar `accent = 'blue'` por `accent = 'primary'` na assinatura de `KPICard`.

- [ ] **Step 2: Atualizar `KPICard.test.tsx`**

O teste em `src/shared/ui/KPICard.test.tsx:35` usa `accent="teal"` — trocar para `accent="secondary"` (o teste só verifica que o ícone/accent renderiza, não testa a cor exata, então qualquer valor válido do novo tipo serve).

- [ ] **Step 3: Remapear os 16 call sites, por significado**

`src/features/card-processing/OverviewCards.tsx` (array `KPIS`):
- `integration` (Taxa de Integração): `'purple'` → `'primary'`
- `accounts` (Contas Criadas): `'teal'` → `'primary'`
- `cards` (Cartões Enviados): `'orange'` → `'primary'`
- `insurance` (Propostas com Seguro): `'pink'` → `'secondary'`

`src/features/financial/FinancialKpis.tsx`:
- `usage` (Taxa de Utilização): `accent="teal"` → `accent="secondary"`
- `total` (Valor Total Utilizado): `accent="purple"` → `accent="primary"`
- `average` (Média de Uso): `accent="orange"` → `accent="primary"`
- `logistics` (Custos Logísticos): `accent="pink"` → `accent="primary"`

`src/features/inventory/InventoryKpis.tsx` (array `ITEMS` + card de perdas):
- `cards`: `'blue'` → `'primary'`
- `envelopes`: `'teal'` → `'primary'`
- `letters`: `'purple'` → `'primary'`
- `losses` (Perdas Totais, card fixo fora do array): `accent="orange"` → `accent="critical"` (é a única métrica genuinamente negativa da página)

`src/features/logistics/LogisticsKpis.tsx` (array `ITEMS`):
- `entregue` (Entregues, bom): `'teal'` → `'secondary'`
- `pendente` (Em Trânsito, neutro): `'blue'` → `'primary'`
- `custodia` (Custódia, atenção): `'orange'` → `'warning'`
- `devolvido` (Devolvido, ruim): `'purple'` → `'critical'`

Rodar `git grep -n "accent[=:]\s*['\"]\(blue\|purple\|teal\|orange\|pink\)['\"]" -- src` ao final do Step para confirmar que não sobrou nenhum nome antigo.

- [ ] **Step 4: Rodar a verificação e checar visualmente**

Run: `npm test && npm run typecheck && npm run lint && npm run build`

Run: `npm run dev`, abrir as 4 páginas (Card Processing, Financial, Inventory, Logistics) nos dois temas. Confirmar: a maioria dos ícones de KPI está em azul (esperado — é o resultado de "menos cara de IA", não um bug); Logística mostra claramente 1 verde (Entregues), 1 âmbar (Custódia) e 1 vermelho (Devolvido); Inventory mostra 1 vermelho (Perdas Totais); Card Processing mostra 1 verde (Propostas com Seguro) e o resto azul.

- [ ] **Step 5: Commit**

```bash
git add src/shared/ui/KPICard.tsx src/shared/ui/KPICard.test.tsx src/features/card-processing/OverviewCards.tsx src/features/financial/FinancialKpis.tsx src/features/inventory/InventoryKpis.tsx src/features/logistics/LogisticsKpis.tsx && git commit -m "feat: give KPICard semantic accents (primary/secondary/warning/critical/neutral)

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 5: Casca do app (nav, tabela) e os 3 mapas

**Files:**
- Modify: `src/app/layout/AppLayout.tsx`, `src/shared/ui/DataTable.tsx`, `src/shared/maps/colors.ts`, `src/shared/maps/CoverageMap.tsx`, `src/shared/maps/RouteMap.tsx`

**Interfaces:**
- Consumes: tokens `brand-*`/`accent-*` (Task 1).

- [ ] **Step 1: Nav ativo e linha selecionada da tabela**

`src/app/layout/AppLayout.tsx:31` — trocar `'bg-blue-600 text-white'` por `'bg-brand-600 text-white'`.

`src/shared/ui/DataTable.tsx:229` — trocar `'bg-blue-50 dark:bg-blue-950/40'` por `'bg-brand-50 dark:bg-brand-950/40'`.

- [ ] **Step 2: Alinhar os mapas ao conjunto validado**

`src/shared/maps/colors.ts` — `defaultColorFor` hoje usa `#10b981`/`#f59e0b`/`#ef4444` (Tailwind padrão, próximo mas não idêntico ao conjunto validado). Trocar pelos hex exatos da Task 1 (o mapa não muda de tema — os tiles do OpenStreetMap são sempre claros — então usar só a versão "claro" das cores, sem variante escura):

```ts
export const defaultColorFor = (value: number): string =>
  value >= 85 ? '#1baf7a' : value >= 75 ? '#eda100' : '#d03b3b'
```

`src/shared/maps/CoverageMap.tsx:43` — `color: '#14b8a6', fillColor: '#14b8a6'` (teal, decorativo) → `'#1baf7a'` (o verde do conjunto).

`src/shared/maps/RouteMap.tsx:64` — `color: '#3b82f6'` (rota, azul genérico do Tailwind) → `'#2a78d6'` (o azul de marca exato).
`src/shared/maps/RouteMap.tsx:72` — `color: '#a855f7', fillColor: '#a855f7'` (roxo, marcador de destino) → `'#1baf7a'` (verde — cria um par de duas cores só, rota azul / destino verde, mais limpo que rota azul / destino roxo).

- [ ] **Step 3: Rodar a verificação e checar visualmente**

Run: `npm test && npm run typecheck && npm run lint && npm run build`

Run: `npm run dev`, abrir: qualquer página (conferir o item ativo do menu lateral em azul), Galeria → Tabelas (conferir a linha selecionada), Galeria → Mapas (conferir bolhas coloridas, cobertura em círculo verde, rotas em azul/verde), Financial (mapa de desbloqueio por região) — nos dois temas.

- [ ] **Step 4: Commit**

```bash
git add src/app/layout/AppLayout.tsx src/shared/ui/DataTable.tsx src/shared/maps && git commit -m "feat: align nav, table selection and map colors to the new palette

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 6: Auditoria final de cores decorativas e React Flow

**Files:**
- Nenhum arquivo de produção deveria precisar de mudança nesta tarefa (React Flow já usa `colorMode` da própria lib e texto neutro, sem cor decorativa hardcoded). Esta tarefa é de **verificação**, não de implementação — se ela encontrar algo, o Step 2 diz o que fazer.

- [ ] **Step 1: Varredura de cores fora do conjunto validado**

```bash
git grep -niE "purple|pink|violet|indigo|cyan|fuchsia|lime|rose" -- 'src/**/*.ts' 'src/**/*.tsx' ':!*.test.ts' ':!*.test.tsx'
```

Expected: nenhuma ocorrência (as Tasks 2, 4 e 5 já devem ter eliminado todas). `teal`/`orange` também podem ser buscados (`git grep -niE "teal-[0-9]|orange-[0-9]"`), mas cuidado: `orange` pode aparecer legitimamente em nomes de variável não relacionados a cor — ler o resultado antes de agir.

- [ ] **Step 2: Se a varredura encontrar algo**

Cada ocorrência precisa virar `brand`/`accent`/`slate` ou uma das cores de estado (`amber`/`red`), pelo mesmo critério das tarefas anteriores (significado do dado, não gosto). Se não houver certeza do significado, usar `primary`/azul como padrão neutro. Se a varredura não encontrar nada, pular para o Step 3 sem alterar nenhum arquivo.

- [ ] **Step 3: Checar React Flow visualmente**

Run: `npm run dev`, abrir Card Processing → qualquer KPI → "Organograma" e "Fluxograma", e Galeria → Fluxos (os 4 exemplos, incluindo o "Pipeline com status" que usa verde/âmbar/vermelho/slate para status de nó) — nos dois temas. Confirmar que os nós, bordas e o painel de controle do React Flow têm contraste adequado e nada aparece na cor errada.

- [ ] **Step 4: Rodar a verificação completa**

Run: `npm test && npm run typecheck && npm run lint && npm run build`

- [ ] **Step 5: Commit (só se o Step 2 tiver alterado algo)**

```bash
git add -A && git commit -m "fix: remove remaining decorative colors found by the final sweep

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

Se nada foi alterado, não há commit nesta tarefa — registrar no relatório que a varredura não encontrou nada.

---

### Task 7: QA visual completa e revisão final do plano

**Files:** nenhum (tarefa de verificação e, se necessário, pequenos ajustes finais).

- [ ] **Step 1: Percorrer todas as rotas, claro e escuro**

Com `npm run dev` no ar, abrir cada uma destas rotas nos dois temas (botão "Alternar tema"), tirando print ou conferindo visualmente:

`/card-processing`, `/financial`, `/inventory`, `/logistics`, `/gallery`, `/gallery/recharts`, `/gallery/echarts`, `/gallery/maps`, `/gallery/tables`, `/gallery/flow`.

Em cada uma, conferir:
- Nenhum roxo/rosa/laranja/teal decorativo restante (só azul, verde, cinza, e âmbar/vermelho em contexto de estado).
- Os cards de KPI, gráficos, tabelas, mapas e diagramas têm contraste legível nos dois temas.
- Os modais de detalhe (clicar em pelo menos 1 KPI por página) abrem com as mesmas cores.
- Os filtros (período, região, convênio, tipo/etapa de logística) continuam com o mesmo visual neutro de antes (não fazem parte do escopo de cor, mas confirmar que nada quebrou visualmente).

- [ ] **Step 2: Rodar a suíte completa duas vezes**

Run: `npm test` (duas vezes seguidas — a suíte deve ficar estável), `npm run typecheck`, `npm run lint` (zero warnings), `npm run build`.

- [ ] **Step 3: Reportar à controladora**

Resumo do que foi validado, qualquer achado (mesmo pequeno) das Tasks 1–6 que ficou pendente, e confirmação explícita de que nenhum roxo/rosa/laranja/teal decorativo restou em nenhuma das 10 rotas, nos dois temas.

---

## Self-Review

- **Cobertura do pedido:** paleta azul + 1 verde + neutro em todo o app (Tasks 1, 2, 4, 5), vermelho/âmbar mantidos só para estado (aprovado pelo usuário; já é o padrão em `SummaryStat`, `GraphDiagram` e nos badges de status — não precisou de mudança nesses três), validação de contraste rodada pelo script da skill `dataviz` antes de qualquer código ser escrito (não "no olho"), componentes de risco (KPICard, gráficos, mapas, tabela, nav, React Flow) listados e tratados um a um com checagem visual nos dois temas.
- **Placeholders:** nenhum. Os valores hex, os arquivos e as linhas exatas vêm de leitura direta do código nesta sessão, não de suposição.
- **Consistência:** `CHART_COLORS`/`ACCENT_HEX` (Recharts, via `var()`) e `LIGHT_SERIES`/`DARK_SERIES` (ECharts, hex literal) apontam para os mesmos 5 tons em cada tema; `KPIAccent` novo é consumido de forma idêntica nas 4 páginas; os tokens `brand-*`/`accent-*` do Task 1 são a única fonte usada por todas as tarefas seguintes.
- **Risco aceito e documentado:** nenhuma 5ª+ cor de identidade nova é criada; casos com exatamente 5 categorias (motivos de parada, status de logística/custos) usam o 5º slot neutro por design, não workaround.
