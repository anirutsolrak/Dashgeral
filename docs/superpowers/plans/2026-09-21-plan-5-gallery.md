# Plano 5: Galeria de Componentes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir a Galeria de Componentes: o índice `/gallery` (cards) e uma rota por biblioteca (`/gallery/recharts`, `/gallery/echarts`, `/gallery/maps`, `/gallery/tables`, `/gallery/flow`), cada uma com 4 a 6 exemplos com dados mock e uma nota curta de "quando usar esta lib".

**Architecture:** Cada exemplo é um componente pequeno dentro de uma página de biblioteca (`features/gallery/<lib>/`), embrulhado por `ExampleCard`. Os dados vêm de um repositório mock `gallery` (geradores de seed fixa, sem filtros). Componentes reutilizáveis ganham lugar em `shared`: gráficos Recharts novos, wrapper `EChart` (SVG renderer, import por módulo, chunk lazy), mapas de rota e cobertura, `DataTable` estendida (busca, paginação, seleção, expansão) e os componentes de React Flow extraídos do Plano 2. Cada rota de biblioteca é `lazy`, então ECharts e Leaflet só carregam quando a página é aberta.

**Tech Stack:** Recharts 3, Apache ECharts (novo; `echarts/core` com registro manual de gráficos), react-leaflet 5, @tanstack/react-table v8, @xyflow/react, TanStack Query, Vitest, Testing Library, Tailwind 4, lucide-react.

**Spec:** `docs/superpowers/specs/2026-09-21-dashboard-showcase-template-design.md`

**Depende de:** Planos 1 a 4 (branch `modernize/template`). Antes do Task 1, `npm test`, `npm run typecheck`, `npm run lint` (zero warnings) e `npm run build` devem estar verdes.

## Global Constraints

- TypeScript `strict: true`, sem `any` explícito.
- Datas, números e moedas em pt-BR via `@/shared/lib/formatters`.
- Dados mock determinísticos (seed fixa); nenhum acesso a rede, banco ou Supabase. Os tiles do mapa (OpenStreetMap) são recurso de UI, não dado.
- Ícones com `lucide-react`. Alias `@/` aponta para `src/`.
- `shared` não importa de `@/app`, `@/data` nem de `features`. Tema chega a `shared` por prop (`theme: 'light' | 'dark'`), nunca por `useAppTheme`.
- ECharts: importar só de `echarts/core`, `echarts/charts`, `echarts/components` e `echarts/renderers` (nunca `from 'echarts'`), com `SVGRenderer`. Só o chunk da rota `/gallery/echarts` pode conter ECharts; Leaflet só os chunks das rotas com mapa. O bundle inicial (`index-*.js`) não cresce.
- A Galeria ignora os filtros globais (dados de demonstração fixos); o índice avisa isso numa nota.
- Todo gráfico tem alternativa textual (`role="img"` com `aria-label`, ou tabela de valores) e funciona nos dois temas (variáveis `--chart-*` no Recharts; `theme` no ECharts).
- Testes: saída limpa (sem warnings de `act()`, dimensões do Recharts, Leaflet ou ECharts). Não criar mock global de `react-leaflet` nem de `echarts`; mockar só no arquivo de teste que precisar. O mock global de `recharts` continua (ver Task 1).
- `@latest` de dependência pode trazer major incompatível: conferir a API instalada antes de usar o código do plano.
- Nenhum arquivo com mais de ~150 linhas escrito numa única chamada.
- Commits com o trailer `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`.

## Mapa de arquivos

```
src/test/recharts.mock.test.tsx, recharts.real.test.tsx                          (Task 1)
src/shared/flow/{types.ts,layout.ts,flowUtils.tsx,FlowDiagram.tsx,OrgChart.tsx}  (Task 2, movidos)
src/shared/echarts/{core.ts,palette.ts,EChart.tsx}                               (Task 3)
src/shared/charts/{AreaChartCard,ComposedChartCard,RadarChartCard}.tsx           (Task 4)
src/shared/ui/DataTable.tsx                                                      (Task 5, modify)
src/shared/maps/{geo.ts,RouteMap.tsx,CoverageMap.tsx}                            (Task 6)
src/data/types/gallery.ts, data/mock/gallery/*.ts                                (Task 7)
src/data/repositories/{gallery.ts,mock/gallery.ts,index.ts}                      (Task 7)
src/features/gallery/api.ts                                                      (Task 7)
src/features/gallery/{libraries.ts,colors.ts,ExampleCard.tsx,LibraryPage.tsx,GalleryIndexPage.tsx}  (Task 8)
src/features/gallery/recharts/RechartsPage.tsx                                   (Task 9)
src/features/gallery/echarts/{options.ts,descriptions.ts}, EchartsPage.tsx       (Tasks 10, 11)
src/features/gallery/maps/MapsPage.tsx                                           (Task 12)
src/features/gallery/tables/{cells.tsx,columns.tsx,TablesPage.tsx}               (Task 13)
src/features/gallery/flow/{GraphDiagram.tsx,FlowPage.tsx}                        (Task 14)
src/app/routes.tsx                                                               (Tasks 8, 9, 11 a 14)
CLAUDE.md                                                                        (Tasks 1, 15)
```

---

### Task 1: Rever e fixar o comportamento do mock global de Recharts

**Por quê:** `src/test/setup.ts` substitui `ResponsiveContainer` por um clone do filho com `width: 400` e `height: 300`. Sem isso, o jsdom (sem layout) nunca dá dimensões ao container e nenhum gráfico renderiza. A Galeria usa tipos de gráfico novos (área, composto, radar); esta tarefa prova que o mock serve a todos e documenta como testar o container real quando necessário.

**Files:**
- Create: `src/test/recharts.mock.test.tsx`, `src/test/recharts.real.test.tsx`
- Modify: `CLAUDE.md` (linha de convenção sobre testes)

**Interfaces:**
- Consumes: mock global de `recharts` em `src/test/setup.ts` (não muda).
- Produces: nenhuma API nova; dois testes de caracterização e uma convenção documentada.

- [ ] **Step 1: Teste do mock global**

`src/test/recharts.mock.test.tsx`:

```tsx
import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import {
  Area, AreaChart, Bar, ComposedChart, Line, LineChart, PolarAngleAxis, PolarGrid, Radar,
  RadarChart, ResponsiveContainer, XAxis,
} from 'recharts'
import { describe, expect, it } from 'vitest'

const data = [{ name: 'A', a: 1, b: 2 }, { name: 'B', a: 3, b: 1 }]

const charts: [string, ReactElement][] = [
  ['LineChart', <LineChart data={data}><XAxis dataKey="name" /><Line dataKey="a" /></LineChart>],
  ['AreaChart', <AreaChart data={data}><Area dataKey="a" stackId="1" /><Area dataKey="b" stackId="1" /></AreaChart>],
  ['ComposedChart', <ComposedChart data={data}><Bar dataKey="a" /><Line dataKey="b" /></ComposedChart>],
  ['RadarChart', <RadarChart data={data}><PolarGrid /><PolarAngleAxis dataKey="name" /><Radar dataKey="a" /></RadarChart>],
]

describe('mock global do ResponsiveContainer', () => {
  it.each(charts)('deixa o %s renderizar um svg com as dimensões do mock', (_name, chart) => {
    const { container } = render(<ResponsiveContainer width="100%" height="100%">{chart}</ResponsiveContainer>)
    const svg = container.querySelector('svg.recharts-surface')
    expect(svg).not.toBeNull()
    expect(svg).toHaveAttribute('width', '400')
    expect(svg).toHaveAttribute('height', '300')
  })
})
```

- [ ] **Step 2: Teste do container real**

`src/test/recharts.real.test.tsx`:

```tsx
import { render } from '@testing-library/react'
import { Line, LineChart, ResponsiveContainer } from 'recharts'
import { describe, expect, it, vi } from 'vitest'

// Restaura o ResponsiveContainer de verdade neste arquivo (o mock global vem de src/test/setup.ts).
vi.unmock('recharts')

describe('ResponsiveContainer real no jsdom', () => {
  it('monta o container, mas sem layout ele não dá dimensões ao gráfico', () => {
    const { container } = render(
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={[{ a: 1 }, { a: 2 }]}><Line dataKey="a" /></LineChart>
      </ResponsiveContainer>,
    )
    expect(container.querySelector('.recharts-responsive-container')).not.toBeNull()
    expect(container.querySelector('svg[width="400"]')).toBeNull()
  })
})
```

- [ ] **Step 3: Rodar**

Run: `npx vitest run src/test/recharts.mock.test.tsx src/test/recharts.real.test.tsx`
Expected: PASS (5 testes), sem warnings de dimensão no console. Se `vi.unmock` no topo não restaurar o container real na versão instalada do Vitest, trocar por `vi.doUnmock('recharts')` seguido de `await import('recharts')` dentro do teste; o objetivo é apenas fixar o comportamento observado.

- [ ] **Step 4: Documentar a convenção**

Em `CLAUDE.md`, na linha de convenção "Testes: `ResponsiveContainer` do Recharts e stubs do React Flow são globais", acrescentar ao final da frase: `Para exercitar o ResponsiveContainer real use vi.unmock('recharts') no topo do arquivo (sem layout o jsdom não renderiza o svg; ver src/test/recharts.real.test.tsx). Só faça isso quando o teste for sobre o container em si.`

- [ ] **Step 5: Commit**

```bash
git add src/test CLAUDE.md
git commit -m "test: pin the global recharts mock behaviour and document the real container escape hatch

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 2: Mover os componentes de React Flow para `shared/flow`

**Por quê:** a Galeria precisa de `FlowDiagram` e `OrgChart`, hoje em `features/card-processing/workflow`. `shared` não pode importar de `app` nem de `data`, então o tema vira prop e os tipos viram estruturais.

**Files:**
- Move: `src/features/card-processing/workflow/{layout.ts,layout.test.ts,flowUtils.tsx,FlowDiagram.tsx,OrgChart.tsx}` para `src/shared/flow/`
- Create: `src/shared/flow/types.ts`
- Modify: `src/features/card-processing/workflow/WorkflowContent.tsx`
- Test: `src/shared/flow/layout.test.ts` (movido), `src/features/card-processing/workflow/WorkflowContent.test.tsx` (existente, não muda)

**Interfaces:**
- Produces (`src/shared/flow/types.ts`): `FlowTheme = 'light' | 'dark'`; `FlowStepInput { id: string; label: string }`; `OrgNodeInput { id: string; name: string; role: string; children: OrgNodeInput[] }`.
- Produces: `FlowDiagram({ steps: FlowStepInput[]; label: string; theme: FlowTheme })`, `OrgChart({ root: OrgNodeInput; label: string; theme: FlowTheme })`, `layoutFlow`, `layoutOrg`, `toNode`, `toEdge` com as mesmas assinaturas de hoje (trocando `FlowStep`/`OrgNode` pelos tipos `*Input`, que são estruturalmente iguais).

- [ ] **Step 1: Mover com histórico**

```bash
mkdir -p src/shared/flow
git mv src/features/card-processing/workflow/layout.ts src/shared/flow/layout.ts
git mv src/features/card-processing/workflow/layout.test.ts src/shared/flow/layout.test.ts
git mv src/features/card-processing/workflow/flowUtils.tsx src/shared/flow/flowUtils.tsx
git mv src/features/card-processing/workflow/FlowDiagram.tsx src/shared/flow/FlowDiagram.tsx
git mv src/features/card-processing/workflow/OrgChart.tsx src/shared/flow/OrgChart.tsx
```

- [ ] **Step 2: Criar os tipos estruturais**

`src/shared/flow/types.ts`:

```ts
export type FlowTheme = 'light' | 'dark'

export interface FlowStepInput {
  id: string
  label: string
}

export interface OrgNodeInput {
  id: string
  name: string
  role: string
  children: OrgNodeInput[]
}
```

- [ ] **Step 3: Ajustar `layout.ts` e seu teste**

Em `src/shared/flow/layout.ts`, trocar a primeira linha por `import type { FlowStepInput, OrgNodeInput } from './types'` e substituir `FlowStep` por `FlowStepInput` e `OrgNode` por `OrgNodeInput` nas assinaturas de `layoutFlow` e `layoutOrg` (e no `place`). Em `src/shared/flow/layout.test.ts`, trocar o import de tipos por `import type { OrgNodeInput } from './types'` e `OrgNode` por `OrgNodeInput`.

- [ ] **Step 4: Tema por prop em `FlowDiagram` e `OrgChart`**

Em `src/shared/flow/FlowDiagram.tsx`: remover `import { useAppTheme } ...` e `import type { FlowStep } ...`; importar `import type { FlowStepInput, FlowTheme } from './types'`; a assinatura vira `export function FlowDiagram({ steps, label, theme }: { steps: FlowStepInput[]; label: string; theme: FlowTheme })`; remover a linha `const { theme } = useAppTheme()`. O restante (o `useMemo`, o JSX com `colorMode={theme}`) fica igual.

Em `src/shared/flow/OrgChart.tsx`: mesma troca (`OrgNode` por `OrgNodeInput`, `theme: FlowTheme` na prop, remover `useAppTheme`). O `flowUtils.tsx` só importa `./layout`, então não muda.

- [ ] **Step 5: Atualizar o consumidor**

Em `src/features/card-processing/workflow/WorkflowContent.tsx`: trocar os imports de `./FlowDiagram` e `./OrgChart` por `@/shared/flow/FlowDiagram` e `@/shared/flow/OrgChart`, importar `useAppTheme` de `@/app/layout/ThemeContext`, chamar `const { theme } = useAppTheme()` no início do componente e passar `theme={theme}` aos dois.

- [ ] **Step 6: Verificar**

Run: `npx vitest run src/shared/flow src/features/card-processing` e `npm run typecheck` e `npm run lint`
Expected: tudo verde (o `WorkflowContent.test` continua passando sem mudanças porque `renderWithProviders` já provê o `ThemeProvider`). `grep -rn "workflow/FlowDiagram\|workflow/OrgChart\|workflow/layout" src` não deve listar nada.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "refactor: move React Flow components to shared/flow with theme as a prop

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 3: Instalar ECharts e criar o wrapper `EChart` (TDD)

**Files:**
- Modify: `package.json`, `package-lock.json` (via npm)
- Create: `src/shared/echarts/core.ts`, `src/shared/echarts/palette.ts`, `src/shared/echarts/EChart.tsx`
- Test: `src/shared/echarts/palette.test.ts`, `src/shared/echarts/EChart.test.tsx`

**Interfaces:**
- Produces (`core.ts`): `echarts` (namespace de `echarts/core` com gráficos e componentes registrados) e `type EChartsOption = EChartsCoreOption`.
- Produces (`palette.ts`): `EChartPalette { text; grid; tooltipBg; tooltipBorder; tooltipText: string; series: readonly string[] }`, `chartPalette(theme: 'light' | 'dark'): EChartPalette`, `tooltipStyle(p: EChartPalette)` (estilo do tooltip) e `themeBase(p: EChartPalette): EChartsOption` (fundo transparente, cores da série, cor de texto, estilo do tooltip e `aria.enabled`). Os valores espelham `--chart-*` de `src/index.css` (o canvas/SVG do ECharts não lê variáveis CSS, e ler `getComputedStyle` no efeito pega o tema antigo, pois efeitos de filho rodam antes do `useTheme` alternar a classe).
- Produces (`EChart.tsx`): `EChart({ title, description, option, height? })`: `section` com `h3`, e um `div role="img"` com `aria-label="<title>. <description>"` onde o ECharts desenha em SVG. Inicializa uma vez, chama `setOption(option, true)` a cada mudança de `option`, redimensiona com `ResizeObserver` e faz `dispose` ao desmontar.

- [ ] **Step 1: Instalar**

Run: `npm install echarts`
Depois conferir a versão e a estrutura: `node -e "console.log(require('echarts/package.json').version)"` e `ls node_modules/echarts | grep -E "^(charts|components|renderers|core)\.d\.ts$"`. Se a versão instalada for um major com API diferente de `echarts/core` + `echarts/charts` + `echarts/components` + `echarts/renderers`, fixar o major anterior (`npm install echarts@5`) e registrar no `CLAUDE.md` (Stack), como foi feito com o TanStack Table.

- [ ] **Step 2: Criar o `core.ts`**

`src/shared/echarts/core.ts`:

```ts
import { FunnelChart, GaugeChart, HeatmapChart, SankeyChart, TreemapChart } from 'echarts/charts'
import {
  AriaComponent,
  LegendComponent,
  GridComponent,
  TooltipComponent,
  VisualMapComponent,
} from 'echarts/components'
import * as echarts from 'echarts/core'
import type { EChartsCoreOption } from 'echarts/core'
import { SVGRenderer } from 'echarts/renderers'

// Registro manual: só o que a Galeria usa entra no chunk. Nunca importe de 'echarts' (bundle inteiro).
echarts.use([
  FunnelChart,
  GaugeChart,
  HeatmapChart,
  SankeyChart,
  TreemapChart,
  AriaComponent,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  VisualMapComponent,
  SVGRenderer,
])

export { echarts }
export type EChartsOption = EChartsCoreOption
```

- [ ] **Step 3: Teste da paleta (falha primeiro)**

`src/shared/echarts/palette.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { chartPalette, themeBase } from './palette'

describe('chartPalette', () => {
  it('mirrors the css chart variables for each theme', () => {
    expect(chartPalette('light')).toMatchObject({ text: '#64748b', grid: '#e2e8f0', tooltipBg: '#ffffff' })
    expect(chartPalette('dark')).toMatchObject({ text: '#94a3b8', grid: '#334155', tooltipBg: '#1e293b' })
  })
  it('exposes the same series colours as the Recharts wrappers', () => {
    expect(chartPalette('light').series).toHaveLength(8)
    expect(chartPalette('light').series[0]).toBe('#3b82f6')
  })
})

describe('themeBase', () => {
  it('sets a transparent background, the text colour and accessible aria', () => {
    const base = themeBase(chartPalette('dark')) as Record<string, unknown>
    expect(base.backgroundColor).toBe('transparent')
    expect(base.textStyle).toEqual({ color: '#94a3b8' })
    expect(base.aria).toEqual({ enabled: true })
  })
})
```

Run: `npx vitest run src/shared/echarts/palette.test.ts`
Expected: FAIL (módulo `./palette` não existe).

- [ ] **Step 4: Implementar a paleta**

`src/shared/echarts/palette.ts`:

```ts
import { CHART_COLORS } from '@/shared/charts/chartTheme'
import type { EChartsOption } from './core'

export interface EChartPalette {
  text: string
  grid: string
  tooltipBg: string
  tooltipBorder: string
  tooltipText: string
  series: readonly string[]
}

const LIGHT: EChartPalette = {
  text: '#64748b', grid: '#e2e8f0', tooltipBg: '#ffffff', tooltipBorder: '#e2e8f0', tooltipText: '#0f172a', series: CHART_COLORS,
}
const DARK: EChartPalette = {
  text: '#94a3b8', grid: '#334155', tooltipBg: '#1e293b', tooltipBorder: '#334155', tooltipText: '#f1f5f9', series: CHART_COLORS,
}

export const chartPalette = (theme: 'light' | 'dark'): EChartPalette => (theme === 'dark' ? DARK : LIGHT)

export const tooltipStyle = (p: EChartPalette) => ({
  backgroundColor: p.tooltipBg,
  borderColor: p.tooltipBorder,
  textStyle: { color: p.tooltipText },
})

export const themeBase = (p: EChartPalette): EChartsOption => ({
  backgroundColor: 'transparent',
  color: [...p.series],
  textStyle: { color: p.text },
  tooltip: tooltipStyle(p),
  aria: { enabled: true },
})
```

Run: `npx vitest run src/shared/echarts/palette.test.ts`
Expected: PASS. (`shared/echarts/palette.ts` importa de `@/shared/charts/chartTheme`, que é `shared`, então respeita a regra de camadas.)

- [ ] **Step 5: Teste do wrapper (falha primeiro)**

`src/shared/echarts/EChart.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const chart = vi.hoisted(() => ({ setOption: vi.fn(), resize: vi.fn(), dispose: vi.fn() }))
const init = vi.hoisted(() => vi.fn())

vi.mock('./core', () => ({ echarts: { init } }))

import { EChart } from './EChart'

describe('EChart', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    init.mockReturnValue(chart)
  })

  it('renders a titled figure with an accessible description', () => {
    render(<EChart title="Funil" description="Propostas: 100, Contas: 60" option={{}} />)
    expect(screen.getByRole('heading', { name: 'Funil' })).toBeInTheDocument()
    expect(screen.getByRole('img')).toHaveAccessibleName('Funil. Propostas: 100, Contas: 60')
  })

  it('initialises once with the SVG renderer and applies every new option', () => {
    const first = { series: [] }
    const second = { series: [{ type: 'funnel' }] }
    const { rerender } = render(<EChart title="T" description="d" option={first} />)
    expect(init).toHaveBeenCalledTimes(1)
    expect(init.mock.calls[0]![2]).toEqual({ renderer: 'svg' })
    expect(chart.setOption).toHaveBeenLastCalledWith(first, true)
    rerender(<EChart title="T" description="d" option={second} />)
    expect(init).toHaveBeenCalledTimes(1)
    expect(chart.setOption).toHaveBeenLastCalledWith(second, true)
  })

  it('disposes the chart on unmount', () => {
    const { unmount } = render(<EChart title="T" description="d" option={{}} />)
    unmount()
    expect(chart.dispose).toHaveBeenCalledTimes(1)
  })
})
```

Run: `npx vitest run src/shared/echarts/EChart.test.tsx`
Expected: FAIL (módulo `./EChart` não existe).

- [ ] **Step 6: Implementar o wrapper**

`src/shared/echarts/EChart.tsx`:

```tsx
import type { EChartsType } from 'echarts/core'
import { useEffect, useRef } from 'react'
import { CHART_CARD_CLASS } from '@/shared/charts/chartTheme'
import { echarts, type EChartsOption } from './core'

interface EChartProps {
  title: string
  description: string
  option: EChartsOption
  height?: number
}

export function EChart({ title, description, option, height = 320 }: EChartProps) {
  const host = useRef<HTMLDivElement>(null)
  const chart = useRef<EChartsType | null>(null)

  useEffect(() => {
    const el = host.current
    if (!el) return
    const instance = echarts.init(el, undefined, { renderer: 'svg' })
    chart.current = instance
    const observer = new ResizeObserver(() => instance.resize())
    observer.observe(el)
    return () => {
      observer.disconnect()
      instance.dispose()
      chart.current = null
    }
  }, [])

  useEffect(() => {
    chart.current?.setOption(option, true)
  }, [option])

  return (
    <section className={CHART_CARD_CLASS}>
      <h3 className="mb-2 text-base font-semibold">{title}</h3>
      <div ref={host} role="img" aria-label={`${title}. ${description}`} style={{ height }} />
    </section>
  )
}
```

Run: `npx vitest run src/shared/echarts`
Expected: PASS (5 testes). Se o `EChartsType` não for exportado por `echarts/core` na versão instalada, usar `ReturnType<typeof echarts.init>`.

- [ ] **Step 7: Fumaça com o ECharts real (opcional)**

`src/shared/echarts/core.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { echarts } from './core'

describe('echarts core', () => {
  it('draws an SVG in jsdom with the registered gauge chart', () => {
    const el = document.createElement('div')
    const chart = echarts.init(el, undefined, { renderer: 'svg', width: 400, height: 300 })
    chart.setOption({ series: [{ type: 'gauge', data: [{ value: 72 }] }] })
    expect(el.querySelector('svg')).not.toBeNull()
    chart.dispose()
  })
})
```

Run: `npx vitest run src/shared/echarts/core.test.ts`
Expected: PASS. Se o jsdom não suportar o SVG do ECharts (erro de medição de texto ou de `getBBox`), apagar este arquivo: o `npm run build` (Task 16) e a verificação no navegador cobrem o ECharts real.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json src/shared/echarts
git commit -m "feat: add ECharts with tree-shaken core, theme palette and EChart wrapper

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 4: Gráficos Recharts novos: área, composto e radar (TDD)

**Files:**
- Modify: `src/shared/charts/chartTheme.ts`
- Create: `src/shared/charts/AreaChartCard.tsx`, `ComposedChartCard.tsx`, `RadarChartCard.tsx`
- Test: `src/shared/charts/newCharts.test.tsx`

**Interfaces:**
- Consumes: `GroupedSeries { key; label; color }` e `GroupedDatum { label; [seriesKey]: string | number }` de `./GroupedBarChartCard`; `AXIS_TICK`, `CHART_CARD_CLASS`, `GRID_STROKE`, `LEGEND_LABEL_STYLE`, `TOOLTIP_STYLE`; `formatNumber`.
- Produces:
  - `describeSeries(series: GroupedSeries[], data: GroupedDatum[]): string` em `chartTheme.ts` (`"<label>: <serie> <n>, <serie> <n>; ..."`, mesmo formato do `GroupedBarChartCard`).
  - `AreaChartCard({ title?, series, data, stacked = true, height = 280 })`
  - `ComposedChartCard({ title?, barSeries, lineSeries, data, height = 280 })`
  - `RadarChartCard({ title?, series, data, height = 300 })` (cada linha de `data` é um eixo: `label` + um valor por série).
  Todos com `role="img"` e `aria-label` gerados por `describeSeries`, e legenda com `labelStyle={LEGEND_LABEL_STYLE}`.

- [ ] **Step 1: Escrever os testes que falham**

`src/shared/charts/newCharts.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AreaChartCard } from './AreaChartCard'
import { ComposedChartCard } from './ComposedChartCard'
import { RadarChartCard } from './RadarChartCard'

afterEach(() => vi.restoreAllMocks())

const series = [
  { key: 'a', label: 'Canal A', color: '#3b82f6' },
  { key: 'b', label: 'Canal B', color: '#10b981' },
]
const data = [
  { label: 'Jan', a: 1500, b: 300 },
  { label: 'Fev', a: 3000, b: 400 },
]

describe.each([
  ['AreaChartCard', () => <AreaChartCard title="Volume" series={series} data={data} />],
  ['ComposedChartCard', () => <ComposedChartCard title="Volume" barSeries={[series[0]!]} lineSeries={[series[1]!]} data={data} />],
  ['RadarChartCard', () => <RadarChartCard title="Volume" series={series} data={data} />],
])('%s', (_name, ui) => {
  it('renders a titled svg with an accessible summary and clean console', () => {
    const error = vi.spyOn(console, 'error')
    const warn = vi.spyOn(console, 'warn')
    const { container } = render(ui())
    expect(screen.getByRole('heading', { name: 'Volume' })).toBeInTheDocument()
    expect(container.querySelector('svg.recharts-surface')).not.toBeNull()
    expect(screen.getByRole('img')).toHaveAccessibleName(/Jan: /)
    expect(screen.getByRole('img')).toHaveAccessibleName(/Fev: /)
    expect(error).not.toHaveBeenCalled()
    expect(warn).not.toHaveBeenCalled()
  })

  it('renders legend labels in the theme text colour', () => {
    const { container } = render(ui())
    const labels = Array.from(container.querySelectorAll<HTMLElement>('.recharts-legend-item-text'))
    expect(labels.length).toBeGreaterThan(0)
    for (const label of labels) expect(label.getAttribute('style')).toContain('var(--chart-text)')
  })
})

describe('AreaChartCard', () => {
  it('stacks series by default and can be unstacked', () => {
    const stacked = render(<AreaChartCard series={series} data={data} />).container
    expect(stacked.querySelectorAll('.recharts-area')).toHaveLength(2)
    const plain = render(<AreaChartCard series={series} data={data} stacked={false} />).container
    expect(plain.querySelectorAll('.recharts-area')).toHaveLength(2)
  })
})
```

Nota: o `aria-label` do `img` inclui `"Jan: Canal A 1.500, Canal B 300"`. No `ComposedChartCard` o resumo junta as séries de barra e de linha (`[...barSeries, ...lineSeries]`).

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/shared/charts/newCharts.test.tsx`
Expected: FAIL (módulos não existem).

- [ ] **Step 3: Acrescentar `describeSeries` ao `chartTheme.ts`**

Ao final de `src/shared/charts/chartTheme.ts`:

```ts
import type { GroupedDatum, GroupedSeries } from './GroupedBarChartCard'
import { formatNumber } from '@/shared/lib/formatters'

export const describeSeries = (series: GroupedSeries[], data: GroupedDatum[]): string =>
  data
    .map((row) => {
      const values = series.map((s) => `${s.label} ${formatNumber(Number(row[s.key] ?? 0))}`)
      return `${row.label}: ${values.join(', ')}`
    })
    .join('; ')
```

Mover os dois `import` para o topo do arquivo. `GroupedBarChartCard` já importa de `chartTheme`; como aqui é só `import type`, não cria ciclo em runtime.

- [ ] **Step 4: Área**

`src/shared/charts/AreaChartCard.tsx`:

```tsx
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatNumber } from '@/shared/lib/formatters'
import {
  AXIS_TICK, CHART_CARD_CLASS, GRID_STROKE, LEGEND_LABEL_STYLE, TOOLTIP_STYLE, describeSeries,
} from './chartTheme'
import type { GroupedDatum, GroupedSeries } from './GroupedBarChartCard'

interface AreaChartCardProps {
  title?: string
  series: GroupedSeries[]
  data: GroupedDatum[]
  stacked?: boolean
  height?: number
}

export function AreaChartCard({ title, series, data, stacked = true, height = 280 }: AreaChartCardProps) {
  return (
    <section className={CHART_CARD_CLASS}>
      {title && <h3 className="mb-2 text-base font-semibold">{title}</h3>}
      <div role="img" aria-label={describeSeries(series, data)} style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={AXIS_TICK} />
            <YAxis tick={AXIS_TICK} tickFormatter={(v) => formatNumber(Number(v))} />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => formatNumber(Number(value))} />
            <Legend labelStyle={LEGEND_LABEL_STYLE} />
            {series.map((s) => (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                fill={s.color}
                fillOpacity={0.35}
                stackId={stacked ? 'stack' : undefined}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Composto e radar**

`src/shared/charts/ComposedChartCard.tsx`:

```tsx
import {
  Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { formatNumber } from '@/shared/lib/formatters'
import {
  AXIS_TICK, CHART_CARD_CLASS, GRID_STROKE, LEGEND_LABEL_STYLE, TOOLTIP_STYLE, describeSeries,
} from './chartTheme'
import type { GroupedDatum, GroupedSeries } from './GroupedBarChartCard'

interface ComposedChartCardProps {
  title?: string
  barSeries: GroupedSeries[]
  lineSeries: GroupedSeries[]
  data: GroupedDatum[]
  height?: number
}

export function ComposedChartCard({ title, barSeries, lineSeries, data, height = 280 }: ComposedChartCardProps) {
  return (
    <section className={CHART_CARD_CLASS}>
      {title && <h3 className="mb-2 text-base font-semibold">{title}</h3>}
      <div role="img" aria-label={describeSeries([...barSeries, ...lineSeries], data)} style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={AXIS_TICK} />
            <YAxis tick={AXIS_TICK} tickFormatter={(v) => formatNumber(Number(v))} />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => formatNumber(Number(value))} />
            <Legend labelStyle={LEGEND_LABEL_STYLE} />
            {barSeries.map((s) => (
              <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} radius={[4, 4, 0, 0]} />
            ))}
            {lineSeries.map((s) => (
              <Line key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color} strokeWidth={2} dot={false} />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
```

`src/shared/charts/RadarChartCard.tsx`:

```tsx
import {
  Legend, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip,
} from 'recharts'
import { formatNumber } from '@/shared/lib/formatters'
import {
  AXIS_TICK, CHART_CARD_CLASS, GRID_STROKE, LEGEND_LABEL_STYLE, TOOLTIP_STYLE, describeSeries,
} from './chartTheme'
import type { GroupedDatum, GroupedSeries } from './GroupedBarChartCard'

interface RadarChartCardProps {
  title?: string
  series: GroupedSeries[]
  data: GroupedDatum[]
  height?: number
}

export function RadarChartCard({ title, series, data, height = 300 }: RadarChartCardProps) {
  return (
    <section className={CHART_CARD_CLASS}>
      {title && <h3 className="mb-2 text-base font-semibold">{title}</h3>}
      <div role="img" aria-label={describeSeries(series, data)} style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid stroke={GRID_STROKE} />
            <PolarAngleAxis dataKey="label" tick={AXIS_TICK} />
            <PolarRadiusAxis tick={AXIS_TICK} />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => formatNumber(Number(value))} />
            <Legend labelStyle={LEGEND_LABEL_STYLE} />
            {series.map((s) => (
              <Radar key={s.key} dataKey={s.key} name={s.label} stroke={s.color} fill={s.color} fillOpacity={0.25} />
            ))}
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
```

- [ ] **Step 6: Rodar e ver passar**

Run: `npx vitest run src/shared/charts`
Expected: PASS em todos os arquivos (os testes existentes continuam verdes). Se o `Legend` do Recharts 3 não aceitar `labelStyle` na versão instalada, seguir exatamente o que `GroupedBarChartCard.tsx` faz (é o padrão validado no repo).

- [ ] **Step 7: Commit**

```bash
git add src/shared/charts
git commit -m "feat: add area, composed and radar chart cards

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 5: `DataTable` com busca, paginação, seleção e linhas expansíveis (TDD)

**Files:**
- Modify: `src/shared/ui/DataTable.tsx`
- Test: `src/shared/ui/DataTable.features.test.tsx` (novo; o `DataTable.test.tsx` existente não muda e deve continuar verde)

**Interfaces:**
- Consumes: `formatNumber` de `@/shared/lib/formatters`; TanStack Table v8 (`getFilteredRowModel`, `getPaginationRowModel`, row selection e `getRowCanExpand`).
- Produces (props novas, todas opcionais; sem elas o componente se comporta como hoje):
  - `searchable?: boolean`: campo `type="search"` com `aria-label="Buscar"`; filtra por texto nas colunas que têm `sortValue` (colunas sem `sortValue` não entram na busca).
  - `pageSize?: number`: paginação com `nav` `aria-label="Paginação"`, botões "Anterior" e "Próxima", texto `Página X de Y` e contagem `N registros`. Mudar o filtro volta para a página 1.
  - `selectable?: boolean` e `onSelectionChange?: (rows: T[]) => void`: coluna de checkbox (`aria-label` "Selecionar todas as linhas" no cabeçalho e "Selecionar linha N" nas linhas, com N = posição original, base 1) e `role="status"` com `N selecionada(s)`. As linhas selecionadas são identificadas pelo índice original em `data`, então a seleção sobrevive a ordenação e busca.
  - `renderDetail?: (row: T) => ReactNode`: coluna com botão `aria-expanded` ("Expandir detalhes" / "Recolher detalhes") que mostra uma linha extra com o detalhe.

- [ ] **Step 1: Escrever os testes que falham**

`src/shared/ui/DataTable.features.test.tsx`:

```tsx
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DataTable, type DataColumn } from './DataTable'

interface Row {
  name: string
  qty: number
}
const rows: Row[] = Array.from({ length: 25 }, (_, i) => ({ name: `Item ${String(i + 1).padStart(2, '0')}`, qty: i + 1 }))
const columns: DataColumn<Row>[] = [
  { id: 'name', header: 'Nome', cell: (r) => r.name, sortValue: (r) => r.name },
  { id: 'qty', header: 'Qtd', cell: (r) => String(r.qty), sortValue: (r) => r.qty, align: 'right' },
]
const small = rows.slice(0, 3)

describe('DataTable pagination', () => {
  it('shows only the page size and moves between pages', async () => {
    render(<DataTable caption="Itens" columns={columns} data={rows} pageSize={10} />)
    expect(screen.getAllByRole('row')).toHaveLength(11)
    expect(screen.getByText('Página 1 de 3')).toBeInTheDocument()
    expect(screen.getByText('25 registros')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: 'Próxima' }))
    expect(screen.getByText('Página 2 de 3')).toBeInTheDocument()
    expect(screen.getByText('Item 11')).toBeInTheDocument()
    expect(screen.queryByText('Item 01')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Próxima' }))
    expect(screen.getAllByRole('row')).toHaveLength(6)
    expect(screen.getByRole('button', { name: 'Próxima' })).toBeDisabled()
  })

  it('has no pagination nor search unless asked', () => {
    render(<DataTable caption="Itens" columns={columns} data={small} />)
    expect(screen.queryByRole('navigation', { name: 'Paginação' })).not.toBeInTheDocument()
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()
  })
})

describe('DataTable search', () => {
  it('filters rows by text in sortable columns and goes back to the first page', async () => {
    render(<DataTable caption="Itens" columns={columns} data={rows} pageSize={10} searchable />)
    await userEvent.click(screen.getByRole('button', { name: 'Próxima' }))
    await userEvent.type(screen.getByRole('searchbox', { name: 'Buscar' }), 'Item 2')
    expect(screen.getByText('Página 1 de 1')).toBeInTheDocument()
    expect(screen.getByText('6 registros')).toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(7)
  })

  it('matches numeric values and shows the empty state when nothing matches', async () => {
    render(<DataTable caption="Itens" columns={columns} data={rows} searchable />)
    await userEvent.type(screen.getByRole('searchbox', { name: 'Buscar' }), '25')
    expect(screen.getAllByRole('row')).toHaveLength(2)
    await userEvent.clear(screen.getByRole('searchbox', { name: 'Buscar' }))
    await userEvent.type(screen.getByRole('searchbox', { name: 'Buscar' }), 'zzz')
    expect(screen.getByText('Sem dados')).toBeInTheDocument()
  })
})

describe('DataTable selection', () => {
  it('selects rows, counts them and reports the selected data', async () => {
    const onSelectionChange = vi.fn()
    render(<DataTable caption="Itens" columns={columns} data={small} selectable onSelectionChange={onSelectionChange} />)
    expect(screen.getByRole('status')).toHaveTextContent('0 selecionadas')
    await userEvent.click(screen.getByRole('checkbox', { name: 'Selecionar linha 2' }))
    expect(screen.getByRole('status')).toHaveTextContent('1 selecionada')
    expect(onSelectionChange).toHaveBeenLastCalledWith([small[1]])
    await userEvent.click(screen.getByRole('checkbox', { name: 'Selecionar todas as linhas' }))
    expect(screen.getByRole('status')).toHaveTextContent('3 selecionadas')
    expect(onSelectionChange).toHaveBeenLastCalledWith(small)
  })

  it('keeps the selection tied to the row when the table is sorted', async () => {
    const onSelectionChange = vi.fn()
    render(<DataTable caption="Itens" columns={columns} data={small} selectable onSelectionChange={onSelectionChange} />)
    await userEvent.click(screen.getByRole('button', { name: /Nome/ }))
    await userEvent.click(screen.getByRole('button', { name: /Nome/ }))
    await userEvent.click(screen.getByRole('checkbox', { name: 'Selecionar linha 1' }))
    expect(onSelectionChange).toHaveBeenLastCalledWith([small[0]])
    const row = screen.getByRole('checkbox', { name: 'Selecionar linha 1' }).closest('tr')!
    expect(within(row).getByText('Item 01')).toBeInTheDocument()
  })
})

describe('DataTable expandable rows', () => {
  it('toggles a detail row with aria-expanded', async () => {
    render(<DataTable caption="Itens" columns={columns} data={small} renderDetail={(r) => <p>Detalhe de {r.name}</p>} />)
    const [first] = screen.getAllByRole('button', { name: 'Expandir detalhes' })
    expect(first).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(first!)
    expect(screen.getByText('Detalhe de Item 01')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Recolher detalhes' })).toHaveAttribute('aria-expanded', 'true')
    await userEvent.click(screen.getByRole('button', { name: 'Recolher detalhes' }))
    expect(screen.queryByText('Detalhe de Item 01')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/shared/ui/DataTable.features.test.tsx`
Expected: FAIL (props e comportamentos não existem).

- [ ] **Step 3: Substituir `DataTable.tsx`**

O arquivo atual fica compatível: mesmas props obrigatórias, mesmo cabeçalho ordenável, mesmo estado vazio. Escrever em duas chamadas (imports + tipos + lógica; depois JSX). Conteúdo final de `src/shared/ui/DataTable.tsx`, parte 1 (até antes do `return`):

```tsx
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type OnChangeFn,
  type RowSelectionState,
  type SortingState,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, ChevronsUpDown } from 'lucide-react'
import { Fragment, useMemo, useState, type ReactNode } from 'react'

export interface DataColumn<T> {
  id: string
  header: string
  cell: (row: T) => ReactNode
  /** Valor usado na ordenação e na busca; colunas sem ele não ordenam nem entram na busca. */
  sortValue?: (row: T) => number | string
  align?: 'left' | 'right'
}

interface DataTableProps<T> {
  columns: DataColumn<T>[]
  data: T[]
  caption: string
  searchable?: boolean
  pageSize?: number
  selectable?: boolean
  onSelectionChange?: (rows: T[]) => void
  renderDetail?: (row: T) => ReactNode
}

const ARIA_SORT = { asc: 'ascending', desc: 'descending' } as const
const BUTTON = 'rounded-md border border-slate-300 px-2 py-1 disabled:opacity-40 dark:border-slate-700'

export function DataTable<T>({
  columns,
  data,
  caption,
  searchable = false,
  pageSize,
  selectable = false,
  onSelectionChange,
  renderDetail,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [filter, setFilter] = useState('')
  const [selection, setSelection] = useState<RowSelectionState>({})
  const hasDetail = renderDetail !== undefined

  const defs = useMemo<ColumnDef<T>[]>(() => {
    const own: ColumnDef<T>[] = columns.map((c) => ({
      id: c.id,
      header: c.header,
      enableSorting: c.sortValue !== undefined,
      accessorFn: (row: T) => c.sortValue?.(row) ?? '',
      cell: ({ row }) => c.cell(row.original),
    }))
    const lead: ColumnDef<T>[] = []
    if (hasDetail) {
      lead.push({
        id: '_expand',
        enableSorting: false,
        enableGlobalFilter: false,
        header: () => <span className="sr-only">Detalhes</span>,
        cell: ({ row }) => (
          <button
            type="button"
            aria-expanded={row.getIsExpanded()}
            aria-label={row.getIsExpanded() ? 'Recolher detalhes' : 'Expandir detalhes'}
            onClick={row.getToggleExpandedHandler()}
            className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {row.getIsExpanded() ? <ChevronDown size={14} aria-hidden /> : <ChevronRight size={14} aria-hidden />}
          </button>
        ),
      })
    }
    if (selectable) {
      lead.push({
        id: '_select',
        enableSorting: false,
        enableGlobalFilter: false,
        header: ({ table }) => (
          <input
            type="checkbox"
            aria-label="Selecionar todas as linhas"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            aria-label={`Selecionar linha ${row.index + 1}`}
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
      })
    }
    return [...lead, ...own]
  }, [columns, hasDetail, selectable])
  const byId = useMemo(() => new Map(columns.map((c) => [c.id, c])), [columns])

  // A seleção usa o índice original em `data` (id padrão da linha), estável sob ordenação e busca.
  const handleSelection: OnChangeFn<RowSelectionState> = (updater) => {
    const next = typeof updater === 'function' ? updater(selection) : updater
    setSelection(next)
    onSelectionChange?.(data.filter((_, i) => next[String(i)]))
  }

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table não é compatível com o React Compiler; sem memoização automática aqui
  const table = useReactTable({
    data,
    columns: defs,
    state: { sorting, globalFilter: filter, rowSelection: selection },
    onSortingChange: setSorting,
    onGlobalFilterChange: setFilter,
    onRowSelectionChange: handleSelection,
    enableRowSelection: selectable,
    getRowCanExpand: () => hasDetail,
    globalFilterFn: 'includesString',
    sortDescFirst: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(pageSize !== undefined
      ? { getPaginationRowModel: getPaginationRowModel(), initialState: { pagination: { pageSize } } }
      : {}),
  })

  const rows = table.getRowModel().rows
  const total = table.getFilteredRowModel().rows.length
  const selectedCount = Object.values(selection).filter(Boolean).length
  const colCount = table.getVisibleLeafColumns().length
  const alignClass = (id: string) => (byId.get(id)?.align === 'right' ? 'text-right' : 'text-left')
```

Parte 2, o `return` (barra de ferramentas, tabela com o mesmo cabeçalho de hoje, linhas com detalhe e rodapé):

```tsx
  return (
    <div>
      {(searchable || selectable) && (
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          {searchable ? (
            <input
              type="search"
              aria-label="Buscar"
              placeholder="Buscar..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900"
            />
          ) : (
            <span />
          )}
          {selectable && (
            <p role="status" className="text-sm text-slate-500 dark:text-slate-400">
              {`${selectedCount} ${selectedCount === 1 ? 'selecionada' : 'selecionadas'}`}
            </p>
          )}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="mb-2 text-left text-base font-semibold">{caption}</caption>
          <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400">
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => {
                  const sorted = header.column.getIsSorted()
                  const sortable = header.column.getCanSort()
                  const label = flexRender(header.column.columnDef.header, header.getContext())
                  return (
                    <th
                      key={header.id}
                      scope="col"
                      aria-sort={sortable ? (sorted ? ARIA_SORT[sorted] : 'none') : undefined}
                      className={`px-3 py-2 font-medium ${alignClass(header.column.id)}`}
                    >
                      {sortable ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-100"
                        >
                          {label}
                          {sorted === 'asc' ? (
                            <ArrowUp size={12} aria-hidden />
                          ) : sorted === 'desc' ? (
                            <ArrowDown size={12} aria-hidden />
                          ) : (
                            <ChevronsUpDown size={12} aria-hidden />
                          )}
                        </button>
                      ) : (
                        label
                      )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={colCount} className="px-3 py-4 text-center text-slate-500 dark:text-slate-400">
                  Sem dados
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <Fragment key={row.id}>
                  <tr
                    className={`border-b border-slate-100 last:border-0 dark:border-slate-800 ${
                      row.getIsSelected() ? 'bg-blue-50 dark:bg-blue-950/40' : ''
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className={`px-3 py-2 tabular-nums ${alignClass(cell.column.id)}`}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                  {renderDetail && row.getIsExpanded() && (
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td colSpan={colCount} className="bg-slate-50 px-3 py-3 dark:bg-slate-800/40">
                        {renderDetail(row.original)}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
      {pageSize !== undefined && (
        <nav aria-label="Paginação" className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
          <span>{`${total} ${total === 1 ? 'registro' : 'registros'}`}</span>
          <div className="flex items-center gap-2">
            <button type="button" className={BUTTON} onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              Anterior
            </button>
            <span>{`Página ${table.getState().pagination.pageIndex + 1} de ${Math.max(table.getPageCount(), 1)}`}</span>
            <button type="button" className={BUTTON} onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              Próxima
            </button>
          </div>
        </nav>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/shared/ui src/features/financial src/features/inventory`
Expected: PASS, inclusive o `DataTable.test.tsx` original e as páginas Financial e Inventory que usam a tabela. Se a soma de `formatNumber` nos rótulos de contagem for desejada para milhares, usar `formatNumber(total)` (os testes usam 25 e 6, que não têm separador).
Se o tipo do `useReactTable` reclamar do spread condicional das opções, separar `const paging = pageSize !== undefined ? {...} : {}` antes e espalhar `...paging`.

- [ ] **Step 5: Verificação de tipos e lint**

Run: `npm run typecheck` e `npm run lint`
Expected: sem erros e sem warnings.

- [ ] **Step 6: Commit**

```bash
git add src/shared/ui/DataTable.tsx src/shared/ui/DataTable.features.test.tsx
git commit -m "feat: add search, pagination, row selection and expandable rows to DataTable

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 6: Mapas de rota e de cobertura (TDD)

**Files:**
- Create: `src/shared/maps/geo.ts`, `src/shared/maps/RouteMap.tsx`, `src/shared/maps/CoverageMap.tsx`
- Modify: `src/shared/maps/RegionMap.tsx` (usar as constantes de `geo.ts`)
- Test: `src/shared/maps/RouteMap.test.tsx`, `src/shared/maps/CoverageMap.test.tsx`

**Interfaces:**
- Produces (`geo.ts`): `BRAZIL_CENTER: [number, number]`, `OSM_TILE_URL: string`, `OSM_ATTRIBUTION: string`.
- Produces (`RouteMap.tsx`): `RouteHub { id: string; label: string; lat: number; lng: number }`, `RouteLine { id: string; from: string; to: string; volume: number }` e `RouteMap({ title, hubs, routes, format?, height? })`: uma `Polyline` por rota (espessura proporcional ao volume; rotas com hub inexistente são ignoradas), um `CircleMarker` por hub e uma lista `aria-label="Rotas: <title>"` com `"<Origem> → <Destino>: <volume>"`.
- Produces (`CoverageMap.tsx`): `CoverageArea { id: string; label: string; lat: number; lng: number; radiusKm: number; detail: string }` e `CoverageMap({ title, areas, height? })`: um `Circle` (raio em metros = `radiusKm * 1000`) com `Popup`, e lista `aria-label="Áreas: <title>"`.
- Ambos: `role="region"` com `aria-label="Mapa: <title>"` e `h3` com o título, como o `RegionMap`.

- [ ] **Step 1: Escrever os testes que falham**

`src/shared/maps/RouteMap.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { RouteMap } from './RouteMap'

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TileLayer: () => null,
  Polyline: ({ positions }: { positions: unknown }) => <div data-testid="route" data-positions={JSON.stringify(positions)} />,
  CircleMarker: ({ children }: { children: ReactNode }) => <div data-testid="hub">{children}</div>,
  Popup: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

const hubs = [
  { id: 'sp', label: 'São Paulo', lat: -23.55, lng: -46.63 },
  { id: 'rj', label: 'Rio de Janeiro', lat: -22.9, lng: -43.17 },
]

describe('RouteMap', () => {
  it('draws one line per valid route and one marker per hub', () => {
    render(<RouteMap title="Rotas" hubs={hubs} routes={[{ id: 'a', from: 'sp', to: 'rj', volume: 1200 }, { id: 'b', from: 'sp', to: 'xx', volume: 5 }]} />)
    expect(screen.getByRole('region', { name: 'Mapa: Rotas' })).toBeInTheDocument()
    expect(screen.getAllByTestId('route')).toHaveLength(1)
    expect(screen.getAllByTestId('hub')).toHaveLength(2)
    expect(screen.getByTestId('route')).toHaveAttribute('data-positions', '[[-23.55,-46.63],[-22.9,-43.17]]')
  })

  it('lists the routes as text for assistive tech', () => {
    render(<RouteMap title="Rotas" hubs={hubs} routes={[{ id: 'a', from: 'sp', to: 'rj', volume: 1200 }]} format={(v) => `${v} envios`} />)
    const list = screen.getByRole('list', { name: 'Rotas: Rotas' })
    expect(list).toHaveTextContent('São Paulo → Rio de Janeiro: 1200 envios')
  })
})
```

`src/shared/maps/CoverageMap.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { CoverageMap } from './CoverageMap'

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TileLayer: () => null,
  Circle: ({ radius, children }: { radius: number; children: ReactNode }) => <div data-testid="area" data-radius={radius}>{children}</div>,
  Popup: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

describe('CoverageMap', () => {
  it('draws a circle per area with the radius in metres', () => {
    render(<CoverageMap title="Cobertura" areas={[{ id: 'a', label: 'Capital', lat: -23.5, lng: -46.6, radiusKm: 120, detail: '32 agências' }]} />)
    expect(screen.getByRole('region', { name: 'Mapa: Cobertura' })).toBeInTheDocument()
    expect(screen.getByTestId('area')).toHaveAttribute('data-radius', '120000')
    expect(screen.getByRole('list', { name: 'Áreas: Cobertura' })).toHaveTextContent('Capital: raio de 120 km, 32 agências')
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/shared/maps/RouteMap.test.tsx src/shared/maps/CoverageMap.test.tsx`
Expected: FAIL (módulos não existem).

- [ ] **Step 3: Constantes compartilhadas**

`src/shared/maps/geo.ts`:

```ts
export const BRAZIL_CENTER: [number, number] = [-14.2, -51.9]
export const OSM_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
export const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
```

Em `src/shared/maps/RegionMap.tsx`: importar `{ BRAZIL_CENTER, OSM_ATTRIBUTION, OSM_TILE_URL } from './geo'`, apagar a constante local `BRAZIL_CENTER` e usar `attribution={OSM_ATTRIBUTION}` e `url={OSM_TILE_URL}` no `TileLayer`. Rodar `npx vitest run src/shared/maps/RegionMap.test.tsx` (deve continuar verde).

- [ ] **Step 4: Implementar `RouteMap`**

`src/shared/maps/RouteMap.tsx`:

```tsx
import 'leaflet/dist/leaflet.css'
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer } from 'react-leaflet'
import { CHART_CARD_CLASS } from '@/shared/charts/chartTheme'
import { BRAZIL_CENTER, OSM_ATTRIBUTION, OSM_TILE_URL } from './geo'

export interface RouteHub {
  id: string
  label: string
  lat: number
  lng: number
}
export interface RouteLine {
  id: string
  from: string
  to: string
  volume: number
}

interface RouteMapProps {
  title: string
  hubs: RouteHub[]
  routes: RouteLine[]
  format?: (value: number) => string
  height?: number
}

export function RouteMap({ title, hubs, routes, format = (value) => String(value), height = 320 }: RouteMapProps) {
  const byId = new Map(hubs.map((h) => [h.id, h]))
  const lines = routes.flatMap((r) => {
    const from = byId.get(r.from)
    const to = byId.get(r.to)
    return from && to ? [{ route: r, from, to }] : []
  })
  const max = Math.max(1, ...lines.map((l) => l.route.volume))
  return (
    <section className={CHART_CARD_CLASS}>
      <h3 className="mb-2 text-base font-semibold">{title}</h3>
      <div role="region" aria-label={`Mapa: ${title}`} style={{ height }} className="overflow-hidden rounded-lg">
        <MapContainer center={BRAZIL_CENTER} zoom={4} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
          <TileLayer attribution={OSM_ATTRIBUTION} url={OSM_TILE_URL} />
          {lines.map(({ route, from, to }) => (
            <Polyline
              key={route.id}
              positions={[[from.lat, from.lng], [to.lat, to.lng]]}
              pathOptions={{ color: '#3b82f6', weight: 2 + (route.volume / max) * 6, opacity: 0.7 }}
            />
          ))}
          {hubs.map((h) => (
            <CircleMarker key={h.id} center={[h.lat, h.lng]} radius={7} pathOptions={{ color: '#a855f7', fillColor: '#a855f7', fillOpacity: 0.9 }}>
              <Popup>{h.label}</Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
      <ul aria-label={`Rotas: ${title}`} className="mt-2 grid grid-cols-1 gap-1 text-xs sm:grid-cols-2">
        {lines.map(({ route, from, to }) => (
          <li key={route.id}>{`${from.label} → ${to.label}: ${format(route.volume)}`}</li>
        ))}
      </ul>
    </section>
  )
}
```

- [ ] **Step 5: Implementar `CoverageMap`**

`src/shared/maps/CoverageMap.tsx`:

```tsx
import 'leaflet/dist/leaflet.css'
import { Circle, MapContainer, Popup, TileLayer } from 'react-leaflet'
import { CHART_CARD_CLASS } from '@/shared/charts/chartTheme'
import { BRAZIL_CENTER, OSM_ATTRIBUTION, OSM_TILE_URL } from './geo'

export interface CoverageArea {
  id: string
  label: string
  lat: number
  lng: number
  radiusKm: number
  detail: string
}

interface CoverageMapProps {
  title: string
  areas: CoverageArea[]
  height?: number
}

export function CoverageMap({ title, areas, height = 320 }: CoverageMapProps) {
  return (
    <section className={CHART_CARD_CLASS}>
      <h3 className="mb-2 text-base font-semibold">{title}</h3>
      <div role="region" aria-label={`Mapa: ${title}`} style={{ height }} className="overflow-hidden rounded-lg">
        <MapContainer center={BRAZIL_CENTER} zoom={4} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
          <TileLayer attribution={OSM_ATTRIBUTION} url={OSM_TILE_URL} />
          {areas.map((a) => (
            <Circle
              key={a.id}
              center={[a.lat, a.lng]}
              radius={a.radiusKm * 1000}
              pathOptions={{ color: '#14b8a6', fillColor: '#14b8a6', fillOpacity: 0.25 }}
            >
              <Popup>
                <strong>{a.label}</strong>
                <br />
                {a.detail}
              </Popup>
            </Circle>
          ))}
        </MapContainer>
      </div>
      <ul aria-label={`Áreas: ${title}`} className="mt-2 grid grid-cols-1 gap-1 text-xs sm:grid-cols-2">
        {areas.map((a) => (
          <li key={a.id}>{`${a.label}: raio de ${a.radiusKm} km, ${a.detail}`}</li>
        ))}
      </ul>
    </section>
  )
}
```

- [ ] **Step 6: Rodar e ver passar**

Run: `npx vitest run src/shared/maps` e `npm run typecheck` e `npm run lint`
Expected: PASS, sem warnings.

- [ ] **Step 7: Commit**

```bash
git add src/shared/maps
git commit -m "feat: add RouteMap and CoverageMap and share map constants

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 7: Dados mock da Galeria: tipos, geradores, repositório e hooks (TDD)

**Files:**
- Create: `src/data/types/gallery.ts`, `src/data/mock/gallery/recharts.ts`, `echarts.ts`, `maps.ts`, `tables.ts`, `flow.ts`, `src/data/repositories/gallery.ts`, `src/data/repositories/mock/gallery.ts`, `src/features/gallery/api.ts`
- Modify: `src/data/repositories/index.ts`
- Test: `src/data/mock/gallery/gallery.test.ts`, `src/data/repositories/mock/gallery.test.ts`

**Interfaces:**
- Produces (`data/types/gallery.ts`):
  - Comuns: `LabelValue { label: string; value: number }`, `SeriesRow { label: string; [key: string]: string | number }`, `SeriesInfo { key: string; label: string }`.
  - `RechartsData { trend: LabelValue[]; statusShare: LabelValue[]; channels: SeriesInfo[]; channelVolume: SeriesRow[]; volumeVsTarget: SeriesRow[]; units: SeriesInfo[]; unitPerformance: SeriesRow[] }` (`channelVolume` tem uma coluna por canal; `volumeVsTarget` tem `volume` (soma dos canais do mês) e `meta`; `unitPerformance` tem uma linha por eixo e uma coluna por unidade).
  - `EchartsData { heatmap: HeatmapData; funnel: LabelValue[]; gauge: GaugeData; treemap: TreeNode[]; sankey: SankeyData }` com `HeatmapData { days: string[]; hours: string[]; cells: [number, number, number][] }` (`[índice da hora, índice do dia, valor]`), `GaugeData { label: string; value: number; max: number }`, `TreeNode { name: string; value?: number; children?: TreeNode[] }`, `SankeyData { nodes: { name: string }[]; links: { source: string; target: string; value: number }[] }`.
  - `MapsData { regionScores: GeoPoint[]; branchScores: GeoPoint[]; hubs: GeoHub[]; routes: GeoRoute[]; coverage: GeoCoverage[] }` com `GeoPoint { id; label; lat; lng; value: number; detail: string }`, `GeoHub { id; label; lat; lng }`, `GeoRoute { id; from; to; volume }`, `GeoCoverage { id; label; lat; lng; radiusKm: number; detail: string }`.
  - `TablesData { shipments: Shipment[] }` com `ShipmentStatus = 'Entregue' | 'Em trânsito' | 'Devolvido' | 'Extraviado'` e `Shipment { id: string; recipient: string; city: string; carrier: string; status: ShipmentStatus; amount: number; weightKg: number; progress: number; events: string[] }`.
  - `FlowData { steps: { id: string; label: string }[]; org: GalleryOrgNode; pipeline: Graph; decision: Graph }` com `GalleryOrgNode { id; name; role; children: GalleryOrgNode[] }`, `Graph { nodes: GraphNode[]; edges: GraphEdge[] }`, `GraphNode { id; label; status?: 'ok' | 'warning' | 'error'; x: number; y: number }`, `GraphEdge { id; source; target; label?: string }`.
- Produces (geradores, sem argumentos e sem filtros): `buildRechartsData()`, `buildEchartsData()`, `buildMapsData()`, `buildTablesData()`, `buildFlowData()`.
- Produces: `GalleryRepository { getRecharts(): Promise<RechartsData>; getEcharts(); getMaps(); getTables(); getFlow() }`, `mockGalleryRepository`, `repositories.gallery`; hooks `useRechartsData()`, `useEchartsData()`, `useMapsData()`, `useTablesData()`, `useFlowData()` (chave `['gallery', nome, devFlags]`, `staleTime: Infinity`).

- [ ] **Step 1: Escrever os testes dos geradores (falham)**

`src/data/mock/gallery/gallery.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { buildEchartsData } from './echarts'
import { buildFlowData } from './flow'
import { buildMapsData } from './maps'
import { buildRechartsData } from './recharts'
import { buildTablesData } from './tables'

describe.each([
  ['recharts', buildRechartsData],
  ['echarts', buildEchartsData],
  ['maps', buildMapsData],
  ['tables', buildTablesData],
  ['flow', buildFlowData],
])('%s data', (_name, build) => {
  it('is deterministic and returns fresh objects on every call', () => {
    expect(build()).toEqual(build())
    expect(build()).not.toBe(build())
  })
})

describe('buildRechartsData', () => {
  const d = buildRechartsData()
  it('has twelve months and consistent totals', () => {
    expect(d.trend).toHaveLength(12)
    expect(d.channelVolume).toHaveLength(12)
    expect(d.statusShare).toHaveLength(4)
    d.channelVolume.forEach((row, i) => {
      const sum = d.channels.reduce((s, c) => s + Number(row[c.key]), 0)
      expect(d.volumeVsTarget[i]).toMatchObject({ label: row.label, volume: sum })
      expect(Number(d.volumeVsTarget[i]!.meta)).toBeGreaterThan(0)
    })
  })
  it('has one radar row per axis and a value per unit between 0 and 100', () => {
    expect(d.unitPerformance).toHaveLength(5)
    for (const row of d.unitPerformance) {
      for (const u of d.units) expect(Number(row[u.key])).toBeGreaterThanOrEqual(0)
      for (const u of d.units) expect(Number(row[u.key])).toBeLessThanOrEqual(100)
    }
  })
})

describe('buildEchartsData', () => {
  const d = buildEchartsData()
  it('fills the whole heatmap grid inside its bounds', () => {
    expect(d.heatmap.cells).toHaveLength(d.heatmap.days.length * d.heatmap.hours.length)
    for (const [x, y, v] of d.heatmap.cells) {
      expect(x).toBeLessThan(d.heatmap.hours.length)
      expect(y).toBeLessThan(d.heatmap.days.length)
      expect(v).toBeGreaterThanOrEqual(0)
    }
  })
  it('has a strictly decreasing funnel and a gauge within its range', () => {
    const values = d.funnel.map((s) => s.value)
    expect(values).toEqual([...values].sort((a, b) => b - a))
    expect(new Set(values).size).toBe(values.length)
    expect(d.gauge.value).toBeGreaterThanOrEqual(0)
    expect(d.gauge.value).toBeLessThanOrEqual(d.gauge.max)
  })
  it('has a treemap with positive leaves and sankey links between known nodes', () => {
    const leaves = (nodes: typeof d.treemap): number[] =>
      nodes.flatMap((n) => (n.children ? leaves(n.children) : [n.value ?? 0]))
    expect(leaves(d.treemap).every((v) => v > 0)).toBe(true)
    const names = new Set(d.sankey.nodes.map((n) => n.name))
    for (const l of d.sankey.links) {
      expect(names.has(l.source) && names.has(l.target)).toBe(true)
      expect(l.value).toBeGreaterThan(0)
    }
  })
})

describe('buildMapsData', () => {
  const d = buildMapsData()
  it('has scores between 0 and 100 and routes between known hubs', () => {
    for (const p of [...d.regionScores, ...d.branchScores]) {
      expect(p.value).toBeGreaterThanOrEqual(0)
      expect(p.value).toBeLessThanOrEqual(100)
    }
    const ids = new Set(d.hubs.map((h) => h.id))
    for (const r of d.routes) expect(ids.has(r.from) && ids.has(r.to)).toBe(true)
    expect(d.coverage.every((c) => c.radiusKm > 0)).toBe(true)
  })
})

describe('buildTablesData', () => {
  const { shipments } = buildTablesData()
  it('has sixty shipments with unique ids and sane values', () => {
    expect(shipments).toHaveLength(60)
    expect(new Set(shipments.map((s) => s.id)).size).toBe(60)
    for (const s of shipments) {
      expect(['Entregue', 'Em trânsito', 'Devolvido', 'Extraviado']).toContain(s.status)
      expect(s.progress).toBeGreaterThanOrEqual(0)
      expect(s.progress).toBeLessThanOrEqual(100)
      expect(s.events.length).toBeGreaterThan(0)
    }
  })
})

describe('buildFlowData', () => {
  const d = buildFlowData()
  it('has connected graphs and labelled decision edges', () => {
    for (const g of [d.pipeline, d.decision]) {
      const ids = new Set(g.nodes.map((n) => n.id))
      for (const e of g.edges) expect(ids.has(e.source) && ids.has(e.target)).toBe(true)
    }
    expect(d.steps.length).toBeGreaterThanOrEqual(5)
    expect(d.decision.edges.some((e) => e.label)).toBe(true)
    expect(d.org.children.length).toBeGreaterThan(0)
  })
})
```

Run: `npx vitest run src/data/mock/gallery/gallery.test.ts`
Expected: FAIL (módulos não existem).

- [ ] **Step 2: Criar os tipos**

`src/data/types/gallery.ts`:

```ts
export interface LabelValue {
  label: string
  value: number
}
export interface SeriesRow {
  label: string
  [key: string]: string | number
}
export interface SeriesInfo {
  key: string
  label: string
}

export interface RechartsData {
  trend: LabelValue[]
  statusShare: LabelValue[]
  channels: SeriesInfo[]
  channelVolume: SeriesRow[]
  volumeVsTarget: SeriesRow[]
  units: SeriesInfo[]
  unitPerformance: SeriesRow[]
}

export interface HeatmapData {
  days: string[]
  hours: string[]
  cells: [number, number, number][]
}
export interface GaugeData {
  label: string
  value: number
  max: number
}
export interface TreeNode {
  name: string
  value?: number
  children?: TreeNode[]
}
export interface SankeyData {
  nodes: { name: string }[]
  links: { source: string; target: string; value: number }[]
}
export interface EchartsData {
  heatmap: HeatmapData
  funnel: LabelValue[]
  gauge: GaugeData
  treemap: TreeNode[]
  sankey: SankeyData
}

export interface GeoPoint {
  id: string
  label: string
  lat: number
  lng: number
  value: number
  detail: string
}
export interface GeoHub {
  id: string
  label: string
  lat: number
  lng: number
}
export interface GeoRoute {
  id: string
  from: string
  to: string
  volume: number
}
export interface GeoCoverage {
  id: string
  label: string
  lat: number
  lng: number
  radiusKm: number
  detail: string
}
export interface MapsData {
  regionScores: GeoPoint[]
  branchScores: GeoPoint[]
  hubs: GeoHub[]
  routes: GeoRoute[]
  coverage: GeoCoverage[]
}

export type ShipmentStatus = 'Entregue' | 'Em trânsito' | 'Devolvido' | 'Extraviado'
export interface Shipment {
  id: string
  recipient: string
  city: string
  carrier: string
  status: ShipmentStatus
  amount: number
  weightKg: number
  progress: number
  events: string[]
}
export interface TablesData {
  shipments: Shipment[]
}

export interface GalleryOrgNode {
  id: string
  name: string
  role: string
  children: GalleryOrgNode[]
}
export interface GraphNode {
  id: string
  label: string
  status?: 'ok' | 'warning' | 'error'
  x: number
  y: number
}
export interface GraphEdge {
  id: string
  source: string
  target: string
  label?: string
}
export interface Graph {
  nodes: GraphNode[]
  edges: GraphEdge[]
}
export interface FlowData {
  steps: { id: string; label: string }[]
  org: GalleryOrgNode
  pipeline: Graph
  decision: Graph
}
```

- [ ] **Step 3: Gerador do Recharts**

`src/data/mock/gallery/recharts.ts`:

```ts
import type { RechartsData, SeriesRow } from '@/data/types/gallery'
import { createRng } from '../random'

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const CHANNELS = [
  { key: 'agency', label: 'Agência', base: 900 },
  { key: 'digital', label: 'Digital', base: 600 },
  { key: 'phone', label: 'Telefone', base: 400 },
]
const UNITS = [
  { key: 'unitA', label: 'Unidade A' },
  { key: 'unitB', label: 'Unidade B' },
  { key: 'unitC', label: 'Unidade C' },
]
const AXES = ['Prazo', 'Custo', 'Qualidade', 'Cobertura', 'Satisfação']

export function buildRechartsData(): RechartsData {
  const rng = createRng(5001)
  const channelVolume = MONTHS.map((label, i) => {
    const row: SeriesRow = { label }
    for (const c of CHANNELS) row[c.key] = Math.round(c.base * (1 + i * 0.04) * (0.9 + rng.next() * 0.2))
    return row
  })
  const volumeVsTarget = channelVolume.map((row, i): SeriesRow => ({
    label: row.label,
    volume: CHANNELS.reduce((sum, c) => sum + Number(row[c.key]), 0),
    meta: Math.round(1900 * (1 + i * 0.04)),
  }))
  return {
    trend: MONTHS.map((label, i) => ({ label, value: Math.round(1800 * (1 + i * 0.05) * (0.9 + rng.next() * 0.2)) })),
    statusShare: [
      { label: 'Entregue', value: 6200 },
      { label: 'Em trânsito', value: 2100 },
      { label: 'Custódia', value: 640 },
      { label: 'Devolvido', value: 480 },
    ].map((s) => ({ ...s, value: Math.round(s.value * (0.95 + rng.next() * 0.1)) })),
    channels: CHANNELS.map(({ key, label }) => ({ key, label })),
    channelVolume,
    volumeVsTarget,
    units: UNITS,
    unitPerformance: AXES.map((label) => {
      const row: SeriesRow = { label }
      for (const u of UNITS) row[u.key] = rng.int(55, 98)
      return row
    }),
  }
}
```

- [ ] **Step 4: Gerador do ECharts**

`src/data/mock/gallery/echarts.ts`:

```ts
import type { EchartsData, TreeNode } from '@/data/types/gallery'
import { createRng, type Rng } from '../random'

const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const HOURS = Array.from({ length: 13 }, (_, i) => `${String(i + 8).padStart(2, '0')}h`)
const FUNNEL = ['Propostas recebidas', 'Digitadas', 'Contas criadas', 'Cartões enviados', 'Cartões entregues']

const leaf = (rng: Rng, name: string): TreeNode => ({ name, value: rng.int(20, 200) })

export function buildEchartsData(): EchartsData {
  const rng = createRng(5002)
  let stage = 1000
  return {
    heatmap: {
      days: DAYS,
      hours: HOURS,
      cells: DAYS.flatMap((_, y) =>
        HOURS.map((_, x): [number, number, number] => {
          const peak = Math.max(0, 1 - Math.abs(x - 3) / 6) + Math.max(0, 1 - Math.abs(x - 8) / 6)
          const weekend = y >= 5 ? 0.3 : 1
          return [x, y, Math.round(20 + peak * 60 * weekend * (0.8 + rng.next() * 0.4))]
        }),
      ),
    },
    funnel: FUNNEL.map((label, i) => {
      if (i > 0) stage = Math.round(stage * (0.82 + rng.next() * 0.1))
      return { label, value: stage }
    }),
    gauge: { label: 'SLA de entrega (%)', value: rng.int(90, 98), max: 100 },
    treemap: [
      { name: 'Transporte', children: [leaf(rng, 'Flash'), leaf(rng, 'Terceiros A'), leaf(rng, 'Terceiros B')] },
      { name: 'Armazenagem', children: [leaf(rng, 'Estoque'), leaf(rng, 'Custódia')] },
      { name: 'Materiais', children: [leaf(rng, 'Cartões'), leaf(rng, 'Envelopes'), leaf(rng, 'Cartas berço')] },
    ],
    sankey: {
      nodes: ['Postado', 'Em trânsito', 'Entregue', 'Custódia', 'Devolvido', 'Reenviado'].map((name) => ({ name })),
      links: [
        { source: 'Postado', target: 'Em trânsito', value: rng.int(900, 1000) },
        { source: 'Em trânsito', target: 'Entregue', value: rng.int(700, 800) },
        { source: 'Em trânsito', target: 'Custódia', value: rng.int(120, 200) },
        { source: 'Custódia', target: 'Devolvido', value: rng.int(50, 90) },
        { source: 'Custódia', target: 'Reenviado', value: rng.int(40, 80) },
        { source: 'Reenviado', target: 'Entregue', value: rng.int(20, 39) },
      ],
    },
  }
}
```

Nota: os picos do mapa de calor caem às 11h (`x = 3`) e às 16h (`x = 8`), e o funil perde de 8% a 18% por etapa a partir de 1000, então não há empates (o teste exige valores estritamente decrescentes).

- [ ] **Step 5: Geradores de mapas, tabelas e fluxos**

`src/data/mock/gallery/maps.ts`:

```ts
import type { GeoPoint, MapsData } from '@/data/types/gallery'
import { createRng } from '../random'

const REGIONS = [
  { id: 'norte', label: 'Norte', lat: -3.1, lng: -60.0 },
  { id: 'nordeste', label: 'Nordeste', lat: -8.0, lng: -38.0 },
  { id: 'centro-oeste', label: 'Centro-Oeste', lat: -15.8, lng: -47.9 },
  { id: 'sudeste', label: 'Sudeste', lat: -22.0, lng: -45.0 },
  { id: 'sul', label: 'Sul', lat: -27.5, lng: -51.5 },
]
const HUBS = [
  { id: 'sp', label: 'São Paulo', lat: -23.55, lng: -46.63 },
  { id: 'rj', label: 'Rio de Janeiro', lat: -22.9, lng: -43.17 },
  { id: 'bh', label: 'Belo Horizonte', lat: -19.92, lng: -43.94 },
  { id: 'bsb', label: 'Brasília', lat: -15.79, lng: -47.88 },
  { id: 'ssa', label: 'Salvador', lat: -12.97, lng: -38.5 },
  { id: 'rec', label: 'Recife', lat: -8.05, lng: -34.88 },
  { id: 'poa', label: 'Porto Alegre', lat: -30.03, lng: -51.23 },
  { id: 'mao', label: 'Manaus', lat: -3.12, lng: -60.02 },
]
const ROUTES: [string, string][] = [
  ['sp', 'rj'], ['sp', 'bh'], ['sp', 'poa'], ['bh', 'bsb'], ['bsb', 'ssa'], ['ssa', 'rec'], ['bsb', 'mao'], ['rj', 'ssa'],
]
const COVERAGE = [
  { id: 'sp', label: 'Grande São Paulo', lat: -23.55, lng: -46.63, base: 120 },
  { id: 'bh', label: 'Região de Belo Horizonte', lat: -19.92, lng: -43.94, base: 200 },
  { id: 'ssa', label: 'Recôncavo Baiano', lat: -12.97, lng: -38.5, base: 160 },
  { id: 'poa', label: 'Serra Gaúcha', lat: -30.03, lng: -51.23, base: 220 },
  { id: 'mao', label: 'Amazonas Central', lat: -3.12, lng: -60.02, base: 400 },
]

export function buildMapsData(): MapsData {
  const rng = createRng(5003)
  const score = (p: { id: string; label: string; lat: number; lng: number }, unit: string): GeoPoint => {
    const value = rng.int(68, 96)
    return { ...p, value, detail: `${rng.int(8, 60)} ${unit}` }
  }
  return {
    regionScores: REGIONS.map((r) => score(r, 'agências ativas')),
    branchScores: HUBS.map((h) => score(h, 'entregas por dia (mil)')),
    hubs: HUBS,
    routes: ROUTES.map(([from, to], i) => ({ id: `r${i}`, from, to, volume: rng.int(200, 2400) })),
    coverage: COVERAGE.map(({ base, ...c }) => ({
      ...c,
      radiusKm: Math.round(base * (0.9 + rng.next() * 0.2)),
      detail: `${rng.int(10, 80)} agências`,
    })),
  }
}
```

`src/data/mock/gallery/tables.ts`:

```ts
import type { Shipment, ShipmentStatus, TablesData } from '@/data/types/gallery'
import { createRng } from '../random'

const CITIES = ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Brasília', 'Salvador', 'Recife', 'Porto Alegre', 'Curitiba']
const CARRIERS = ['Flash', 'Terceiros A', 'Terceiros B']
const STATUSES: ShipmentStatus[] = ['Entregue', 'Entregue', 'Entregue', 'Em trânsito', 'Em trânsito', 'Devolvido', 'Extraviado']
const EVENTS = ['Objeto postado', 'Em transferência', 'Saiu para entrega', 'Entrega não efetuada', 'Entregue ao destinatário']

export function buildTablesData(): TablesData {
  const rng = createRng(5004)
  const shipments = Array.from({ length: 60 }, (_, i): Shipment => {
    const status = rng.pick(STATUSES)
    const progress = status === 'Entregue' ? 100 : status === 'Em trânsito' ? rng.int(20, 90) : rng.int(0, 60)
    return {
      id: `ENV-${String(i + 1).padStart(4, '0')}`,
      recipient: `Cliente ${String(i + 1).padStart(3, '0')}`,
      city: rng.pick(CITIES),
      carrier: rng.pick(CARRIERS),
      status,
      amount: Math.round((15 + rng.next() * 85) * 100) / 100,
      weightKg: Math.round((0.1 + rng.next() * 2.4) * 100) / 100,
      progress,
      events: EVENTS.slice(0, Math.max(1, Math.ceil((progress / 100) * EVENTS.length))),
    }
  })
  return { shipments }
}
```

`src/data/mock/gallery/flow.ts`:

```ts
import type { FlowData, Graph } from '@/data/types/gallery'
import { createRng } from '../random'

const STEPS = ['Pedido recebido', 'Separação', 'Postagem', 'Transporte', 'Entrega', 'Confirmação']

const chain = (ids: string[]): Graph['edges'] =>
  ids.slice(1).map((target, i) => ({ id: `${ids[i]}-${target}`, source: ids[i]!, target }))

export function buildFlowData(): FlowData {
  const rng = createRng(5005)
  const status = () => rng.pick(['ok', 'ok', 'ok', 'warning', 'error'] as const)
  const ids = ['coleta', 'triagem', 'transferencia', 'distribuicao', 'entrega']
  return {
    steps: STEPS.map((label, i) => ({ id: `s${i}`, label })),
    org: {
      id: 'dir', name: 'Diretor de Logística', role: 'Diretoria',
      children: [
        {
          id: 'transp', name: 'Coordenador de Transporte', role: 'Coordenação',
          children: [
            { id: 'rotas', name: 'Analista de Rotas', role: 'Equipe', children: [] },
            { id: 'frota', name: 'Analista de Frota', role: 'Equipe', children: [] },
          ],
        },
        {
          id: 'estq', name: 'Coordenador de Estoque', role: 'Coordenação',
          children: [
            { id: 'conf', name: 'Conferente', role: 'Equipe', children: [] },
            { id: 'cust', name: 'Analista de Custódia', role: 'Equipe', children: [] },
          ],
        },
      ],
    },
    pipeline: {
      nodes: ids.map((id, i) => ({ id, label: id[0]!.toUpperCase() + id.slice(1), status: status(), x: i * 220, y: (i % 2) * 90 })),
      edges: chain(ids),
    },
    decision: {
      nodes: [
        { id: 'inicio', label: 'Objeto recebido', x: 0, y: 90 },
        { id: 'valido', label: 'Endereço válido?', x: 240, y: 90 },
        { id: 'rota', label: 'Segue para rota', x: 500, y: 0 },
        { id: 'cust', label: 'Custódia', x: 500, y: 180 },
        { id: 'tentativa', label: 'Nova tentativa?', x: 760, y: 180 },
      ],
      edges: [
        { id: 'a', source: 'inicio', target: 'valido' },
        { id: 'b', source: 'valido', target: 'rota', label: 'Sim' },
        { id: 'c', source: 'valido', target: 'cust', label: 'Não' },
        { id: 'd', source: 'cust', target: 'tentativa' },
      ],
    },
  }
}
```

Ajuste: em `pipeline.nodes`, o `status()` chama `rng.pick` com `as const` para o tipo `'ok' | 'warning' | 'error'`. Se o TypeScript reclamar do retorno, anotar `const status = (): 'ok' | 'warning' | 'error' => rng.pick(['ok', 'ok', 'ok', 'warning', 'error'])`.

Run: `npx vitest run src/data/mock/gallery/gallery.test.ts`
Expected: PASS.

- [ ] **Step 6: Repositório, registro e teste**

`src/data/repositories/gallery.ts`:

```ts
import type { EchartsData, FlowData, MapsData, RechartsData, TablesData } from '@/data/types/gallery'

export interface GalleryRepository {
  getRecharts(): Promise<RechartsData>
  getEcharts(): Promise<EchartsData>
  getMaps(): Promise<MapsData>
  getTables(): Promise<TablesData>
  getFlow(): Promise<FlowData>
}
```

`src/data/repositories/mock/gallery.ts`:

```ts
import { buildEchartsData } from '@/data/mock/gallery/echarts'
import { buildFlowData } from '@/data/mock/gallery/flow'
import { buildMapsData } from '@/data/mock/gallery/maps'
import { buildRechartsData } from '@/data/mock/gallery/recharts'
import { buildTablesData } from '@/data/mock/gallery/tables'
import { simulate } from '@/data/mock/simulate'
import type { GalleryRepository } from '@/data/repositories/gallery'

export const mockGalleryRepository: GalleryRepository = {
  getRecharts: () => simulate(buildRechartsData),
  getEcharts: () => simulate(buildEchartsData),
  getMaps: () => simulate(buildMapsData),
  getTables: () => simulate(buildTablesData),
  getFlow: () => simulate(buildFlowData),
}
```

Em `src/data/repositories/index.ts`: importar `GalleryRepository` e `mockGalleryRepository`, acrescentar `gallery: GalleryRepository` à interface `Repositories` e `gallery: mockGalleryRepository` ao objeto (mesma ordem alfabética dos demais).

`src/data/repositories/mock/gallery.test.ts`:

```ts
import { beforeEach, describe, expect, it } from 'vitest'
import { mockGalleryRepository as repo } from './gallery'

describe('mockGalleryRepository', () => {
  beforeEach(() => window.history.replaceState({}, '', '/?delay=0'))

  it('serves the data of every library', async () => {
    expect((await repo.getRecharts()).trend).toHaveLength(12)
    expect((await repo.getEcharts()).funnel.length).toBeGreaterThan(0)
    expect((await repo.getMaps()).hubs.length).toBeGreaterThan(0)
    expect((await repo.getTables()).shipments).toHaveLength(60)
    expect((await repo.getFlow()).steps.length).toBeGreaterThan(0)
  })

  it('fails on demand with ?error=1', async () => {
    window.history.replaceState({}, '', '/?delay=0&error=1')
    await expect(repo.getRecharts()).rejects.toThrow('Falha simulada')
  })
})
```

- [ ] **Step 7: Hooks**

`src/features/gallery/api.ts`:

```ts
import { useQuery } from '@tanstack/react-query'
import { useDevFlags } from '@/app/data/useDomainQuery'
import { repositories } from '@/data/repositories'

const repo = repositories.gallery

// A Galeria ignora os filtros globais: a chave leva só o nome do conjunto e as dev flags.
function useGalleryQuery<T>(name: string, fetcher: () => Promise<T>) {
  const devFlags = useDevFlags()
  return useQuery({ queryKey: ['gallery', name, devFlags], queryFn: fetcher, staleTime: Infinity })
}

export const useRechartsData = () => useGalleryQuery('recharts', () => repo.getRecharts())
export const useEchartsData = () => useGalleryQuery('echarts', () => repo.getEcharts())
export const useMapsData = () => useGalleryQuery('maps', () => repo.getMaps())
export const useTablesData = () => useGalleryQuery('tables', () => repo.getTables())
export const useFlowData = () => useGalleryQuery('flow', () => repo.getFlow())
```

- [ ] **Step 8: Verificar e commitar**

Run: `npx vitest run src/data` e `npm run typecheck` e `npm run lint`
Expected: PASS, sem warnings.

```bash
git add src/data src/features/gallery
git commit -m "feat: add gallery mock data, repository and query hooks

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 8: Casca da Galeria: `ExampleCard`, `LibraryPage`, índice e rota (TDD)

**Files:**
- Create: `src/features/gallery/libraries.ts`, `ExampleCard.tsx`, `LibraryPage.tsx`, `GalleryIndexPage.tsx`, `colors.ts`
- Modify: `src/app/routes.tsx`, `src/app/layout/AppLayout.test.tsx`
- Delete: `src/shared/ui/ComingSoon.tsx` (fica sem uso)
- Test: `src/features/gallery/GalleryIndexPage.test.tsx`, `src/features/gallery/LibraryPage.test.tsx`, `src/features/gallery/colors.test.ts`

**Interfaces:**
- Produces (`libraries.ts`): `GallerySlug = 'recharts' | 'echarts' | 'maps' | 'tables' | 'flow'`; `GalleryLibrary { slug: GallerySlug; name: string; tagline: string; whenToUse: string; examples: number; icon: LucideIcon }`; `GALLERY_LIBRARIES: GalleryLibrary[]` (nesta ordem: Recharts 6 exemplos, Apache ECharts 5, Mapas (react-leaflet) 4, Tabelas (TanStack Table) 4, Fluxos (React Flow) 4); `getLibrary(slug: GallerySlug): GalleryLibrary`.
- Produces (`ExampleCard.tsx`): `ExampleCard({ title, description, children, wide? })`: `section` com `h2` (nome do tipo de exemplo), `p` (quando usar este tipo) e o conteúdo; `wide` ocupa as duas colunas da grade.
- Produces (`LibraryPage.tsx`): `LibraryPage({ library, children })`: link "Galeria" de volta a `/gallery` mantendo os search params, `h1` com o nome, nota "Quando usar: ..." e grade de duas colunas (`xl`) para os exemplos.
- Produces (`GalleryIndexPage.tsx`): `GalleryIndexPage()` com `h1` "Galeria de Componentes", nota de que os filtros globais não se aplicam, e um `Link` por biblioteca para `/gallery/<slug>` (mantendo os search params).
- Produces (`colors.ts`): `withColors(series: SeriesInfo[]): { key: string; label: string; color: string }[]` (cores de `CHART_COLORS` em ordem, circular).

- [ ] **Step 1: Escrever os testes que falham**

`src/features/gallery/colors.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { CHART_COLORS } from '@/shared/charts/chartTheme'
import { withColors } from './colors'

describe('withColors', () => {
  it('assigns the chart palette in order and wraps around', () => {
    const series = Array.from({ length: 10 }, (_, i) => ({ key: `k${i}`, label: `L${i}` }))
    const colored = withColors(series)
    expect(colored[0]).toEqual({ key: 'k0', label: 'L0', color: CHART_COLORS[0] })
    expect(colored[8]!.color).toBe(CHART_COLORS[0])
  })
})
```

`src/features/gallery/GalleryIndexPage.test.tsx`:

```tsx
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/renderWithProviders'
import { GalleryIndexPage } from './GalleryIndexPage'

describe('GalleryIndexPage', () => {
  it('lists one card per library with its example count', () => {
    renderWithProviders(<GalleryIndexPage />, { url: '/gallery' })
    expect(screen.getByRole('heading', { level: 1, name: 'Galeria de Componentes' })).toBeInTheDocument()
    const links = screen.getAllByRole('link')
    expect(links.map((l) => l.getAttribute('href'))).toEqual([
      '/gallery/recharts', '/gallery/echarts', '/gallery/maps', '/gallery/tables', '/gallery/flow',
    ])
    expect(screen.getByRole('link', { name: /Recharts/ })).toHaveTextContent('6 exemplos')
    expect(screen.getByRole('link', { name: /Apache ECharts/ })).toHaveTextContent('5 exemplos')
  })

  it('warns that global filters do not apply and keeps the query string in the links', () => {
    renderWithProviders(<GalleryIndexPage />, { url: '/gallery?period=30d' })
    expect(screen.getByText(/filtros globais não se aplicam/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Recharts/ })).toHaveAttribute('href', '/gallery/recharts?period=30d')
  })
})
```

`src/features/gallery/LibraryPage.test.tsx`:

```tsx
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/renderWithProviders'
import { ExampleCard } from './ExampleCard'
import { getLibrary } from './libraries'
import { LibraryPage } from './LibraryPage'

describe('LibraryPage', () => {
  it('shows the library name, the "when to use" note and a way back', () => {
    renderWithProviders(
      <LibraryPage library={getLibrary('recharts')}>
        <ExampleCard title="Linha" description="Tendência ao longo do tempo.">conteúdo</ExampleCard>
      </LibraryPage>,
      { url: '/gallery/recharts?period=30d' },
    )
    expect(screen.getByRole('heading', { level: 1, name: 'Recharts' })).toBeInTheDocument()
    expect(screen.getByText(/Quando usar:/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Galeria/ })).toHaveAttribute('href', '/gallery?period=30d')
    expect(screen.getByRole('heading', { level: 2, name: 'Linha' })).toBeInTheDocument()
    expect(screen.getByText('Tendência ao longo do tempo.')).toBeInTheDocument()
  })
})
```

Run: `npx vitest run src/features/gallery`
Expected: FAIL (módulos não existem).

- [ ] **Step 2: Implementar `colors.ts` e `libraries.ts`**

`src/features/gallery/colors.ts`:

```ts
import type { SeriesInfo } from '@/data/types/gallery'
import { CHART_COLORS } from '@/shared/charts/chartTheme'

export const withColors = (series: SeriesInfo[]) =>
  series.map((s, i) => ({ ...s, color: CHART_COLORS[i % CHART_COLORS.length] ?? CHART_COLORS[0] }))
```

`src/features/gallery/libraries.ts`:

```ts
import { BarChart3, Map, Network, Table2, Waypoints, type LucideIcon } from 'lucide-react'

export type GallerySlug = 'recharts' | 'echarts' | 'maps' | 'tables' | 'flow'

export interface GalleryLibrary {
  slug: GallerySlug
  name: string
  tagline: string
  whenToUse: string
  examples: number
  icon: LucideIcon
}

export const GALLERY_LIBRARIES: GalleryLibrary[] = [
  {
    slug: 'recharts', name: 'Recharts', icon: BarChart3, examples: 6,
    tagline: 'Gráficos de negócio como componentes React.',
    whenToUse: 'gráficos comuns (linhas, barras, áreas, pizza, radar) quando você quer componentes declarativos, leves e fáceis de tematizar. Passa do limite com muitos milhares de pontos ou tipos estatísticos especiais.',
  },
  {
    slug: 'echarts', name: 'Apache ECharts', icon: Network, examples: 5,
    tagline: 'Visualizações densas e especializadas.',
    whenToUse: 'mapa de calor, funil, gauge, treemap, sankey e grandes volumes de dados. Custa mais no bundle, por isso só carrega nesta rota.',
  },
  {
    slug: 'maps', name: 'Mapas (react-leaflet)', icon: Map, examples: 4,
    tagline: 'Dados com localização.',
    whenToUse: 'quando o lugar faz parte da informação: distribuição por região, rotas e áreas de cobertura. Exige internet para os tiles e só carrega nas páginas com mapa.',
  },
  {
    slug: 'tables', name: 'Tabelas (TanStack Table)', icon: Table2, examples: 4,
    tagline: 'Listagens com ordenação, busca e seleção.',
    whenToUse: 'listagens que precisam de ordenação, busca, paginação, seleção ou detalhe por linha. A biblioteca cuida do estado e você controla toda a marcação.',
  },
  {
    slug: 'flow', name: 'Fluxos (React Flow)', icon: Waypoints, examples: 4,
    tagline: 'Diagramas de nós e conexões.',
    whenToUse: 'fluxogramas, organogramas e pipelines em que nós e conexões são o dado. Suporta arrastar, zoom e mapa de navegação.',
  },
]

export const getLibrary = (slug: GallerySlug): GalleryLibrary =>
  GALLERY_LIBRARIES.find((l) => l.slug === slug) ?? GALLERY_LIBRARIES[0]!
```

Se algum ícone não existir na versão instalada do `lucide-react`, conferir os nomes em `node_modules/lucide-react/dist/lucide-react.d.ts` e trocar pelo mais próximo.

- [ ] **Step 3: Implementar os componentes**

`src/features/gallery/ExampleCard.tsx`:

```tsx
import { useId, type ReactNode } from 'react'

interface ExampleCardProps {
  title: string
  description: string
  children: ReactNode
  wide?: boolean
}

export function ExampleCard({ title, description, children, wide = false }: ExampleCardProps) {
  const id = useId()
  return (
    <section aria-labelledby={id} className={`space-y-2 ${wide ? 'xl:col-span-2' : ''}`}>
      <div>
        <h2 id={id} className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      {children}
    </section>
  )
}
```

`src/features/gallery/LibraryPage.tsx`:

```tsx
import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { GalleryLibrary } from './libraries'

export function LibraryPage({ library, children }: { library: GalleryLibrary; children: ReactNode }) {
  const { search } = useLocation()
  return (
    <div className="space-y-6">
      <Link
        to={{ pathname: '/gallery', search }}
        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline dark:text-blue-400"
      >
        <ArrowLeft size={14} aria-hidden />
        Galeria
      </Link>
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">{library.name}</h1>
        <p className="rounded-lg bg-slate-100 p-3 text-sm dark:bg-slate-800">
          <strong>Quando usar:</strong> {library.whenToUse}
        </p>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">{children}</div>
    </div>
  )
}
```

`src/features/gallery/GalleryIndexPage.tsx`:

```tsx
import { Link, useLocation } from 'react-router-dom'
import { GALLERY_LIBRARIES } from './libraries'

export function GalleryIndexPage() {
  const { search } = useLocation()
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Galeria de Componentes</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Um exemplo de cada tipo de visualização que dá para integrar a um dashboard. Os filtros globais não se
          aplicam à Galeria: os dados são exemplos fixos.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {GALLERY_LIBRARIES.map(({ slug, name, tagline, examples, icon: Icon }) => (
          <Link
            key={slug}
            to={{ pathname: `/gallery/${slug}`, search }}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-400 dark:border-slate-800 dark:bg-slate-900"
          >
            <Icon size={22} aria-hidden className="text-blue-600 dark:text-blue-400" />
            <p className="mt-3 text-base font-semibold">{name}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{tagline}</p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{`${examples} exemplos`}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
```

Run: `npx vitest run src/features/gallery`
Expected: PASS (4 testes).

- [ ] **Step 4: Ligar a rota do índice e limpar o placeholder**

Em `src/app/routes.tsx`, substituir a linha da rota `gallery` (hoje `ComingSoon`) por:

```tsx
      {
        path: 'gallery',
        children: [
          {
            index: true,
            lazy: async () => ({
              Component: (await import('@/features/gallery/GalleryIndexPage')).GalleryIndexPage,
            }),
          },
        ],
      },
```

Remover o `import { ComingSoon }` e apagar o arquivo: `grep -rn "ComingSoon" src` não deve listar nada além de `src/shared/ui/ComingSoon.tsx`; então `git rm src/shared/ui/ComingSoon.tsx`. As tarefas 9 a 13 acrescentam uma rota-filha por biblioteca a este array `children`.

Em `src/app/layout/AppLayout.test.tsx`, renomear o teste `'shows the placeholder for routes not built yet'` para `'renders the gallery index'` (a asserção pelo heading "Galeria de Componentes" continua válida).

- [ ] **Step 5: Verificar**

Run: `npm test`, `npm run typecheck`, `npm run lint`
Expected: tudo verde.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add gallery index, library page shell and route

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 9: Página `/gallery/recharts` (6 exemplos) (TDD)

**Files:**
- Create: `src/features/gallery/recharts/RechartsPage.tsx`
- Modify: `src/app/routes.tsx` (rota-filha `recharts`)
- Test: `src/features/gallery/recharts/RechartsPage.test.tsx`

**Interfaces:**
- Consumes: `useRechartsData()` (Task 7); `LibraryPage`, `ExampleCard`, `getLibrary`, `withColors` (Task 8); `LineChartCard`, `GroupedBarChartCard`, `PieChartCard`, `AreaChartCard`, `ComposedChartCard`, `RadarChartCard`; `ACCENT_HEX`, `CHART_COLORS`; `QueryBoundary`, `Skeleton`.
- Produces: `RechartsPage()` com 6 `ExampleCard` (h2): "Linha", "Barras agrupadas", "Pizza", "Área empilhada", "Composto (barras e linha)", "Radar".

- [ ] **Step 1: Escrever os testes que falham**

`src/features/gallery/recharts/RechartsPage.test.tsx`:

```tsx
import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/renderWithProviders'
import { RechartsPage } from './RechartsPage'

const url = '/gallery/recharts?delay=0'

describe('RechartsPage', () => {
  beforeEach(() => window.history.replaceState({}, '', url))

  it('renders the six examples with their charts', async () => {
    renderWithProviders(<RechartsPage />, { url })
    expect(screen.getByRole('heading', { level: 1, name: 'Recharts' })).toBeInTheDocument()
    const titles = (await screen.findAllByRole('heading', { level: 2 })).map((h) => h.textContent)
    expect(titles).toEqual(['Linha', 'Barras agrupadas', 'Pizza', 'Área empilhada', 'Composto (barras e linha)', 'Radar'])
    expect(await screen.findByRole('heading', { name: 'Volume por canal em 12 meses' })).toBeInTheDocument()
    expect(screen.getAllByRole('img', { name: /Jan: Agência .*Digital .*Telefone/ }).length).toBeGreaterThan(0)
  })

  it('shows an error alert when the repository fails', async () => {
    window.history.replaceState({}, '', '/gallery/recharts?delay=0&error=1')
    renderWithProviders(<RechartsPage />, { url: '/gallery/recharts?delay=0&error=1' })
    expect(await screen.findByRole('alert')).toHaveTextContent('Falha simulada')
  })
})
```

Nota: cada `ExampleCard` só aparece depois que os dados chegam, então o `findAllByRole('heading', { level: 2 })` espera a resolução. Vários gráficos (barras e área) descrevem "Jan: Agência ...", por isso a asserção usa `getAllByRole`.

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/features/gallery/recharts`
Expected: FAIL (módulo `./RechartsPage` não existe).

- [ ] **Step 3: Implementar**

`src/features/gallery/recharts/RechartsPage.tsx`:

```tsx
import { ACCENT_HEX } from '@/shared/charts/chartTheme'
import { AreaChartCard } from '@/shared/charts/AreaChartCard'
import { ComposedChartCard } from '@/shared/charts/ComposedChartCard'
import { GroupedBarChartCard } from '@/shared/charts/GroupedBarChartCard'
import { LineChartCard } from '@/shared/charts/LineChartCard'
import { PieChartCard } from '@/shared/charts/PieChartCard'
import { RadarChartCard } from '@/shared/charts/RadarChartCard'
import { QueryBoundary } from '@/shared/ui/QueryBoundary'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useRechartsData } from '../api'
import { withColors } from '../colors'
import { ExampleCard } from '../ExampleCard'
import { getLibrary } from '../libraries'
import { LibraryPage } from '../LibraryPage'

export function RechartsPage() {
  const query = useRechartsData()
  return (
    <LibraryPage library={getLibrary('recharts')}>
      <QueryBoundary query={query} skeleton={<Skeleton className="h-80 xl:col-span-2" />}>
        {(d) => (
          <>
            <ExampleCard title="Linha" description="Tendência de uma série ao longo do tempo.">
              <LineChartCard title="Entregas por mês" data={d.trend} />
            </ExampleCard>
            <ExampleCard title="Barras agrupadas" description="Comparar categorias lado a lado.">
              <GroupedBarChartCard title="Envios por canal (1º trimestre)" series={withColors(d.channels)} data={d.channelVolume.slice(0, 3)} />
            </ExampleCard>
            <ExampleCard title="Pizza" description="Participação de cada parte no total (poucas fatias).">
              <PieChartCard title="Objetos por status" data={d.statusShare} />
            </ExampleCard>
            <ExampleCard title="Área empilhada" description="Composição do total e sua evolução.">
              <AreaChartCard title="Volume por canal em 12 meses" series={withColors(d.channels)} data={d.channelVolume} />
            </ExampleCard>
            <ExampleCard title="Composto (barras e linha)" description="Realizado contra meta na mesma escala.">
              <ComposedChartCard
                title="Volume total contra a meta"
                barSeries={[{ key: 'volume', label: 'Volume', color: ACCENT_HEX.purple }]}
                lineSeries={[{ key: 'meta', label: 'Meta', color: ACCENT_HEX.pink }]}
                data={d.volumeVsTarget}
              />
            </ExampleCard>
            <ExampleCard title="Radar" description="Perfil de várias dimensões para poucas entidades.">
              <RadarChartCard title="Desempenho por unidade" series={withColors(d.units)} data={d.unitPerformance} />
            </ExampleCard>
          </>
        )}
      </QueryBoundary>
    </LibraryPage>
  )
}
```

- [ ] **Step 4: Rota**

Em `src/app/routes.tsx`, acrescentar ao array `children` de `gallery`:

```tsx
          {
            path: 'recharts',
            lazy: async () => ({
              Component: (await import('@/features/gallery/recharts/RechartsPage')).RechartsPage,
            }),
          },
```

- [ ] **Step 5: Rodar e verificar**

Run: `npx vitest run src/features/gallery` e `npm run typecheck` e `npm run lint`
Expected: PASS, sem warnings de dimensões do Recharts no console.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add Recharts gallery page with six examples

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 10: Opções e descrições dos gráficos ECharts (TDD)

**Files:**
- Create: `src/features/gallery/echarts/options.ts`, `src/features/gallery/echarts/descriptions.ts`
- Test: `src/features/gallery/echarts/options.test.ts`, `src/features/gallery/echarts/descriptions.test.ts`

**Interfaces:**
- Consumes: `HeatmapData`, `LabelValue`, `GaugeData`, `TreeNode`, `SankeyData` (Task 7); `EChartPalette`, `themeBase`, `tooltipStyle` (Task 3); `EChartsOption` (`@/shared/echarts/core`, só como tipo); `formatNumber`.
- Produces (`options.ts`, funções puras, sem tocar no ECharts): `heatmapOption(d: HeatmapData, p: EChartPalette)`, `funnelOption(d: LabelValue[], p)`, `gaugeOption(d: GaugeData, p)`, `treemapOption(d: TreeNode[], p)`, `sankeyOption(d: SankeyData, p)`; todas devolvem `EChartsOption` com `series[0].type` igual a `'heatmap' | 'funnel' | 'gauge' | 'treemap' | 'sankey'`, começam por `...themeBase(p)` e usam `p.text` nos textos.
- Produces (`descriptions.ts`, alternativa textual): `describeHeatmap(d)`, `describeFunnel(d)`, `describeGauge(d)`, `describeTreemap(d)`, `describeSankey(d)`, todas `string`.

- [ ] **Step 1: Escrever os testes que falham**

`src/features/gallery/echarts/options.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { buildEchartsData } from '@/data/mock/gallery/echarts'
import { chartPalette } from '@/shared/echarts/palette'
import { funnelOption, gaugeOption, heatmapOption, sankeyOption, treemapOption } from './options'

const d = buildEchartsData()
const light = chartPalette('light')
const dark = chartPalette('dark')

interface Loose {
  series: { type: string; data?: unknown[]; links?: unknown[]; max?: number }[]
  textStyle: { color: string }
  visualMap?: { max: number }
}
const loose = (o: unknown) => o as Loose

describe('ECharts option builders', () => {
  it('build one series of the expected type each', () => {
    expect(loose(heatmapOption(d.heatmap, light)).series[0]!.type).toBe('heatmap')
    expect(loose(funnelOption(d.funnel, light)).series[0]!.type).toBe('funnel')
    expect(loose(gaugeOption(d.gauge, light)).series[0]!.type).toBe('gauge')
    expect(loose(treemapOption(d.treemap, light)).series[0]!.type).toBe('treemap')
    expect(loose(sankeyOption(d.sankey, light)).series[0]!.type).toBe('sankey')
  })

  it('pass the data through', () => {
    expect(loose(heatmapOption(d.heatmap, light)).series[0]!.data).toHaveLength(d.heatmap.cells.length)
    expect(loose(funnelOption(d.funnel, light)).series[0]!.data).toHaveLength(d.funnel.length)
    expect(loose(sankeyOption(d.sankey, light)).series[0]!.links).toHaveLength(d.sankey.links.length)
    expect(loose(gaugeOption(d.gauge, light)).series[0]!.max).toBe(d.gauge.max)
  })

  it('scale the heatmap colour range to the largest cell', () => {
    const max = Math.max(...d.heatmap.cells.map((c) => c[2]))
    expect(loose(heatmapOption(d.heatmap, light)).visualMap!.max).toBe(max)
  })

  it('follow the palette of the theme', () => {
    expect(loose(funnelOption(d.funnel, light)).textStyle.color).toBe(light.text)
    expect(loose(funnelOption(d.funnel, dark)).textStyle.color).toBe(dark.text)
  })
})
```

`src/features/gallery/echarts/descriptions.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { describeFunnel, describeGauge, describeHeatmap, describeSankey, describeTreemap } from './descriptions'

describe('ECharts text alternatives', () => {
  it('summarises the heatmap by its peak and its quietest slot', () => {
    const text = describeHeatmap({ days: ['Seg', 'Ter'], hours: ['08h', '09h'], cells: [[0, 0, 5], [1, 0, 50], [0, 1, 7], [1, 1, 20]] })
    expect(text).toBe('Maior volume: Seg às 09h (50). Menor volume: Seg às 08h (5).')
  })
  it('lists funnel stages, the gauge value, treemap groups and sankey links', () => {
    expect(describeFunnel([{ label: 'A', value: 1000 }, { label: 'B', value: 800 }])).toBe('A: 1.000; B: 800')
    expect(describeGauge({ label: 'SLA', value: 94, max: 100 })).toBe('SLA: 94 de 100')
    expect(describeTreemap([{ name: 'X', children: [{ name: 'a', value: 10 }, { name: 'b', value: 5 }] }])).toBe('X: 15')
    expect(describeSankey({ nodes: [{ name: 'P' }, { name: 'Q' }], links: [{ source: 'P', target: 'Q', value: 3 }] })).toBe('P para Q: 3')
  })
})
```

Run: `npx vitest run src/features/gallery/echarts`
Expected: FAIL (módulos não existem).

- [ ] **Step 2: Implementar as descrições**

`src/features/gallery/echarts/descriptions.ts`:

```ts
import type { GaugeData, HeatmapData, LabelValue, SankeyData, TreeNode } from '@/data/types/gallery'
import { formatNumber } from '@/shared/lib/formatters'

export function describeHeatmap(d: HeatmapData): string {
  const sorted = [...d.cells].sort((a, b) => b[2] - a[2])
  const slot = (cell: [number, number, number] | undefined) =>
    cell ? `${d.days[cell[1]]} às ${d.hours[cell[0]]} (${formatNumber(cell[2])})` : 'sem dados'
  return `Maior volume: ${slot(sorted[0])}. Menor volume: ${slot(sorted[sorted.length - 1])}.`
}

export const describeFunnel = (d: LabelValue[]): string =>
  d.map((s) => `${s.label}: ${formatNumber(s.value)}`).join('; ')

export const describeGauge = (d: GaugeData): string => `${d.label}: ${d.value} de ${d.max}`

const total = (node: TreeNode): number =>
  node.children ? node.children.reduce((sum, c) => sum + total(c), 0) : (node.value ?? 0)

export const describeTreemap = (d: TreeNode[]): string =>
  d.map((n) => `${n.name}: ${formatNumber(total(n))}`).join('; ')

export const describeSankey = (d: SankeyData): string =>
  d.links.map((l) => `${l.source} para ${l.target}: ${formatNumber(l.value)}`).join('; ')
```

- [ ] **Step 3: Implementar as opções**

`src/features/gallery/echarts/options.ts`:

```ts
import type { GaugeData, HeatmapData, LabelValue, SankeyData, TreeNode } from '@/data/types/gallery'
import type { EChartsOption } from '@/shared/echarts/core'
import { themeBase, tooltipStyle, type EChartPalette } from '@/shared/echarts/palette'

export const heatmapOption = (d: HeatmapData, p: EChartPalette): EChartsOption => ({
  ...themeBase(p),
  tooltip: { ...tooltipStyle(p), position: 'top' },
  grid: { left: 48, right: 24, top: 16, bottom: 72 },
  xAxis: { type: 'category', data: d.hours, splitArea: { show: true } },
  yAxis: { type: 'category', data: d.days, inverse: true, splitArea: { show: true } },
  visualMap: {
    min: 0,
    max: Math.max(...d.cells.map((c) => c[2])),
    calculable: true,
    orient: 'horizontal',
    left: 'center',
    bottom: 8,
    inRange: { color: ['#dbeafe', '#3b82f6', '#1e3a8a'] },
    textStyle: { color: p.text },
  },
  series: [{ type: 'heatmap', data: d.cells, label: { show: false } }],
})

export const funnelOption = (d: LabelValue[], p: EChartPalette): EChartsOption => ({
  ...themeBase(p),
  tooltip: { ...tooltipStyle(p), trigger: 'item' },
  series: [
    {
      type: 'funnel',
      left: '10%',
      width: '80%',
      top: 16,
      bottom: 16,
      sort: 'descending',
      gap: 2,
      label: { show: true, position: 'inside', formatter: '{b}: {c}', color: '#ffffff' },
      data: d.map((s) => ({ name: s.label, value: s.value })),
    },
  ],
})

export const gaugeOption = (d: GaugeData, p: EChartPalette): EChartsOption => ({
  ...themeBase(p),
  series: [
    {
      type: 'gauge',
      min: 0,
      max: d.max,
      progress: { show: true, width: 14 },
      axisLine: { lineStyle: { width: 14 } },
      axisLabel: { color: p.text },
      title: { color: p.text },
      detail: { valueAnimation: true, formatter: '{value}%', color: p.text, fontSize: 28 },
      data: [{ value: d.value, name: d.label }],
    },
  ],
})

export const treemapOption = (d: TreeNode[], p: EChartPalette): EChartsOption => ({
  ...themeBase(p),
  tooltip: { ...tooltipStyle(p), trigger: 'item' },
  series: [
    {
      type: 'treemap',
      roam: false,
      nodeClick: false,
      breadcrumb: { show: false },
      label: { show: true, formatter: '{b}' },
      upperLabel: { show: true, height: 22 },
      data: d,
    },
  ],
})

export const sankeyOption = (d: SankeyData, p: EChartPalette): EChartsOption => ({
  ...themeBase(p),
  tooltip: { ...tooltipStyle(p), trigger: 'item' },
  series: [
    {
      type: 'sankey',
      left: 16,
      right: 96,
      top: 16,
      bottom: 16,
      emphasis: { focus: 'adjacency' },
      lineStyle: { color: 'gradient', curveness: 0.5 },
      label: { color: p.text },
      data: d.nodes,
      links: d.links,
    },
  ],
})
```

Run: `npx vitest run src/features/gallery/echarts` e `npm run typecheck`
Expected: PASS e typecheck limpo. Se algum campo de opção não existir nos tipos da versão instalada (por exemplo `valueAnimation` em `detail`), conferir na documentação da versão e ajustar; os testes só exigem tipo de série, dados e cor de texto.

- [ ] **Step 4: Commit**

```bash
git add src/features/gallery/echarts
git commit -m "feat: add ECharts option builders and text alternatives for the gallery

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 11: Página `/gallery/echarts` (5 exemplos) e chunk lazy (TDD)

**Files:**
- Create: `src/features/gallery/echarts/EchartsPage.tsx`
- Modify: `src/app/routes.tsx` (rota-filha `echarts`)
- Test: `src/features/gallery/echarts/EchartsPage.test.tsx`

**Interfaces:**
- Consumes: `useEchartsData()` (Task 7); `option builders` e `describe*` (Task 10); `EChart` (`@/shared/echarts/EChart`), `chartPalette` (Task 3); `useAppTheme` (`@/app/layout/ThemeContext`, permitido em `features`); `LibraryPage`, `ExampleCard`, `getLibrary` (Task 8).
- Produces: `EchartsPage()` com 5 `ExampleCard` (h2): "Mapa de calor", "Funil", "Gauge", "Treemap", "Sankey". As opções são recalculadas quando o tema muda (`useMemo` por dados e tema).

- [ ] **Step 1: Escrever os testes que falham**

O teste substitui o componente `EChart` por um stub (o ECharts real não roda de forma confiável no jsdom); ele registra o tipo da série e a cor de texto recebida.

`src/features/gallery/echarts/EchartsPage.test.tsx`:

```tsx
import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/renderWithProviders'

interface StubProps {
  title: string
  description: string
  option: { series: { type: string }[]; textStyle: { color: string } }
}

vi.mock('@/shared/echarts/EChart', () => ({
  EChart: ({ title, description, option }: StubProps) => (
    <figure aria-label={title} data-type={option.series[0]!.type} data-text={option.textStyle.color}>
      {description}
    </figure>
  ),
}))

import { EchartsPage } from './EchartsPage'

const url = '/gallery/echarts?delay=0'

describe('EchartsPage', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', url)
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('renders the five examples, each with its series type and a text alternative', async () => {
    renderWithProviders(<EchartsPage />, { url })
    expect(screen.getByRole('heading', { level: 1, name: 'Apache ECharts' })).toBeInTheDocument()
    const titles = (await screen.findAllByRole('heading', { level: 2 })).map((h) => h.textContent)
    expect(titles).toEqual(['Mapa de calor', 'Funil', 'Gauge', 'Treemap', 'Sankey'])
    const types = screen.getAllByRole('figure').map((f) => f.getAttribute('data-type'))
    expect(types).toEqual(['heatmap', 'funnel', 'gauge', 'treemap', 'sankey'])
    expect(screen.getByRole('figure', { name: 'SLA de entrega' })).toHaveTextContent(/SLA de entrega \(%\): \d+ de 100/)
  })

  it('uses the light palette by default', async () => {
    renderWithProviders(<EchartsPage />, { url })
    const figures = await screen.findAllByRole('figure')
    expect(figures.every((f) => f.getAttribute('data-text') === '#64748b')).toBe(true)
  })

  it('shows an error alert when the repository fails', async () => {
    window.history.replaceState({}, '', '/gallery/echarts?delay=0&error=1')
    renderWithProviders(<EchartsPage />, { url: '/gallery/echarts?delay=0&error=1' })
    expect(await screen.findByRole('alert')).toHaveTextContent('Falha simulada')
  })
})
```

Nota: o título do `EChart` do gauge é "SLA de entrega" e a descrição vem de `describeGauge` ("SLA de entrega (%): 94 de 100"). Se `getByRole('figure', { name })` falhar por o `aria-label` do stub casar com mais de um elemento, trocar por `getAllByRole('figure')[2]`.

Run: `npx vitest run src/features/gallery/echarts/EchartsPage.test.tsx`
Expected: FAIL (módulo `./EchartsPage` não existe).

- [ ] **Step 2: Implementar a página**

`src/features/gallery/echarts/EchartsPage.tsx`:

```tsx
import { useMemo } from 'react'
import { useAppTheme } from '@/app/layout/ThemeContext'
import type { EchartsData } from '@/data/types/gallery'
import { EChart } from '@/shared/echarts/EChart'
import { chartPalette } from '@/shared/echarts/palette'
import { QueryBoundary } from '@/shared/ui/QueryBoundary'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useEchartsData } from '../api'
import { ExampleCard } from '../ExampleCard'
import { getLibrary } from '../libraries'
import { LibraryPage } from '../LibraryPage'
import { describeFunnel, describeGauge, describeHeatmap, describeSankey, describeTreemap } from './descriptions'
import { funnelOption, gaugeOption, heatmapOption, sankeyOption, treemapOption } from './options'

function Examples({ data }: { data: EchartsData }) {
  const { theme } = useAppTheme()
  const options = useMemo(() => {
    const p = chartPalette(theme)
    return {
      heatmap: heatmapOption(data.heatmap, p),
      funnel: funnelOption(data.funnel, p),
      gauge: gaugeOption(data.gauge, p),
      treemap: treemapOption(data.treemap, p),
      sankey: sankeyOption(data.sankey, p),
    }
  }, [data, theme])
  return (
    <>
      <ExampleCard title="Mapa de calor" description="Intensidade em duas dimensões, como hora do dia contra dia da semana." wide>
        <EChart title="Entregas por dia e hora" description={describeHeatmap(data.heatmap)} option={options.heatmap} height={360} />
      </ExampleCard>
      <ExampleCard title="Funil" description="Perda de volume entre etapas sequenciais de um processo.">
        <EChart title="Do pedido à entrega" description={describeFunnel(data.funnel)} option={options.funnel} />
      </ExampleCard>
      <ExampleCard title="Gauge" description="Um indicador único contra sua meta ou limite.">
        <EChart title="SLA de entrega" description={describeGauge(data.gauge)} option={options.gauge} />
      </ExampleCard>
      <ExampleCard title="Treemap" description="Composição hierárquica em que a área representa o valor.">
        <EChart title="Custo por categoria (R$ mil)" description={describeTreemap(data.treemap)} option={options.treemap} />
      </ExampleCard>
      <ExampleCard title="Sankey" description="Fluxo entre estados, com a espessura proporcional ao volume.">
        <EChart title="Caminho dos objetos" description={describeSankey(data.sankey)} option={options.sankey} />
      </ExampleCard>
    </>
  )
}

export function EchartsPage() {
  const query = useEchartsData()
  return (
    <LibraryPage library={getLibrary('echarts')}>
      <QueryBoundary query={query} skeleton={<Skeleton className="h-80 xl:col-span-2" />}>
        {(data) => <Examples data={data} />}
      </QueryBoundary>
    </LibraryPage>
  )
}
```

Ajuste necessário: o teste espera `screen.getByRole('figure', { name: 'SLA de entrega' })`; o stub usa o `title` do `EChart` como `aria-label`, e o gauge usa `title="SLA de entrega"`. Manter esses títulos como estão.

- [ ] **Step 3: Rota lazy**

Acrescentar ao array `children` de `gallery` em `src/app/routes.tsx`:

```tsx
          {
            path: 'echarts',
            lazy: async () => ({
              Component: (await import('@/features/gallery/echarts/EchartsPage')).EchartsPage,
            }),
          },
```

- [ ] **Step 4: Rodar e verificar o chunk**

Run: `npx vitest run src/features/gallery` e `npm run typecheck` e `npm run lint`
Expected: PASS.

Run: `npm run build` e depois `grep -l "echarts" dist/assets/*.js`
Expected: só o chunk lazy da página ECharts (e no máximo um chunk compartilhado de zrender/echarts) aparece; `index-*.js` não pode aparecer. Registrar os tamanhos dos chunks no relatório da tarefa.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add ECharts gallery page with five examples in a lazy chunk

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 12: Página `/gallery/maps` (4 exemplos) (TDD)

**Files:**
- Create: `src/features/gallery/maps/MapsPage.tsx`
- Modify: `src/app/routes.tsx` (rota-filha `maps`)
- Test: `src/features/gallery/maps/MapsPage.test.tsx`

**Interfaces:**
- Consumes: `useMapsData()` (Task 7); `RegionMap` e `MapPoint` (`@/shared/maps/RegionMap`), `RouteMap`, `CoverageMap` (Task 6); `LibraryPage`, `ExampleCard`, `getLibrary` (Task 8); `formatNumber`; `QueryBoundary`, `Skeleton`.
- Produces: `MapsPage()` com 4 `ExampleCard` (h2): "Bolhas por região", "Mapa temático por capital", "Rotas entre centros", "Áreas de cobertura". O segundo usa `colorFor` e `format` próprios para mostrar que `RegionMap` aceita outra escala de cor.

- [ ] **Step 1: Escrever os testes que falham**

O `react-leaflet` é mockado só neste arquivo (o jsdom não roda o renderizador do Leaflet).

`src/features/gallery/maps/MapsPage.test.tsx`:

```tsx
import { screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/renderWithProviders'

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TileLayer: () => null,
  CircleMarker: ({ children }: { children: ReactNode }) => <div data-testid="marker">{children}</div>,
  Polyline: () => <div data-testid="route" />,
  Circle: ({ children }: { children: ReactNode }) => <div data-testid="area">{children}</div>,
  Popup: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

import { MapsPage } from './MapsPage'

const url = '/gallery/maps?delay=0'

describe('MapsPage', () => {
  beforeEach(() => window.history.replaceState({}, '', url))

  it('renders the four examples with their maps', async () => {
    renderWithProviders(<MapsPage />, { url })
    expect(screen.getByRole('heading', { level: 1, name: 'Mapas (react-leaflet)' })).toBeInTheDocument()
    const titles = (await screen.findAllByRole('heading', { level: 2 })).map((h) => h.textContent)
    expect(titles).toEqual(['Bolhas por região', 'Mapa temático por capital', 'Rotas entre centros', 'Áreas de cobertura'])
    expect(screen.getAllByRole('region', { name: /^Mapa:/ })).toHaveLength(4)
    expect(screen.getAllByTestId('route').length).toBeGreaterThan(0)
    expect(screen.getAllByTestId('area')).toHaveLength(5)
  })

  it('lists the values as text for assistive tech', async () => {
    renderWithProviders(<MapsPage />, { url })
    expect(await screen.findByRole('list', { name: 'Valores: Índice de SLA por região' })).toBeInTheDocument()
    expect(screen.getByRole('list', { name: /^Rotas:/ })).toBeInTheDocument()
    expect(screen.getByRole('list', { name: /^Áreas:/ })).toBeInTheDocument()
  })

  it('shows an error alert when the repository fails', async () => {
    window.history.replaceState({}, '', '/gallery/maps?delay=0&error=1')
    renderWithProviders(<MapsPage />, { url: '/gallery/maps?delay=0&error=1' })
    expect(await screen.findByRole('alert')).toHaveTextContent('Falha simulada')
  })
})
```

Run: `npx vitest run src/features/gallery/maps`
Expected: FAIL (módulo `./MapsPage` não existe).

- [ ] **Step 2: Implementar**

`src/features/gallery/maps/MapsPage.tsx`:

```tsx
import { CoverageMap } from '@/shared/maps/CoverageMap'
import { RegionMap } from '@/shared/maps/RegionMap'
import { RouteMap } from '@/shared/maps/RouteMap'
import { formatNumber } from '@/shared/lib/formatters'
import { QueryBoundary } from '@/shared/ui/QueryBoundary'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useMapsData } from '../api'
import { ExampleCard } from '../ExampleCard'
import { getLibrary } from '../libraries'
import { LibraryPage } from '../LibraryPage'

const thematicColor = (value: number): string => (value >= 90 ? '#0ea5e9' : value >= 80 ? '#6366f1' : '#f43f5e')

export function MapsPage() {
  const query = useMapsData()
  return (
    <LibraryPage library={getLibrary('maps')}>
      <QueryBoundary query={query} skeleton={<Skeleton className="h-96 xl:col-span-2" />}>
        {(d) => (
          <>
            <ExampleCard title="Bolhas por região" description="Um valor por área, com cor e tamanho pelo valor.">
              <RegionMap title="Índice de SLA por região" points={d.regionScores} format={(v) => `${formatNumber(v)}%`} />
            </ExampleCard>
            <ExampleCard title="Mapa temático por capital" description="Mesma base com escala de cor própria (azul, índigo e rosa).">
              <RegionMap
                title="Entregas por capital"
                points={d.branchScores}
                format={(v) => `${formatNumber(v)} pontos`}
                colorFor={thematicColor}
              />
            </ExampleCard>
            <ExampleCard title="Rotas entre centros" description="Conexões entre pontos, com espessura pelo volume.">
              <RouteMap title="Rotas de transferência" hubs={d.hubs} routes={d.routes} format={(v) => `${formatNumber(v)} envios`} />
            </ExampleCard>
            <ExampleCard title="Áreas de cobertura" description="Raios em quilômetros ao redor de um ponto.">
              <CoverageMap title="Cobertura das agências" areas={d.coverage} />
            </ExampleCard>
          </>
        )}
      </QueryBoundary>
    </LibraryPage>
  )
}
```

Nota: `GeoPoint` tem os mesmos campos de `MapPoint` (`id`, `label`, `lat`, `lng`, `value`, `detail`), então passa direto. O título "Índice de SLA por região" deve coincidir com o do teste (`Valores: Índice de SLA por região`).

- [ ] **Step 3: Rota**

Acrescentar ao array `children` de `gallery` em `src/app/routes.tsx`:

```tsx
          {
            path: 'maps',
            lazy: async () => ({
              Component: (await import('@/features/gallery/maps/MapsPage')).MapsPage,
            }),
          },
```

- [ ] **Step 4: Rodar e verificar**

Run: `npx vitest run src/features/gallery/maps` e `npm run typecheck` e `npm run lint`
Expected: PASS, sem warnings.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add maps gallery page with four examples

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 13: Página `/gallery/tables` (4 exemplos) (TDD)

**Files:**
- Create: `src/features/gallery/tables/cells.tsx`, `src/features/gallery/tables/columns.tsx`, `src/features/gallery/tables/TablesPage.tsx`
- Modify: `src/app/routes.tsx` (rota-filha `tables`)
- Test: `src/features/gallery/tables/cells.test.tsx`, `src/features/gallery/tables/TablesPage.test.tsx`

**Interfaces:**
- Consumes: `useTablesData()`, `Shipment`, `ShipmentStatus` (Task 7); `DataTable`, `DataColumn` (Task 5); `LibraryPage`, `ExampleCard`, `getLibrary` (Task 8); `formatCurrency`, `formatNumber`, `formatPercentage`.
- Produces (`cells.tsx`): `StatusBadge({ status: ShipmentStatus })` (texto do status com cor por status) e `ProgressBar({ value: number })` (`role="progressbar"`, `aria-valuenow`, `aria-valuemin=0`, `aria-valuemax=100`, `aria-label` "Progresso da entrega").
- Produces (`columns.tsx`, constantes de módulo, para manter a identidade estável): `BASIC_COLUMNS` (Envio, Destinatário, Cidade, Valor) e `RICH_COLUMNS` (Envio, Destinatário, Status com `StatusBadge`, Progresso com `ProgressBar`, Valor), ambos `DataColumn<Shipment>[]` com `sortValue` em todas as colunas.
- Produces: `TablesPage()` com 4 `ExampleCard` (h2) e tabelas com as legendas: "Ordenação" (`Envios recentes`, 8 linhas), "Busca e paginação" (`Todos os envios`, `searchable`, `pageSize={10}`), "Seleção de linhas" (`Envios para seleção`, 10 linhas, `selectable`, mostra `Valor selecionado: <R$>`), "Células ricas e linhas expansíveis" (`Envios com detalhe`, `RICH_COLUMNS`, `renderDetail` com a lista de eventos).

- [ ] **Step 1: Escrever os testes que falham**

`src/features/gallery/tables/cells.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProgressBar, StatusBadge } from './cells'

describe('table cells', () => {
  it('shows the status as text', () => {
    render(<StatusBadge status="Extraviado" />)
    expect(screen.getByText('Extraviado')).toBeInTheDocument()
  })
  it('exposes the progress to assistive tech', () => {
    render(<ProgressBar value={72} />)
    const bar = screen.getByRole('progressbar', { name: 'Progresso da entrega' })
    expect(bar).toHaveAttribute('aria-valuenow', '72')
    expect(bar).toHaveAttribute('aria-valuemax', '100')
  })
})
```

`src/features/gallery/tables/TablesPage.test.tsx`:

```tsx
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { buildTablesData } from '@/data/mock/gallery/tables'
import { formatCurrency } from '@/shared/lib/formatters'
import { renderWithProviders } from '@/test/renderWithProviders'
import { TablesPage } from './TablesPage'

const url = '/gallery/tables?delay=0'
const { shipments } = buildTablesData()

describe('TablesPage', () => {
  beforeEach(() => window.history.replaceState({}, '', url))

  it('renders the four examples with their tables', async () => {
    renderWithProviders(<TablesPage />, { url })
    expect(screen.getByRole('heading', { level: 1, name: 'Tabelas (TanStack Table)' })).toBeInTheDocument()
    const titles = (await screen.findAllByRole('heading', { level: 2 })).map((h) => h.textContent)
    expect(titles).toEqual(['Ordenação', 'Busca e paginação', 'Seleção de linhas', 'Células ricas e linhas expansíveis'])
    const captions = screen.getAllByRole('table').map((t) => within(t).getByText(/./, { selector: 'caption' }).textContent)
    expect(captions).toEqual(['Envios recentes', 'Todos os envios', 'Envios para seleção', 'Envios com detalhe'])
  })

  it('searches and paginates the full list', async () => {
    renderWithProviders(<TablesPage />, { url })
    await userEvent.type(await screen.findByRole('searchbox', { name: 'Buscar' }), 'ENV-0007')
    expect(screen.getByText('1 registro')).toBeInTheDocument()
  })

  it('sums the amount of the selected rows', async () => {
    renderWithProviders(<TablesPage />, { url })
    await userEvent.click(await screen.findByRole('checkbox', { name: 'Selecionar linha 1' }))
    expect(screen.getByText(/Valor selecionado:/)).toHaveTextContent(formatCurrency(shipments[0]!.amount))
  })

  it('expands a row to show its events', async () => {
    renderWithProviders(<TablesPage />, { url })
    const [first] = await screen.findAllByRole('button', { name: 'Expandir detalhes' })
    await userEvent.click(first!)
    expect(screen.getByText('Objeto postado')).toBeInTheDocument()
  })

  it('shows an error alert when the repository fails', async () => {
    window.history.replaceState({}, '', '/gallery/tables?delay=0&error=1')
    renderWithProviders(<TablesPage />, { url: '/gallery/tables?delay=0&error=1' })
    expect(await screen.findByRole('alert')).toHaveTextContent('Falha simulada')
  })
})
```

Nota: se a estratégia de ler a legenda com `within(t).getByText(/./, { selector: 'caption' })` for trabalhosa, trocar por `screen.getAllByRole('table').map((t) => t.querySelector('caption')?.textContent)`. Se `Valor selecionado` e o valor estiverem em elementos separados, colocar a frase e o valor no mesmo `<p>` (é o que a implementação abaixo faz).

Run: `npx vitest run src/features/gallery/tables`
Expected: FAIL (módulos não existem).

- [ ] **Step 2: Implementar as células**

`src/features/gallery/tables/cells.tsx`:

```tsx
import type { ShipmentStatus } from '@/data/types/gallery'

const TONES: Record<ShipmentStatus, string> = {
  Entregue: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
  'Em trânsito': 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  Devolvido: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  Extraviado: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
}

export function StatusBadge({ status }: { status: ShipmentStatus }) {
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TONES[status]}`}>{status}</span>
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div
      role="progressbar"
      aria-label="Progresso da entrega"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      className="h-2 w-24 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
    >
      <div className="h-full bg-blue-500" style={{ width: `${value}%` }} />
    </div>
  )
}
```

- [ ] **Step 3: Implementar as colunas**

`src/features/gallery/tables/columns.tsx`:

```tsx
import type { Shipment } from '@/data/types/gallery'
import { formatCurrency } from '@/shared/lib/formatters'
import type { DataColumn } from '@/shared/ui/DataTable'
import { ProgressBar, StatusBadge } from './cells'

const ID: DataColumn<Shipment> = { id: 'id', header: 'Envio', cell: (s) => s.id, sortValue: (s) => s.id }
const RECIPIENT: DataColumn<Shipment> = { id: 'recipient', header: 'Destinatário', cell: (s) => s.recipient, sortValue: (s) => s.recipient }
const CITY: DataColumn<Shipment> = { id: 'city', header: 'Cidade', cell: (s) => s.city, sortValue: (s) => s.city }
const AMOUNT: DataColumn<Shipment> = {
  id: 'amount', header: 'Valor', cell: (s) => formatCurrency(s.amount), sortValue: (s) => s.amount, align: 'right',
}

// Constantes de módulo: o DataTable memoiza pelas colunas, então a identidade precisa ser estável.
export const BASIC_COLUMNS: DataColumn<Shipment>[] = [ID, RECIPIENT, CITY, AMOUNT]

export const RICH_COLUMNS: DataColumn<Shipment>[] = [
  ID,
  RECIPIENT,
  { id: 'status', header: 'Status', cell: (s) => <StatusBadge status={s.status} />, sortValue: (s) => s.status },
  { id: 'progress', header: 'Progresso', cell: (s) => <ProgressBar value={s.progress} />, sortValue: (s) => s.progress },
  AMOUNT,
]
```

O `react-refresh/only-export-components` só avisa em arquivos que exportam componentes junto de outras coisas; `columns.tsx` exporta apenas constantes, então não dispara. Se disparar, renomear para `columns.ts` e mover as células JSX para `cells.tsx` (já são componentes).

- [ ] **Step 4: Implementar a página**

`src/features/gallery/tables/TablesPage.tsx`:

```tsx
import { useState } from 'react'
import type { Shipment } from '@/data/types/gallery'
import { formatCurrency } from '@/shared/lib/formatters'
import { DataTable } from '@/shared/ui/DataTable'
import { QueryBoundary } from '@/shared/ui/QueryBoundary'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useTablesData } from '../api'
import { ExampleCard } from '../ExampleCard'
import { getLibrary } from '../libraries'
import { LibraryPage } from '../LibraryPage'
import { BASIC_COLUMNS, RICH_COLUMNS } from './columns'

const CARD = 'rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900'

function Examples({ shipments }: { shipments: Shipment[] }) {
  const [selected, setSelected] = useState<Shipment[]>([])
  const selectedAmount = selected.reduce((sum, s) => sum + s.amount, 0)
  return (
    <>
      <ExampleCard title="Ordenação" description="Clique no cabeçalho para ordenar por coluna.">
        <div className={CARD}>
          <DataTable caption="Envios recentes" columns={BASIC_COLUMNS} data={shipments.slice(0, 8)} />
        </div>
      </ExampleCard>
      <ExampleCard title="Busca e paginação" description="Filtro de texto e páginas para listas longas.">
        <div className={CARD}>
          <DataTable caption="Todos os envios" columns={BASIC_COLUMNS} data={shipments} searchable pageSize={10} />
        </div>
      </ExampleCard>
      <ExampleCard title="Seleção de linhas" description="Marque linhas para agir sobre um conjunto.">
        <div className={CARD}>
          <DataTable
            caption="Envios para seleção"
            columns={BASIC_COLUMNS}
            data={shipments.slice(0, 10)}
            selectable
            onSelectionChange={setSelected}
          />
          <p className="mt-2 text-sm">{`Valor selecionado: ${formatCurrency(selectedAmount)}`}</p>
        </div>
      </ExampleCard>
      <ExampleCard title="Células ricas e linhas expansíveis" description="Badges, barras de progresso e detalhe por linha.">
        <div className={CARD}>
          <DataTable
            caption="Envios com detalhe"
            columns={RICH_COLUMNS}
            data={shipments.slice(0, 8)}
            renderDetail={(s) => (
              <ul className="list-inside list-disc text-sm">
                {s.events.map((event) => (
                  <li key={event}>{event}</li>
                ))}
              </ul>
            )}
          />
        </div>
      </ExampleCard>
    </>
  )
}

export function TablesPage() {
  const query = useTablesData()
  return (
    <LibraryPage library={getLibrary('tables')}>
      <QueryBoundary query={query} skeleton={<Skeleton className="h-80 xl:col-span-2" />}>
        {({ shipments }) => <Examples shipments={shipments} />}
      </QueryBoundary>
    </LibraryPage>
  )
}
```

- [ ] **Step 5: Rota**

Acrescentar ao array `children` de `gallery` em `src/app/routes.tsx`:

```tsx
          {
            path: 'tables',
            lazy: async () => ({
              Component: (await import('@/features/gallery/tables/TablesPage')).TablesPage,
            }),
          },
```

- [ ] **Step 6: Rodar e verificar**

Run: `npx vitest run src/features/gallery/tables` e `npm run typecheck` e `npm run lint`
Expected: PASS, sem warnings. Se o lint acusar `react-hooks/incompatible-library` fora do `DataTable`, é sinal de que algum componente da página usa `useReactTable` diretamente (não deve).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add tables gallery page with four examples

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 14: Página `/gallery/flow` (4 exemplos) (TDD)

**Files:**
- Create: `src/features/gallery/flow/GraphDiagram.tsx`, `src/features/gallery/flow/FlowPage.tsx`
- Modify: `src/app/routes.tsx` (rota-filha `flow`)
- Test: `src/features/gallery/flow/FlowPage.test.tsx`

**Interfaces:**
- Consumes: `useFlowData()`, `Graph`, `GraphNode` (Task 7); `FlowDiagram`, `OrgChart` (Task 2, `@/shared/flow/*`); `FlowTheme` (`@/shared/flow/types`); `useAppTheme` (`@/app/layout/ThemeContext`); `LibraryPage`, `ExampleCard`, `getLibrary` (Task 8).
- Produces (`GraphDiagram.tsx`): `GraphDiagram({ graph, label, theme, interactive?, minimap? })`: React Flow com nó customizado `status` (borda e fundo por `ok`/`warning`/`error`, texto "Normal"/"Atenção"/"Crítico"; sem status fica neutro), `role="figure"` com `aria-label`, `Background` e `Controls`. Com `interactive` os nós podem ser arrastados e selecionados; com `minimap` mostra o `MiniMap`. Os nós vêm de `defaultNodes` (não controlado), então o arraste funciona sem estado no componente.
- Produces: `FlowPage()` com 4 `ExampleCard` (h2): "Fluxograma" (`FlowDiagram`), "Organograma" (`OrgChart`), "Pipeline com status" (`GraphDiagram` com `interactive` e `minimap`) e "Árvore de decisão" (`GraphDiagram` com rótulos "Sim" e "Não" nas arestas).

- [ ] **Step 1: Escrever os testes que falham**

`src/features/gallery/flow/FlowPage.test.tsx`:

```tsx
import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/renderWithProviders'
import { FlowPage } from './FlowPage'

const url = '/gallery/flow?delay=0'

describe('FlowPage', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', url)
    localStorage.clear()
  })

  it('renders the four examples as labelled figures', async () => {
    renderWithProviders(<FlowPage />, { url })
    expect(screen.getByRole('heading', { level: 1, name: 'Fluxos (React Flow)' })).toBeInTheDocument()
    const titles = (await screen.findAllByRole('heading', { level: 2 })).map((h) => h.textContent)
    expect(titles).toEqual(['Fluxograma', 'Organograma', 'Pipeline com status', 'Árvore de decisão'])
    expect(screen.getAllByRole('figure')).toHaveLength(4)
  })

  it('draws the nodes of each diagram', async () => {
    renderWithProviders(<FlowPage />, { url })
    expect(await screen.findByText('Pedido recebido')).toBeInTheDocument()
    expect(screen.getByText('Diretor de Logística')).toBeInTheDocument()
    expect(screen.getByText('Coleta')).toBeInTheDocument()
    expect(screen.getByText('Endereço válido?')).toBeInTheDocument()
  })

  it('states the status of every pipeline node in text, not only by colour', async () => {
    renderWithProviders(<FlowPage />, { url })
    await screen.findByText('Coleta')
    expect(screen.getAllByText(/^(Normal|Atenção|Crítico)$/)).toHaveLength(5)
  })

  it('shows an error alert when the repository fails', async () => {
    window.history.replaceState({}, '', '/gallery/flow?delay=0&error=1')
    renderWithProviders(<FlowPage />, { url: '/gallery/flow?delay=0&error=1' })
    expect(await screen.findByRole('alert')).toHaveTextContent('Falha simulada')
  })
})
```

Nota: as arestas (e seus rótulos "Sim" e "Não") dependem da medição dos handles, que o jsdom não faz; por isso os testes conferem só os nós, como o `WorkflowContent.test.tsx` do Plano 2. As arestas são verificadas no navegador (Task 15).

Run: `npx vitest run src/features/gallery/flow`
Expected: FAIL (módulos não existem).

- [ ] **Step 2: Implementar o `GraphDiagram`**

`src/features/gallery/flow/GraphDiagram.tsx`:

```tsx
import {
  Background, Controls, Handle, MarkerType, MiniMap, Position, ReactFlow,
  type Edge, type Node, type NodeProps,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useMemo } from 'react'
import type { Graph, GraphNode } from '@/data/types/gallery'
import type { FlowTheme } from '@/shared/flow/types'

type StatusNodeData = { label: string; status?: GraphNode['status'] }
type StatusFlowNode = Node<StatusNodeData, 'status'>

const TONES = {
  ok: 'border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-200',
  warning: 'border-amber-500 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-200',
  error: 'border-red-500 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-200',
  none: 'border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100',
} as const
const STATUS_TEXT = { ok: 'Normal', warning: 'Atenção', error: 'Crítico' } as const

function StatusNode({ data }: NodeProps<StatusFlowNode>) {
  return (
    <div className={`w-40 rounded-lg border-2 px-3 py-2 text-sm ${TONES[data.status ?? 'none']}`}>
      <Handle type="target" position={Position.Left} />
      <div className="font-medium">{data.label}</div>
      {data.status && <div className="text-xs opacity-80">{STATUS_TEXT[data.status]}</div>}
      <Handle type="source" position={Position.Right} />
    </div>
  )
}

// Fora do componente: o React Flow exige identidade estável para `nodeTypes`.
const NODE_TYPES = { status: StatusNode }

interface GraphDiagramProps {
  graph: Graph
  label: string
  theme: FlowTheme
  interactive?: boolean
  minimap?: boolean
}

export function GraphDiagram({ graph, label, theme, interactive = false, minimap = false }: GraphDiagramProps) {
  const nodes = useMemo<StatusFlowNode[]>(
    () =>
      graph.nodes.map((n) => ({
        id: n.id,
        type: 'status',
        position: { x: n.x, y: n.y },
        initialWidth: 160,
        initialHeight: 52,
        data: { label: n.label, status: n.status },
      })),
    [graph],
  )
  const edges = useMemo<Edge[]>(
    () =>
      graph.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed },
      })),
    [graph],
  )
  return (
    <div role="figure" aria-label={label} className="h-80 w-full rounded-lg border border-slate-200 dark:border-slate-700">
      <ReactFlow
        defaultNodes={nodes}
        defaultEdges={edges}
        nodeTypes={NODE_TYPES}
        fitView
        nodesDraggable={interactive}
        nodesConnectable={false}
        elementsSelectable={interactive}
        colorMode={theme}
      >
        <Background />
        <Controls showInteractive={false} />
        {minimap && <MiniMap pannable zoomable />}
      </ReactFlow>
    </div>
  )
}
```

Se o `nodeTypes` não passar no typecheck por causa do genérico de `NodeProps`, tipar `const NODE_TYPES: NodeTypes = { status: StatusNode }` (importando `type NodeTypes` de `@xyflow/react`) e, se ainda falhar, usar a forma que o `@xyflow/react` documenta para nós customizados na versão instalada.

- [ ] **Step 3: Implementar a página**

`src/features/gallery/flow/FlowPage.tsx`:

```tsx
import { useAppTheme } from '@/app/layout/ThemeContext'
import type { FlowData } from '@/data/types/gallery'
import { FlowDiagram } from '@/shared/flow/FlowDiagram'
import { OrgChart } from '@/shared/flow/OrgChart'
import { QueryBoundary } from '@/shared/ui/QueryBoundary'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useFlowData } from '../api'
import { ExampleCard } from '../ExampleCard'
import { getLibrary } from '../libraries'
import { LibraryPage } from '../LibraryPage'
import { GraphDiagram } from './GraphDiagram'

function Examples({ data }: { data: FlowData }) {
  const { theme } = useAppTheme()
  return (
    <>
      <ExampleCard title="Fluxograma" description="Etapas em sequência, da esquerda para a direita.">
        <FlowDiagram steps={data.steps} label="Fluxo de uma entrega" theme={theme} />
      </ExampleCard>
      <ExampleCard title="Organograma" description="Hierarquia em árvore, com cargos genéricos.">
        <OrgChart root={data.org} label="Organograma da logística" theme={theme} />
      </ExampleCard>
      <ExampleCard title="Pipeline com status" description="Nós arrastáveis, cor e texto por status e mapa de navegação.">
        <GraphDiagram graph={data.pipeline} label="Pipeline de entrega" theme={theme} interactive minimap />
      </ExampleCard>
      <ExampleCard title="Árvore de decisão" description="Ramificações com rótulos nas conexões.">
        <GraphDiagram graph={data.decision} label="Decisão de entrega" theme={theme} />
      </ExampleCard>
    </>
  )
}

export function FlowPage() {
  const query = useFlowData()
  return (
    <LibraryPage library={getLibrary('flow')}>
      <QueryBoundary query={query} skeleton={<Skeleton className="h-80 xl:col-span-2" />}>
        {(data) => <Examples data={data} />}
      </QueryBoundary>
    </LibraryPage>
  )
}
```

`data.org` (`GalleryOrgNode`) e `data.steps` são estruturalmente compatíveis com `OrgNodeInput` e `FlowStepInput`.

- [ ] **Step 4: Rota**

Acrescentar ao array `children` de `gallery` em `src/app/routes.tsx`:

```tsx
          {
            path: 'flow',
            lazy: async () => ({
              Component: (await import('@/features/gallery/flow/FlowPage')).FlowPage,
            }),
          },
```

- [ ] **Step 5: Rodar e verificar**

Run: `npx vitest run src/features/gallery/flow` e `npm run typecheck` e `npm run lint`
Expected: PASS, sem warnings de `act()` nem de React Flow no console.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add flow gallery page with four examples

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 15: Verificação final e documentação da Galeria

**Files:**
- Modify: `CLAUDE.md`

**Interfaces:** nenhuma; fecha o plano.

- [ ] **Step 1: Verificação completa**

Run: `npm test` (duas vezes seguidas), `npm run typecheck`, `npm run lint`, `npm run build`
Expected: tudo passa; suíte estável nas duas rodadas; lint com zero warnings; console de testes sem warnings de `act()`, dimensões do Recharts, Leaflet, ECharts ou React Flow.

- [ ] **Step 2: Conferir os chunks**

Run: `ls -l dist/assets/*.js`, `grep -l "echarts" dist/assets/*.js` e `grep -l "leaflet" dist/assets/*.js`
Expected: `index-*.js` não aparece em nenhuma das duas buscas; o ECharts aparece só no chunk da página `/gallery/echarts` (e, no máximo, em um chunk compartilhado do zrender); o Leaflet aparece só nos chunks das páginas com mapa (Financial, `/gallery/maps`). O `index-*.js` não pode ter crescido mais que ~5 kB em relação ao Plano 4 (a `DataTable` ficou maior e há rotas novas). Registrar todos os tamanhos no relatório.

- [ ] **Step 3: Conferir no navegador**

Run: `npm run dev` e abrir `http://localhost:5173/gallery?delay=0`. Conferir, nos temas claro e escuro e com a janela em 375 px de largura:
- `/gallery`: 5 cards com os links certos e a nota sobre filtros globais.
- `/gallery/recharts`: 6 exemplos, legendas legíveis nos dois temas, tooltips.
- `/gallery/echarts`: 5 exemplos; alternar o tema recolore texto e tooltip; redimensionar a janela redimensiona os gráficos; a aba Rede do navegador só baixa o chunk do ECharts ao abrir esta rota.
- `/gallery/maps`: 4 mapas com tiles, rotas e círculos de cobertura; a lista de texto abaixo de cada mapa bate com o desenho.
- `/gallery/tables`: ordenar, buscar `ENV-0007`, paginar, selecionar linhas (o valor selecionado muda), expandir linhas.
- `/gallery/flow`: os 4 diagramas, incluindo as arestas e os rótulos "Sim" e "Não" da árvore de decisão (o jsdom não as verifica); arrastar um nó do pipeline; o mapa de navegação.
- `?error=1` em qualquer rota da Galeria mostra o alerta com "Tentar novamente".
Se algum exemplo de ECharts ficar sem contraste no tema escuro, ajustar a `chartPalette('dark')` e o teste da paleta.

- [ ] **Step 4: Atualizar o `CLAUDE.md`**

Na seção "Stack", acrescentar `Apache ECharts (SVG, registro manual em src/shared/echarts/core.ts; só carrega na rota /gallery/echarts)`. Em "Arquitetura", acrescentar `src/features/gallery`: uma página por biblioteca sobre dados de `data/mock/gallery` (sem filtros globais). Em "Estado", mover o Plano 5 para "Prontos" e remover a pendência "o mock global de `recharts` vale revisar antes da Galeria" (foi tratada no Task 1 e documentada na seção de convenções).

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "docs: record the gallery and ECharts in CLAUDE.md

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Self-Review

- **Cobertura da spec e do pedido:** índice `/gallery` em cards e as 5 rotas `/gallery/recharts|echarts|maps|tables|flow` (Tasks 8, 9, 11 a 14); 4 a 6 exemplos por rota (6, 5, 4, 4, 4) e nota "Quando usar" por biblioteca (`libraries.ts`, exibida pelo `LibraryPage`); dados mock com o mesmo padrão dos outros planos, incluindo `?delay` e `?error` (Task 7); ECharts com heatmap, funil, gauge, treemap e sankey, em chunk lazy (Tasks 3, 10, 11, 15); reaproveitamento de Recharts, `RegionMap`, `DataTable` e React Flow (Tasks 2, 5, 9, 12 a 14); revisão do mock global de `recharts` antes da Galeria (Task 1).
- **Placeholders:** nenhum. Os pontos condicionais (versão do ECharts, `vi.unmock`, nomes de ícones do `lucide-react`, tipagem de `nodeTypes`, opções de série do ECharts que variam por versão, ECharts real no jsdom) trazem a ação corretiva concreta.
- **Consistência de tipos:** `GroupedSeries` e `GroupedDatum` (Recharts) são reaproveitados por `AreaChartCard`, `ComposedChartCard`, `RadarChartCard` e por `withColors`; `SeriesRow` é estruturalmente igual a `GroupedDatum`; `GeoPoint` a `MapPoint`; `FlowData.steps` e `GalleryOrgNode` a `FlowStepInput` e `OrgNodeInput`; `EChartPalette`, `themeBase`, `tooltipStyle` e `EChartsOption` têm a mesma forma nas Tasks 3, 10 e 11; os nomes de hooks (`useRechartsData` etc.) e de legendas de tabela batem entre código e testes.
- **Riscos conhecidos:** a versão instalada do ECharts pode ter API diferente (a Task 3 manda conferir e fixar o major); ECharts real no jsdom é incerto, por isso os testes de página mockam `EChart` e a Task 15 confere no navegador; arestas do React Flow só são verificáveis no navegador; a `DataTable` estendida é usada por Financial e Inventory, e a Task 5 exige que os testes dessas páginas continuem verdes; os tiles do mapa continuam claros no tema escuro (pendência já registrada no `CLAUDE.md`).
