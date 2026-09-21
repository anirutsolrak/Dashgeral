# Plano 4: Logística Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar a página Logística (legado: `legacy/src/pages/Logistics.jsx`, rota `/logistics`, hoje um `ComingSoon`) para a arquitetura nova, com dados mock tipados, filtros próprios (tipo de logística e etapa), KPIs, gráficos (Recharts) e tabela (TanStack Table).

**Architecture:** Mesmo padrão dos Planos 2 e 3: repositório mock (`logistics`) com geradores de PRNG de seed fixa, hooks via `useDomainQuery`, seções pequenas na página e detalhamento em `Modal`. Os filtros `logisticsType` e `logisticsStep` já existem no schema de filtros globais (Plano 1); este plano os aplica de verdade nos geradores e cria a UI que só aparece nesta rota. Nenhum componente compartilhado novo: reaproveita `KPICard`, `Modal`, `DataTable`, `PieChartCard`, `LineChartCard`, `GroupedBarChartCard`, `BarChartCard`, `SummaryStat`, `QueryBoundary`.

**Tech Stack:** Recharts (existente), @tanstack/react-table (existente), TanStack Query, Zod (existente), Vitest, Testing Library, Tailwind 4, lucide-react.

**Spec:** `docs/superpowers/specs/2026-09-21-dashboard-showcase-template-design.md`

**Depende de:** Planos 1, 2 e 3 (branch `modernize/template`). Antes do Task 1, `npm test`, `npm run typecheck`, `npm run lint` e `npm run build` devem estar verdes. Este worktree (`claude/plano-4-logistica-dashgeral-303f8c`) nasce de `main`; para executar o plano, basear a branch de implementação em `modernize/template`.

## Global Constraints

- TypeScript `strict: true`, sem `any` explícito.
- Datas, números e percentuais em pt-BR via `@/shared/lib/formatters` (`formatNumber`, `formatPercentage`).
- Dados mock determinísticos (seed fixa); nenhum acesso a rede, banco ou Supabase.
- Ícones com `lucide-react`; sem Font Awesome.
- Alias de import `@/` aponta para `src/`.
- Nenhum nome real ou marca do legado (usar "Flash" e "Terceiros" como tipos genéricos, como no legado).
- Saída de testes limpa (sem warnings de `act()` nem de dimensões do Recharts); o mock global de `recharts` em `src/test/setup.ts` continua.
- Modo escuro: componentes novos usam variantes `dark:` ou as variáveis `--chart-*` já existentes.
- `shared` não importa de `@/app`, `@/data` nem de `features`.
- Filtros específicos da logística só aparecem na rota `/logistics` (spec, seção "Filtros globais"); os globais (período, região) continuam na barra do layout.
- Nenhum arquivo com mais de ~150 linhas escrito numa única chamada.
- Commits com o trailer `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`.
- Decisão de escopo: o legado rotulava os KPIs de forma inconsistente com os dados (usava campos de outros domínios). Este plano modela a logística de forma coerente: objetos (cartões, envelopes e cartas) agrupados por status de entrega. Sem visões de workflow (já demonstradas no Plano 2).

## Mapa de arquivos

```
src/data/types/logistics.ts                 (Task 1)
src/data/mock/logistics-catalog.ts          (Task 1)
src/data/mock/logistics.ts                  (Task 2)
src/data/repositories/logistics.ts          (Task 3)
src/data/repositories/mock/logistics.ts     (Task 3)
src/data/repositories/index.ts              modify (Task 3)
src/features/logistics/api.ts, kpis.ts      (Task 3)
src/features/logistics/LogisticsFilters.tsx (Task 4)
src/features/logistics/LogisticsKpis.tsx    (Task 5)
src/features/logistics/LogisticsCharts.tsx, LogisticsTable.tsx  (Task 6)
src/features/logistics/LogisticsDetails.tsx (Task 7)
src/features/logistics/LogisticsPage.tsx    (Task 8)
src/app/routes.tsx                          modify (Task 8)
```

---

### Task 1: Tipos e catálogo de logística (TDD)

**Files:**
- Create: `src/data/types/logistics.ts`, `src/data/mock/logistics-catalog.ts`
- Test: `src/data/mock/logistics-catalog.test.ts`

**Interfaces:**
- Produces (`src/data/types/logistics.ts`):
  - `LogisticsGroupKey = 'entregue' | 'pendente' | 'custodia' | 'devolvido' | 'reenviado' | 'sinistrado'`
  - `CatalogStep { id: string; label: string }`
  - `CatalogGroup { key: LogisticsGroupKey; label: string; steps: CatalogStep[] }`
  - `LogisticsTypeOption { id: string; label: string }`
  - `LogisticsCatalog { types: LogisticsTypeOption[]; groups: CatalogGroup[] }`
  - `StepCount { id: string; label: string; count: number }`
  - `GroupStat { key: LogisticsGroupKey; label: string; count: number; percent: number; steps: StepCount[] }`
  - `LogisticsOverview { total: number; groups: GroupStat[] }`
  - `TypeComparisonRow { key: LogisticsGroupKey; label: string; flash: number; terceiros: number }`
- Produces (`src/data/mock/logistics-catalog.ts`): `LOGISTICS_CATALOG: LogisticsCatalog`

- [ ] **Step 1: Escrever o teste que falha**

`src/data/mock/logistics-catalog.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { LOGISTICS_CATALOG } from './logistics-catalog'

describe('LOGISTICS_CATALOG', () => {
  it('has the six status groups in display order', () => {
    expect(LOGISTICS_CATALOG.groups.map((g) => g.key)).toEqual([
      'entregue', 'pendente', 'custodia', 'devolvido', 'reenviado', 'sinistrado',
    ])
    expect(LOGISTICS_CATALOG.groups.every((g) => g.steps.length > 0)).toBe(true)
  })
  it('has globally unique step ids', () => {
    const ids = LOGISTICS_CATALOG.groups.flatMap((g) => g.steps.map((s) => s.id))
    expect(new Set(ids).size).toBe(ids.length)
  })
  it('offers the two logistics types', () => {
    expect(LOGISTICS_CATALOG.types).toEqual([
      { id: 'flash', label: 'Flash' },
      { id: 'terceiros', label: 'Terceiros' },
    ])
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/data/mock/logistics-catalog.test.ts`
Expected: FAIL (módulo `./logistics-catalog` não existe).

- [ ] **Step 3: Criar os tipos**

`src/data/types/logistics.ts`:

```ts
export type LogisticsGroupKey =
  | 'entregue'
  | 'pendente'
  | 'custodia'
  | 'devolvido'
  | 'reenviado'
  | 'sinistrado'

export interface CatalogStep {
  id: string
  label: string
}
export interface CatalogGroup {
  key: LogisticsGroupKey
  label: string
  steps: CatalogStep[]
}
export interface LogisticsTypeOption {
  id: string
  label: string
}
export interface LogisticsCatalog {
  types: LogisticsTypeOption[]
  groups: CatalogGroup[]
}

export interface StepCount {
  id: string
  label: string
  count: number
}
export interface GroupStat {
  key: LogisticsGroupKey
  label: string
  count: number
  percent: number
  steps: StepCount[]
}
export interface LogisticsOverview {
  total: number
  groups: GroupStat[]
}
export interface TypeComparisonRow {
  key: LogisticsGroupKey
  label: string
  flash: number
  terceiros: number
}
```

- [ ] **Step 4: Criar o catálogo**

`src/data/mock/logistics-catalog.ts`:

```ts
import type { LogisticsCatalog } from '@/data/types/logistics'

export const LOGISTICS_CATALOG: LogisticsCatalog = {
  types: [
    { id: 'flash', label: 'Flash' },
    { id: 'terceiros', label: 'Terceiros' },
  ],
  groups: [
    {
      key: 'entregue',
      label: 'Entregue',
      steps: [
        { id: 'entregue-ciclo-encerrado', label: 'Ciclo operacional encerrado' },
        { id: 'entregue-comprovante', label: 'Comprovante registrado' },
        { id: 'entregue-terceiro', label: 'Entregue pelo terceiro' },
        { id: 'entregue-via-rt', label: 'Entrega registrada via RT' },
        { id: 'entregue-pod-fragmentado', label: 'POD fragmentado' },
      ],
    },
    {
      key: 'pendente',
      label: 'Em trânsito',
      steps: [
        { id: 'pendente-em-rota', label: 'Entrega em andamento (na rua)' },
        { id: 'pendente-postado', label: 'Postado, logística iniciada' },
        { id: 'pendente-transferencia', label: 'Preparada para transferência' },
        { id: 'pendente-nova-tentativa', label: 'Programado nova tentativa' },
        { id: 'pendente-nao-efetuada', label: 'Entrega não efetuada' },
        { id: 'pendente-rastreamento', label: 'Não recebido, em rastreamento' },
        { id: 'pendente-aguardando-retirada', label: 'Aguardando retirada' },
        { id: 'pendente-retido-devolucao', label: 'Retido para devolução' },
      ],
    },
    {
      key: 'custodia',
      label: 'Custódia',
      steps: [
        { id: 'custodia-telemarketing', label: 'Aguardando telemarketing' },
        { id: 'custodia-devolucao-habilitada', label: 'Devolução habilitada' },
        { id: 'custodia-habilitado-reenvio', label: 'Habilitado para reenvio' },
        { id: 'custodia-objeto-retirado', label: 'Objeto retirado da custódia' },
        { id: 'custodia-devolvido', label: 'Devolvido' },
      ],
    },
    {
      key: 'devolvido',
      label: 'Em devolução',
      steps: [
        { id: 'devolvido-ciclo-encerrado', label: 'Ciclo operacional encerrado' },
        { id: 'devolvido-comprovante', label: 'Comprovante registrado' },
        { id: 'devolvido-protocolada-cliente', label: 'Devolução protocolada ao cliente' },
        { id: 'devolvido-conciliada', label: 'Devolução conciliada' },
        { id: 'devolvido-recebida-avulsa', label: 'Devolução recebida avulsa' },
        { id: 'devolvido-procedimento-retorno', label: 'Em procedimento de retorno' },
        { id: 'devolvido-via-terceiro', label: 'Devolvendo via terceiro' },
      ],
    },
    {
      key: 'reenviado',
      label: 'Reenviado',
      steps: [
        { id: 'reenviado-ciclo-encerrado', label: 'Ciclo operacional encerrado' },
        { id: 'reenviado-habilitado', label: 'Habilitado para reenvio' },
      ],
    },
    {
      key: 'sinistrado',
      label: 'Sinistrado',
      steps: [
        { id: 'sinistrado-ciclo-encerrado', label: 'Ciclo operacional encerrado' },
        { id: 'sinistrado-terceiro', label: 'Sinistrado pelo terceiro' },
      ],
    },
  ],
}
```

(Escrever este arquivo em duas chamadas se passar de ~150 linhas: primeiro `types` + `entregue` + `pendente`, depois o restante.)

- [ ] **Step 5: Rodar e ver passar**

Run: `npx vitest run src/data/mock/logistics-catalog.test.ts`
Expected: PASS (3 testes).

- [ ] **Step 6: Commit**

```bash
git add src/data/types/logistics.ts src/data/mock/logistics-catalog.ts src/data/mock/logistics-catalog.test.ts
git commit -m "feat: add logistics types and status catalog

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 2: Geradores mock de logística (TDD)

**Files:**
- Create: `src/data/mock/logistics.ts`
- Test: `src/data/mock/logistics.test.ts`

**Interfaces:**
- Consumes: `LOGISTICS_CATALOG` (Task 1); `createRng` (`./random`); `pct`, `seedFor`, `volumeFactor` (`./scale`); `periodLabels` (`./trend`); `TrendPoint` (`@/data/types/card-processing`).
- Produces:
  - `buildLogistics(f: GlobalFilters): LogisticsOverview` (sempre 6 grupos, na ordem do catálogo; `logisticsType` escala o volume; `logisticsStep` válido zera todas as outras etapas; id desconhecido é ignorado)
  - `buildLogisticsTrend(f: GlobalFilters): TrendPoint[]` (pendências, isto é, `total - entregues`, distribuídas pelos rótulos do período)
  - `buildTypeComparison(f: GlobalFilters): TypeComparisonRow[]` (Flash vs. Terceiros por grupo, mantendo os demais filtros)

- [ ] **Step 1: Escrever os testes que falham**

`src/data/mock/logistics.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { DEFAULT_FILTERS } from '@/data/types/filters'
import { buildLogistics, buildLogisticsTrend, buildTypeComparison } from './logistics'

describe('buildLogistics', () => {
  const overview = buildLogistics(DEFAULT_FILTERS)

  it('is consistent: steps sum to groups, groups sum to total, percents sum to 100', () => {
    expect(overview.groups.map((g) => g.key)).toEqual([
      'entregue', 'pendente', 'custodia', 'devolvido', 'reenviado', 'sinistrado',
    ])
    for (const group of overview.groups) {
      expect(group.count).toBe(group.steps.reduce((s, x) => s + x.count, 0))
    }
    expect(overview.total).toBe(overview.groups.reduce((s, g) => s + g.count, 0))
    const percentSum = overview.groups.reduce((s, g) => s + g.percent, 0)
    expect(percentSum).toBeCloseTo(100, 5)
    expect(overview.groups[0]!.count).toBeGreaterThan(overview.groups[1]!.count)
  })

  it('is deterministic and shrinks with the period', () => {
    expect(buildLogistics(DEFAULT_FILTERS)).toEqual(overview)
    expect(buildLogistics({ ...DEFAULT_FILTERS, period: '7d' }).total).toBeLessThan(overview.total)
  })

  it('scales with the logistics type', () => {
    const flash = buildLogistics({ ...DEFAULT_FILTERS, logisticsType: 'flash' }).total
    const third = buildLogistics({ ...DEFAULT_FILTERS, logisticsType: 'terceiros' }).total
    expect(flash).toBeLessThan(overview.total)
    expect(third).toBeLessThan(flash)
    expect(buildLogistics({ ...DEFAULT_FILTERS, logisticsType: 'inexistente' })).toEqual(overview)
  })

  it('keeps only the selected step and ignores unknown steps', () => {
    const one = buildLogistics({ ...DEFAULT_FILTERS, logisticsStep: 'custodia-devolvido' })
    const custody = one.groups.find((g) => g.key === 'custodia')!
    expect(one.total).toBeGreaterThan(0)
    expect(one.total).toBe(custody.count)
    expect(one.groups.filter((g) => g.count > 0).map((g) => g.key)).toEqual(['custodia'])
    expect(buildLogistics({ ...DEFAULT_FILTERS, logisticsStep: 'xyz' })).toEqual(overview)
  })

  it('never yields negative counts or NaN percents on tiny volumes', () => {
    const tiny = buildLogistics({ ...DEFAULT_FILTERS, period: '7d', region: 'centro-oeste', logisticsType: 'terceiros' })
    for (const group of tiny.groups) {
      expect(group.count).toBeGreaterThanOrEqual(0)
      expect(Number.isFinite(group.percent)).toBe(true)
    }
  })
})

describe('buildLogisticsTrend', () => {
  it('has one non-negative integer per period label', () => {
    const points = buildLogisticsTrend(DEFAULT_FILTERS)
    expect(points).toHaveLength(12)
    expect(points.every((p) => Number.isInteger(p.value) && p.value >= 0)).toBe(true)
    expect(buildLogisticsTrend({ ...DEFAULT_FILTERS, period: '30d' })).toHaveLength(4)
  })
})

describe('buildTypeComparison', () => {
  it('has one row per group with Flash at least as large as Terceiros', () => {
    const rows = buildTypeComparison(DEFAULT_FILTERS)
    expect(rows).toHaveLength(6)
    expect(rows[0]).toMatchObject({ key: 'entregue', label: 'Entregue' })
    for (const row of rows) expect(row.flash).toBeGreaterThanOrEqual(row.terceiros)
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/data/mock/logistics.test.ts`
Expected: FAIL (módulo `./logistics` não existe).

- [ ] **Step 3: Implementar**

`src/data/mock/logistics.ts`:

```ts
import type { TrendPoint } from '@/data/types/card-processing'
import type { GlobalFilters } from '@/data/types/filters'
import type {
  GroupStat,
  LogisticsGroupKey,
  LogisticsOverview,
  StepCount,
  TypeComparisonRow,
} from '@/data/types/logistics'
import { LOGISTICS_CATALOG } from './logistics-catalog'
import { createRng } from './random'
import { pct, seedFor, volumeFactor } from './scale'
import { periodLabels } from './trend'

const GROUP_BASE: Record<LogisticsGroupKey, number> = {
  entregue: 6200,
  pendente: 2100,
  custodia: 640,
  devolvido: 480,
  reenviado: 220,
  sinistrado: 90,
}
const TYPE_FACTOR: Record<string, number> = { all: 1, flash: 0.6, terceiros: 0.4 }

export function buildLogistics(f: GlobalFilters): LogisticsOverview {
  // A seed ignora tipo e etapa: eles só escalam ou recortam os mesmos números.
  const rng = createRng(seedFor(f, 'logistics'))
  const factor = volumeFactor(f) * (TYPE_FACTOR[f.logisticsType] ?? 1)
  const knownStep = LOGISTICS_CATALOG.groups.some((g) => g.steps.some((s) => s.id === f.logisticsStep))

  const counted = LOGISTICS_CATALOG.groups.map((group) => {
    const perStep = GROUP_BASE[group.key] / group.steps.length
    const steps: StepCount[] = group.steps.map((step) => {
      const raw = Math.round(perStep * (0.5 + rng.next()) * factor)
      const count = knownStep && step.id !== f.logisticsStep ? 0 : raw
      return { id: step.id, label: step.label, count }
    })
    return { group, steps, count: steps.reduce((sum, s) => sum + s.count, 0) }
  })
  const total = counted.reduce((sum, g) => sum + g.count, 0)
  const groups: GroupStat[] = counted.map(({ group, steps, count }) => ({
    key: group.key,
    label: group.label,
    count,
    percent: pct(count, total),
    steps,
  }))
  return { total, groups }
}

export function buildLogisticsTrend(f: GlobalFilters): TrendPoint[] {
  const rng = createRng(seedFor(f, 'logistics-trend'))
  const labels = periodLabels(f)
  const { total, groups } = buildLogistics(f)
  const delivered = groups.find((g) => g.key === 'entregue')?.count ?? 0
  const perPoint = (total - delivered) / labels.length
  return labels.map((label) => ({ label, value: Math.round(perPoint * (0.7 + rng.next() * 0.6)) }))
}

export function buildTypeComparison(f: GlobalFilters): TypeComparisonRow[] {
  const flash = buildLogistics({ ...f, logisticsType: 'flash' })
  const third = buildLogistics({ ...f, logisticsType: 'terceiros' })
  return flash.groups.map((group, i) => ({
    key: group.key,
    label: group.label,
    flash: group.count,
    terceiros: third.groups[i]?.count ?? 0,
  }))
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/data/mock/logistics.test.ts`
Expected: PASS (7 testes).

- [ ] **Step 5: Commit**

```bash
git add src/data/mock/logistics.ts src/data/mock/logistics.test.ts
git commit -m "feat: add logistics mock generators honoring type and step filters

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 3: Repositório, hooks e metadados dos KPIs (TDD)

**Files:**
- Create: `src/data/repositories/logistics.ts`, `src/data/repositories/mock/logistics.ts`, `src/features/logistics/api.ts`, `src/features/logistics/kpis.ts`
- Modify: `src/data/repositories/index.ts`
- Test: `src/data/repositories/mock/logistics.test.ts`

**Interfaces:**
- Consumes: `buildLogistics`, `buildLogisticsTrend`, `buildTypeComparison` (Task 2); `LOGISTICS_CATALOG` (Task 1); `simulate` (`@/data/mock/simulate`); `useDomainQuery` (`@/app/data/useDomainQuery`); `useDevFlags` (mesmo módulo).
- Produces:
  - `LogisticsRepository { getOverview(f): Promise<LogisticsOverview>; getTrend(f): Promise<TrendPoint[]>; getTypeComparison(f): Promise<TypeComparisonRow[]>; getCatalog(): Promise<LogisticsCatalog> }`
  - `mockLogisticsRepository: LogisticsRepository`; `repositories.logistics`
  - Hooks: `useLogistics()`, `useLogisticsTrend()`, `useTypeComparison()`, `useLogisticsCatalog()`
  - `LogisticsKpi = 'entregue' | 'pendente' | 'custodia' | 'devolvido'` e `LOG_KPI_META: Record<LogisticsKpi, { title: string; detailsTitle: string }>`

- [ ] **Step 1: Escrever o teste que falha**

`src/data/repositories/mock/logistics.test.ts`:

```ts
import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_FILTERS } from '@/data/types/filters'
import { mockLogisticsRepository as repo } from './logistics'

describe('mockLogisticsRepository', () => {
  beforeEach(() => window.history.replaceState({}, '', '/?delay=0'))

  it('serves overview, trend, type comparison and catalog', async () => {
    expect((await repo.getOverview(DEFAULT_FILTERS)).groups).toHaveLength(6)
    expect(await repo.getTrend(DEFAULT_FILTERS)).toHaveLength(12)
    expect(await repo.getTypeComparison(DEFAULT_FILTERS)).toHaveLength(6)
    expect((await repo.getCatalog()).types).toHaveLength(2)
  })

  it('fails on demand with ?error=1', async () => {
    window.history.replaceState({}, '', '/?delay=0&error=1')
    await expect(repo.getOverview(DEFAULT_FILTERS)).rejects.toThrow('Falha simulada')
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/data/repositories/mock/logistics.test.ts`
Expected: FAIL (módulo `./logistics` não existe).

- [ ] **Step 3: Criar interface e implementação mock**

`src/data/repositories/logistics.ts`:

```ts
import type { TrendPoint } from '@/data/types/card-processing'
import type { GlobalFilters } from '@/data/types/filters'
import type { LogisticsCatalog, LogisticsOverview, TypeComparisonRow } from '@/data/types/logistics'

export interface LogisticsRepository {
  getOverview(filters: GlobalFilters): Promise<LogisticsOverview>
  getTrend(filters: GlobalFilters): Promise<TrendPoint[]>
  getTypeComparison(filters: GlobalFilters): Promise<TypeComparisonRow[]>
  getCatalog(): Promise<LogisticsCatalog>
}
```

`src/data/repositories/mock/logistics.ts`:

```ts
import { buildLogistics, buildLogisticsTrend, buildTypeComparison } from '@/data/mock/logistics'
import { LOGISTICS_CATALOG } from '@/data/mock/logistics-catalog'
import { simulate } from '@/data/mock/simulate'
import type { LogisticsRepository } from '@/data/repositories/logistics'

export const mockLogisticsRepository: LogisticsRepository = {
  getOverview: (filters) => simulate(() => buildLogistics(filters)),
  getTrend: (filters) => simulate(() => buildLogisticsTrend(filters)),
  getTypeComparison: (filters) => simulate(() => buildTypeComparison(filters)),
  getCatalog: () => simulate(() => LOGISTICS_CATALOG),
}
```

- [ ] **Step 4: Registrar no ponto único de troca**

Em `src/data/repositories/index.ts`, acrescentar os imports (mantendo a ordem alfabética existente):

```ts
import type { LogisticsRepository } from './logistics'
import { mockLogisticsRepository } from './mock/logistics'
```

adicionar `logistics: LogisticsRepository` à interface `Repositories` e `logistics: mockLogisticsRepository` ao objeto `repositories`.

- [ ] **Step 5: Criar hooks e metadados**

`src/features/logistics/api.ts`:

```ts
import { useQuery } from '@tanstack/react-query'
import { useDevFlags, useDomainQuery } from '@/app/data/useDomainQuery'
import { repositories } from '@/data/repositories'

const repo = repositories.logistics

export const useLogistics = () => useDomainQuery('logistics', 'overview', (f) => repo.getOverview(f))
export const useLogisticsTrend = () => useDomainQuery('logistics', 'trend', (f) => repo.getTrend(f))
export const useTypeComparison = () => useDomainQuery('logistics', 'by-type', (f) => repo.getTypeComparison(f))

export function useLogisticsCatalog() {
  const devFlags = useDevFlags()
  return useQuery({
    queryKey: ['logistics', 'catalog', devFlags],
    queryFn: () => repo.getCatalog(),
    staleTime: Infinity,
  })
}
```

`src/features/logistics/kpis.ts`:

```ts
export type LogisticsKpi = 'entregue' | 'pendente' | 'custodia' | 'devolvido'

export const LOG_KPI_META: Record<LogisticsKpi, { title: string; detailsTitle: string }> = {
  entregue: { title: 'Entregues', detailsTitle: 'Entregues - Detalhamento' },
  pendente: { title: 'Em Trânsito', detailsTitle: 'Em Trânsito - Detalhamento' },
  custodia: { title: 'Custódia', detailsTitle: 'Custódia - Detalhamento' },
  devolvido: { title: 'Em Processo de Devolução', detailsTitle: 'Em Processo de Devolução - Detalhamento' },
}
```

- [ ] **Step 6: Rodar testes e typecheck**

Run: `npx vitest run src/data/repositories/mock/logistics.test.ts` e `npm run typecheck`
Expected: PASS e typecheck sem erros.

- [ ] **Step 7: Commit**

```bash
git add src/data/repositories src/features/logistics
git commit -m "feat: add logistics repository, query hooks and KPI metadata

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 4: Filtros de logística na página (TDD)

**Files:**
- Create: `src/features/logistics/LogisticsFilters.tsx`
- Test: `src/features/logistics/LogisticsFilters.test.tsx`

**Interfaces:**
- Consumes: `useLogisticsCatalog()` (Task 3); `useGlobalFilters()` (`@/app/filters/useGlobalFilters`).
- Produces: `LogisticsFilters(): JSX.Element` com dois `<select>` rotulados "Tipo" (`Todos`, `Flash`, `Terceiros`) e "Etapa" (`Todas` + um `<optgroup>` por grupo do catálogo). Escreve `logisticsType` e `logisticsStep` nos search params. Em erro do catálogo mostra `role="status"` com "Filtros de logística indisponíveis".

- [ ] **Step 1: Escrever os testes que falham**

`src/features/logistics/LogisticsFilters.test.tsx`:

```tsx
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/renderWithProviders'
import { LogisticsFilters } from './LogisticsFilters'

const url = '/?delay=0'

describe('LogisticsFilters', () => {
  beforeEach(() => window.history.replaceState({}, '', url))

  it('lists the types and the steps grouped by status', async () => {
    renderWithProviders(<LogisticsFilters />, { url })
    expect(await screen.findByRole('option', { name: 'Flash' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Terceiros' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Custódia' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Sinistrado pelo terceiro' })).toBeInTheDocument()
  })

  it('reflects the selection made by the user', async () => {
    renderWithProviders(<LogisticsFilters />, { url })
    const type = await screen.findByLabelText('Tipo')
    await userEvent.selectOptions(type, 'flash')
    expect(type).toHaveValue('flash')
    const step = screen.getByLabelText('Etapa')
    await userEvent.selectOptions(step, 'custodia-devolvido')
    expect(step).toHaveValue('custodia-devolvido')
  })

  it('reads the initial selection from the URL', async () => {
    renderWithProviders(<LogisticsFilters />, { url: '/?delay=0&logisticsType=terceiros' })
    expect(await screen.findByLabelText('Tipo')).toHaveValue('terceiros')
  })

  it('shows a message when the catalog fails', async () => {
    renderWithProviders(<LogisticsFilters />, { url: '/?delay=0&error=1' })
    expect(await screen.findByRole('status')).toHaveTextContent('Filtros de logística indisponíveis')
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/features/logistics/LogisticsFilters.test.tsx`
Expected: FAIL (módulo `./LogisticsFilters` não existe).

- [ ] **Step 3: Implementar**

`src/features/logistics/LogisticsFilters.tsx`:

```tsx
import { useGlobalFilters } from '@/app/filters/useGlobalFilters'
import { useLogisticsCatalog } from './api'

const selectClass =
  'rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900'

export function LogisticsFilters() {
  const { filters, setFilters } = useGlobalFilters()
  const catalog = useLogisticsCatalog()

  if (catalog.isError) {
    return <p role="status" className="text-sm text-slate-500">Filtros de logística indisponíveis</p>
  }

  const types = catalog.data?.types ?? []
  const groups = catalog.data?.groups ?? []

  return (
    <div className="flex flex-wrap gap-4">
      <label className="flex items-center gap-2 text-sm">
        Tipo
        <select
          className={selectClass}
          disabled={catalog.isPending}
          value={filters.logisticsType}
          onChange={(e) => setFilters({ logisticsType: e.target.value })}
        >
          <option value="all">Todos</option>
          {types.map((t) => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm">
        Etapa
        <select
          className={selectClass}
          disabled={catalog.isPending}
          value={filters.logisticsStep}
          onChange={(e) => setFilters({ logisticsStep: e.target.value })}
        >
          <option value="all">Todas</option>
          {groups.map((g) => (
            <optgroup key={g.key} label={g.label}>
              {g.steps.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>
    </div>
  )
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/features/logistics/LogisticsFilters.test.tsx`
Expected: PASS (4 testes). Se `getByRole('group', { name: 'Custódia' })` falhar por a implementação do jsdom não expor o `optgroup` como grupo, trocar essa asserção por `expect(screen.getByRole('option', { name: 'Aguardando telemarketing' })).toBeInTheDocument()` (opção única de Custódia).

- [ ] **Step 5: Commit**

```bash
git add src/features/logistics/LogisticsFilters.tsx src/features/logistics/LogisticsFilters.test.tsx
git commit -m "feat: add logistics type and step filters

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 5: KPIs da página de logística (TDD)

**Files:**
- Create: `src/features/logistics/LogisticsKpis.tsx`
- Test: `src/features/logistics/LogisticsKpis.test.tsx`

**Interfaces:**
- Consumes: `useLogistics()`, `LOG_KPI_META`, `LogisticsKpi` (Task 3); `buildLogistics` (Task 2, só nos testes); `KPICard`, `KPIAccent` (`@/shared/ui/KPICard`); `QueryBoundary`, `Skeleton`; `formatNumber`, `formatPercentage`.
- Produces: `LogisticsKpis({ onSelect }: { onSelect: (kpi: LogisticsKpi) => void })`: quatro `KPICard` (`article`) na ordem Entregues, Em Trânsito, Custódia, Em Processo de Devolução; valor = percentual do grupo com 1 casa (`formatPercentage(percent, 1)`), dica = `"<N> objetos"`.

- [ ] **Step 1: Escrever os testes que falham**

`src/features/logistics/LogisticsKpis.test.tsx`:

```tsx
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildLogistics } from '@/data/mock/logistics'
import { DEFAULT_FILTERS } from '@/data/types/filters'
import { formatNumber, formatPercentage } from '@/shared/lib/formatters'
import { renderWithProviders } from '@/test/renderWithProviders'
import { LogisticsKpis } from './LogisticsKpis'

const overview = buildLogistics(DEFAULT_FILTERS)
const url = '/?delay=0'

describe('LogisticsKpis', () => {
  beforeEach(() => window.history.replaceState({}, '', url))

  it('shows the four status groups with percent and object count', async () => {
    renderWithProviders(<LogisticsKpis onSelect={vi.fn()} />, { url })
    const cards = await screen.findAllByRole('article')
    expect(cards).toHaveLength(4)
    const delivered = overview.groups[0]!
    expect(within(cards[0]!).getByText('Entregues')).toBeInTheDocument()
    expect(within(cards[0]!).getByText(formatPercentage(delivered.percent, 1))).toBeInTheDocument()
    expect(within(cards[0]!).getByText(`${formatNumber(delivered.count)} objetos`)).toBeInTheDocument()
    expect(within(cards[1]!).getByText('Em Trânsito')).toBeInTheDocument()
    expect(within(cards[2]!).getByText('Custódia')).toBeInTheDocument()
    expect(within(cards[3]!).getByText('Em Processo de Devolução')).toBeInTheDocument()
  })

  it('reports which KPI was selected', async () => {
    const onSelect = vi.fn()
    renderWithProviders(<LogisticsKpis onSelect={onSelect} />, { url })
    await screen.findAllByRole('article')
    await userEvent.click(screen.getByRole('button', { name: /^Custódia/ }))
    expect(onSelect).toHaveBeenCalledWith('custodia')
    await userEvent.click(screen.getByRole('button', { name: /^Em Trânsito/ }))
    expect(onSelect).toHaveBeenCalledWith('pendente')
  })

  it('shows the error state', async () => {
    window.history.replaceState({}, '', '/?delay=0&error=1')
    renderWithProviders(<LogisticsKpis onSelect={vi.fn()} />, { url: '/?delay=0&error=1' })
    expect(await screen.findByRole('alert')).toHaveTextContent('Falha simulada')
  })
})
```

Nota: o `simulate` lê `window.location.search`, por isso os testes gravam a URL também em `window.history` (mesmo padrão de `InventoryKpis.test.tsx`).

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/features/logistics/LogisticsKpis.test.tsx`
Expected: FAIL (módulo `./LogisticsKpis` não existe).

- [ ] **Step 3: Implementar**

`src/features/logistics/LogisticsKpis.tsx`:

```tsx
import { Archive, PackageCheck, Truck, Undo2, type LucideIcon } from 'lucide-react'
import { formatNumber, formatPercentage } from '@/shared/lib/formatters'
import { KPICard, type KPIAccent } from '@/shared/ui/KPICard'
import { QueryBoundary } from '@/shared/ui/QueryBoundary'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useLogistics } from './api'
import { LOG_KPI_META, type LogisticsKpi } from './kpis'

const GRID = 'grid gap-4 sm:grid-cols-2 xl:grid-cols-4'

const ITEMS: { key: LogisticsKpi; icon: LucideIcon; accent: KPIAccent }[] = [
  { key: 'entregue', icon: PackageCheck, accent: 'teal' },
  { key: 'pendente', icon: Truck, accent: 'blue' },
  { key: 'custodia', icon: Archive, accent: 'orange' },
  { key: 'devolvido', icon: Undo2, accent: 'purple' },
]

export function LogisticsKpis({ onSelect }: { onSelect: (kpi: LogisticsKpi) => void }) {
  const query = useLogistics()
  return (
    <QueryBoundary
      query={query}
      skeleton={
        <div className={GRID}>
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      }
    >
      {({ groups }) => (
        <div className={GRID}>
          {ITEMS.map(({ key, icon, accent }) => {
            const group = groups.find((g) => g.key === key)
            return (
              <KPICard
                key={key}
                label={LOG_KPI_META[key].title}
                value={formatPercentage(group?.percent ?? 0, 1)}
                hint={`${formatNumber(group?.count ?? 0)} objetos`}
                icon={icon}
                accent={accent}
                onSelect={() => onSelect(key)}
              />
            )
          })}
        </div>
      )}
    </QueryBoundary>
  )
}
```

Se o typecheck reclamar que um ícone não é exportado pela versão instalada do `lucide-react`, conferir os nomes em `node_modules/lucide-react/dist/lucide-react.d.ts` e usar o mais próximo (por exemplo `Package` no lugar de `PackageCheck`, `RotateCcw` no lugar de `Undo2`).

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/features/logistics/LogisticsKpis.test.tsx`
Expected: PASS (3 testes).

- [ ] **Step 5: Commit**

```bash
git add src/features/logistics/LogisticsKpis.tsx src/features/logistics/LogisticsKpis.test.tsx
git commit -m "feat: add logistics KPI cards

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 6: Gráficos e tabela por status (TDD)

**Files:**
- Create: `src/features/logistics/LogisticsCharts.tsx`, `src/features/logistics/LogisticsTable.tsx`
- Test: `src/features/logistics/LogisticsCharts.test.tsx`, `src/features/logistics/LogisticsTable.test.tsx`

**Interfaces:**
- Consumes: `useLogistics()`, `useLogisticsTrend()`, `useTypeComparison()` (Task 3); `LineChartCard`, `PieChartCard`, `GroupedBarChartCard`, `ACCENT_HEX`; `DataTable`, `DataColumn` (`@/shared/ui/DataTable`); `QueryBoundary`, `Skeleton`; `formatNumber`, `formatPercentage`.
- Produces:
  - `LogisticsCharts()`: linha "Evolução de pendências logísticas" (largura total) e, abaixo, grade de duas colunas com pizza "Distribuição por status" e barras agrupadas "Flash vs. Terceiros por status".
  - `LogisticsTable()`: `DataTable` com legenda "Objetos por status" e colunas Status, Quantidade, Percentual (uma linha por grupo, ordenável).

- [ ] **Step 1: Escrever os testes que falham**

`src/features/logistics/LogisticsCharts.test.tsx`:

```tsx
import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/renderWithProviders'
import { LogisticsCharts } from './LogisticsCharts'

const url = '/?delay=0'

describe('LogisticsCharts', () => {
  beforeEach(() => window.history.replaceState({}, '', url))

  it('renders the trend, the distribution and the type comparison', async () => {
    renderWithProviders(<LogisticsCharts />, { url })
    expect(await screen.findByRole('heading', { name: 'Evolução de pendências logísticas' })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Distribuição por status' })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Flash vs. Terceiros por status' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /Entregue: Flash .*Terceiros/ })).toBeInTheDocument()
  })

  it('shows one error alert per failing chart', async () => {
    window.history.replaceState({}, '', '/?delay=0&error=1')
    renderWithProviders(<LogisticsCharts />, { url: '/?delay=0&error=1' })
    expect(await screen.findAllByRole('alert')).toHaveLength(3)
  })
})
```

`src/features/logistics/LogisticsTable.test.tsx`:

```tsx
import { screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { buildLogistics } from '@/data/mock/logistics'
import { DEFAULT_FILTERS } from '@/data/types/filters'
import { formatNumber } from '@/shared/lib/formatters'
import { renderWithProviders } from '@/test/renderWithProviders'
import { LogisticsTable } from './LogisticsTable'

const url = '/?delay=0'

describe('LogisticsTable', () => {
  beforeEach(() => window.history.replaceState({}, '', url))

  it('lists every status group with its quantity', async () => {
    renderWithProviders(<LogisticsTable />, { url })
    const table = await screen.findByRole('table', { name: 'Objetos por status' })
    expect(within(table).getAllByRole('row')).toHaveLength(7)
    const delivered = buildLogistics(DEFAULT_FILTERS).groups[0]!
    expect(within(table).getByText(formatNumber(delivered.count))).toBeInTheDocument()
    expect(within(table).getByText('Sinistrado')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/features/logistics/LogisticsCharts.test.tsx src/features/logistics/LogisticsTable.test.tsx`
Expected: FAIL (módulos não existem).

- [ ] **Step 3: Implementar os gráficos**

`src/features/logistics/LogisticsCharts.tsx`:

```tsx
import { ACCENT_HEX } from '@/shared/charts/chartTheme'
import { GroupedBarChartCard } from '@/shared/charts/GroupedBarChartCard'
import { LineChartCard } from '@/shared/charts/LineChartCard'
import { PieChartCard } from '@/shared/charts/PieChartCard'
import { QueryBoundary } from '@/shared/ui/QueryBoundary'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useLogistics, useLogisticsTrend, useTypeComparison } from './api'

export function LogisticsCharts() {
  const trend = useLogisticsTrend()
  const overview = useLogistics()
  const byType = useTypeComparison()
  return (
    <div className="space-y-4">
      <QueryBoundary query={trend} skeleton={<Skeleton className="h-72" />}>
        {(points) => (
          <LineChartCard
            title="Evolução de pendências logísticas"
            suffix=" pendências"
            color={ACCENT_HEX.pink}
            data={points.map((p) => ({ label: p.label, value: p.value }))}
          />
        )}
      </QueryBoundary>
      <div className="grid gap-4 xl:grid-cols-2">
        <QueryBoundary query={overview} skeleton={<Skeleton className="h-80" />}>
          {({ groups }) => (
            <PieChartCard
              title="Distribuição por status"
              data={groups.map((g) => ({ label: g.label, value: g.count }))}
            />
          )}
        </QueryBoundary>
        <QueryBoundary query={byType} skeleton={<Skeleton className="h-80" />}>
          {(rows) => (
            <GroupedBarChartCard
              title="Flash vs. Terceiros por status"
              series={[
                { key: 'flash', label: 'Flash', color: ACCENT_HEX.purple },
                { key: 'terceiros', label: 'Terceiros', color: ACCENT_HEX.green },
              ]}
              data={rows.map((r) => ({ label: r.label, flash: r.flash, terceiros: r.terceiros }))}
            />
          )}
        </QueryBoundary>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Implementar a tabela**

`src/features/logistics/LogisticsTable.tsx`:

```tsx
import { useMemo } from 'react'
import type { GroupStat } from '@/data/types/logistics'
import { formatNumber, formatPercentage } from '@/shared/lib/formatters'
import { DataTable, type DataColumn } from '@/shared/ui/DataTable'
import { QueryBoundary } from '@/shared/ui/QueryBoundary'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useLogistics } from './api'

const CARD = 'rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900'

function GroupTable({ groups }: { groups: GroupStat[] }) {
  const columns = useMemo<DataColumn<GroupStat>[]>(
    () => [
      { id: 'status', header: 'Status', cell: (g) => g.label, sortValue: (g) => g.label },
      { id: 'count', header: 'Quantidade', cell: (g) => formatNumber(g.count), sortValue: (g) => g.count, align: 'right' },
      { id: 'percent', header: 'Percentual', cell: (g) => formatPercentage(g.percent, 1), sortValue: (g) => g.percent, align: 'right' },
    ],
    [],
  )
  return <DataTable caption="Objetos por status" columns={columns} data={groups} />
}

export function LogisticsTable() {
  const query = useLogistics()
  return (
    <section className={CARD}>
      <QueryBoundary query={query} skeleton={<Skeleton className="h-64" />}>
        {({ groups }) => <GroupTable groups={groups} />}
      </QueryBoundary>
    </section>
  )
}
```

- [ ] **Step 5: Rodar e ver passar**

Run: `npx vitest run src/features/logistics/LogisticsCharts.test.tsx src/features/logistics/LogisticsTable.test.tsx`
Expected: PASS (3 testes), sem warnings no console. Se `getByText('Sinistrado')` casar com mais de um elemento, restringir com `within(table).getByRole('cell', { name: 'Sinistrado' })`.

- [ ] **Step 6: Commit**

```bash
git add src/features/logistics/LogisticsCharts.tsx src/features/logistics/LogisticsTable.tsx src/features/logistics/LogisticsCharts.test.tsx src/features/logistics/LogisticsTable.test.tsx
git commit -m "feat: add logistics charts and status table

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 7: Detalhamento de cada KPI (TDD)

**Files:**
- Create: `src/features/logistics/LogisticsDetails.tsx`
- Test: `src/features/logistics/LogisticsDetails.test.tsx`

**Interfaces:**
- Consumes: `useLogistics()`, `LogisticsKpi` (Task 3); `GroupStat` (Task 1); `PieChartCard`; `DataTable`, `DataColumn`; `SummaryStat`; `QueryBoundary`; `formatNumber`, `formatPercentage`.
- Produces: `LogisticsDetails({ kpi }: { kpi: LogisticsKpi })`: para o grupo do KPI, três `SummaryStat` (Total de objetos, Participação, Etapas com registros), pizza `Distribuição de <label>` e tabela `Etapas de <label>` (Etapa, Quantidade, Percentual do grupo; ordenável).

- [ ] **Step 1: Escrever os testes que falham**

`src/features/logistics/LogisticsDetails.test.tsx`:

```tsx
import { screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { buildLogistics } from '@/data/mock/logistics'
import { DEFAULT_FILTERS } from '@/data/types/filters'
import { formatNumber, formatPercentage } from '@/shared/lib/formatters'
import { renderWithProviders } from '@/test/renderWithProviders'
import { LogisticsDetails } from './LogisticsDetails'

const custody = buildLogistics(DEFAULT_FILTERS).groups[2]!
const url = '/?delay=0'

describe('LogisticsDetails', () => {
  beforeEach(() => window.history.replaceState({}, '', url))

  it('shows the totals, the distribution and the steps of the group', async () => {
    renderWithProviders(<LogisticsDetails kpi="custodia" />, { url })
    const table = await screen.findByRole('table', { name: 'Etapas de Custódia' })
    expect(within(table).getAllByRole('row')).toHaveLength(custody.steps.length + 1)
    expect(within(table).getByText('Aguardando telemarketing')).toBeInTheDocument()
    expect(screen.getByText('Total de objetos')).toBeInTheDocument()
    expect(screen.getByText(formatNumber(custody.count))).toBeInTheDocument()
    expect(screen.getByText(formatPercentage(custody.percent, 1))).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Distribuição de Custódia' })).toBeInTheDocument()
  })

  it('shows the error state', async () => {
    window.history.replaceState({}, '', '/?delay=0&error=1')
    renderWithProviders(<LogisticsDetails kpi="pendente" />, { url: '/?delay=0&error=1' })
    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/features/logistics/LogisticsDetails.test.tsx`
Expected: FAIL (módulo `./LogisticsDetails` não existe).

- [ ] **Step 3: Implementar**

`src/features/logistics/LogisticsDetails.tsx`:

```tsx
import { useMemo } from 'react'
import type { GroupStat, StepCount } from '@/data/types/logistics'
import { PieChartCard } from '@/shared/charts/PieChartCard'
import { formatNumber, formatPercentage } from '@/shared/lib/formatters'
import { DataTable, type DataColumn } from '@/shared/ui/DataTable'
import { QueryBoundary } from '@/shared/ui/QueryBoundary'
import { SummaryStat } from '@/shared/ui/SummaryStat'
import { useLogistics } from './api'
import type { LogisticsKpi } from './kpis'

function GroupDetails({ group }: { group: GroupStat }) {
  const columns = useMemo<DataColumn<StepCount>[]>(
    () => [
      { id: 'step', header: 'Etapa', cell: (s) => s.label, sortValue: (s) => s.label },
      { id: 'count', header: 'Quantidade', cell: (s) => formatNumber(s.count), sortValue: (s) => s.count, align: 'right' },
      {
        id: 'share',
        header: 'Percentual do grupo',
        cell: (s) => formatPercentage(group.count === 0 ? 0 : (s.count / group.count) * 100, 1),
        sortValue: (s) => s.count,
        align: 'right',
      },
    ],
    [group.count],
  )
  const withRecords = group.steps.filter((s) => s.count > 0).length
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryStat label="Total de objetos" value={formatNumber(group.count)} />
        <SummaryStat label="Participação" value={formatPercentage(group.percent, 1)} tone="green" />
        <SummaryStat label="Etapas com registros" value={`${withRecords} de ${group.steps.length}`} tone="red" />
      </div>
      <PieChartCard
        title={`Distribuição de ${group.label}`}
        data={group.steps.map((s) => ({ label: s.label, value: s.count }))}
      />
      <DataTable caption={`Etapas de ${group.label}`} columns={columns} data={group.steps} />
    </div>
  )
}

export function LogisticsDetails({ kpi }: { kpi: LogisticsKpi }) {
  const query = useLogistics()
  return (
    <QueryBoundary query={query}>
      {({ groups }) => {
        const group = groups.find((g) => g.key === kpi)
        return group ? <GroupDetails group={group} /> : null
      }}
    </QueryBoundary>
  )
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/features/logistics/LogisticsDetails.test.tsx`
Expected: PASS (2 testes). Se `getByText(formatNumber(custody.count))` casar com mais de um elemento (por exemplo, uma etapa com a mesma contagem), trocar por `within(screen.getByText('Total de objetos').parentElement!).getByText(...)`.

- [ ] **Step 5: Commit**

```bash
git add src/features/logistics/LogisticsDetails.tsx src/features/logistics/LogisticsDetails.test.tsx
git commit -m "feat: add logistics KPI details content

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 8: Página, rota e verificação final (TDD)

**Files:**
- Create: `src/features/logistics/LogisticsPage.tsx`
- Modify: `src/app/routes.tsx`
- Test: `src/features/logistics/LogisticsPage.test.tsx`

**Interfaces:**
- Consumes: `LogisticsFilters` (Task 4), `LogisticsKpis` (Task 5), `LogisticsCharts`, `LogisticsTable` (Task 6), `LogisticsDetails` (Task 7), `LOG_KPI_META`, `LogisticsKpi` (Task 3); `Modal` (`@/shared/ui/Modal`, props `open`, `title`, `onClose`, `children`, `wide`).
- Produces: `LogisticsPage()` exportada nomeadamente e carregada por `React.lazy` na rota `/logistics`.

- [ ] **Step 1: Escrever os testes que falham**

`src/features/logistics/LogisticsPage.test.tsx`:

```tsx
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { buildLogistics } from '@/data/mock/logistics'
import { DEFAULT_FILTERS } from '@/data/types/filters'
import { formatNumber } from '@/shared/lib/formatters'
import { renderWithProviders } from '@/test/renderWithProviders'
import { LogisticsPage } from './LogisticsPage'

const url = '/?delay=0'

describe('LogisticsPage', () => {
  beforeEach(() => window.history.replaceState({}, '', url))

  it('renders the heading, filters, KPIs, charts and table', async () => {
    renderWithProviders(<LogisticsPage />, { url })
    expect(screen.getByRole('heading', { level: 1, name: 'Logística' })).toBeInTheDocument()
    expect(await screen.findByLabelText('Tipo')).toBeInTheDocument()
    expect(await screen.findAllByRole('article')).toHaveLength(4)
    expect(await screen.findByRole('heading', { name: 'Evolução de pendências logísticas' })).toBeInTheDocument()
    expect(await screen.findByRole('table', { name: 'Objetos por status' })).toBeInTheDocument()
  })

  it('opens the details of a KPI in a dialog and closes it with Escape', async () => {
    renderWithProviders(<LogisticsPage />, { url })
    await userEvent.click(await screen.findByRole('button', { name: /^Custódia/ }))
    const dialog = await screen.findByRole('dialog', { name: 'Custódia - Detalhamento' })
    expect(await within(dialog).findByRole('table', { name: 'Etapas de Custódia' })).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('applies the type filter to the KPI counts', async () => {
    renderWithProviders(<LogisticsPage />, { url })
    const all = buildLogistics(DEFAULT_FILTERS).groups[0]!.count
    const flash = buildLogistics({ ...DEFAULT_FILTERS, logisticsType: 'flash' }).groups[0]!.count
    expect(await screen.findByText(`${formatNumber(all)} objetos`)).toBeInTheDocument()
    await userEvent.selectOptions(await screen.findByLabelText('Tipo'), 'flash')
    expect(await screen.findByText(`${formatNumber(flash)} objetos`)).toBeInTheDocument()
  })

  it('shows error alerts when the repository fails', async () => {
    window.history.replaceState({}, '', '/?delay=0&error=1')
    renderWithProviders(<LogisticsPage />, { url: '/?delay=0&error=1' })
    expect((await screen.findAllByRole('alert')).length).toBeGreaterThan(0)
  })
})
```

Nota: o filtro de tipo escala todos os grupos pelo mesmo fator, então os percentuais dos KPIs não mudam; o teste confere a contagem absoluta na dica (`"<N> objetos"`), que muda.

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/features/logistics/LogisticsPage.test.tsx`
Expected: FAIL (módulo `./LogisticsPage` não existe).

- [ ] **Step 3: Implementar a página**

`src/features/logistics/LogisticsPage.tsx`:

```tsx
import { useCallback, useState } from 'react'
import { Modal } from '@/shared/ui/Modal'
import { LogisticsCharts } from './LogisticsCharts'
import { LogisticsDetails } from './LogisticsDetails'
import { LogisticsFilters } from './LogisticsFilters'
import { LogisticsKpis } from './LogisticsKpis'
import { LogisticsTable } from './LogisticsTable'
import { LOG_KPI_META, type LogisticsKpi } from './kpis'

export function LogisticsPage() {
  const [selected, setSelected] = useState<LogisticsKpi | null>(null)
  const close = useCallback(() => setSelected(null), [])
  return (
    <section className="space-y-6">
      <h1 className="text-xl font-semibold">Logística</h1>
      <LogisticsFilters />
      <LogisticsKpis onSelect={setSelected} />
      <LogisticsCharts />
      <LogisticsTable />
      <Modal open={selected !== null} title={selected ? LOG_KPI_META[selected].detailsTitle : ''} onClose={close} wide>
        {selected && <LogisticsDetails kpi={selected} />}
      </Modal>
    </section>
  )
}
```

- [ ] **Step 4: Ligar a rota**

Em `src/app/routes.tsx`, substituir a linha

```tsx
      { path: 'logistics', element: <ComingSoon title="Logística" /> },
```

por

```tsx
      {
        path: 'logistics',
        lazy: async () => ({
          Component: (await import('@/features/logistics/LogisticsPage')).LogisticsPage,
        }),
      },
```

Manter o import de `ComingSoon` (a rota `gallery` ainda o usa).

- [ ] **Step 5: Rodar os testes da página**

Run: `npx vitest run src/features/logistics`
Expected: PASS em todos os arquivos da pasta, sem warnings de `act()` nem de dimensões do Recharts.

- [ ] **Step 6: Verificação completa**

Run: `npm test` (duas vezes seguidas), `npm run typecheck`, `npm run lint`, `npm run build`
Expected: tudo passa; suíte estável nas duas rodadas. No `build`: a página de logística vira chunk próprio (`ls dist/assets | grep -i logistics`) e `grep -l leaflet dist/assets/*.js` continua sem listar `index-*.js` nem o chunk de logística. Registrar os tamanhos dos chunks no relatório.

- [ ] **Step 7: Conferir no navegador**

Run: `npm run dev`, abrir `http://localhost:5173/logistics?delay=0` e conferir: 4 KPIs, gráficos, tabela; trocar Tipo para "Flash" e Etapa para uma etapa de Custódia (os números mudam e a URL ganha `logisticsType` e `logisticsStep`); abrir um KPI (modal com tabela de etapas, fecha com Esc); alternar o tema escuro; recarregar com `?error=1` e ver os alertas com "Tentar novamente"; navegar para outra rota pela sidebar e voltar.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: add Logistics page and wire the /logistics route

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Self-Review

- **Cobertura do legado:** 4 KPIs (Entregues, Em Trânsito, Custódia, Em Processo de Devolução), evolução em linha, pizza de distribuição e tabela por tipo de gargalo (Tasks 5, 6), agora com dados coerentes; detalhamento por KPI em modal (Task 7). Filtros próprios do legado (Tipo Flash/Terceiros e Status/Etapas em cascata) viram os selects "Tipo" e "Etapa" com `<optgroup>` por status (Task 4); o seletor intermediário de "grupo de status" foi absorvido pelos `<optgroup>` para não ampliar o schema de filtros do Plano 1. Filtros aplicados de verdade nos geradores (Task 2). Fora de escopo por decisão: visões de workflow.
- **Cobertura da spec:** repositório com interface e mock, seed fixa, latência e `?error=1`, filtros em search params com deep link, TanStack Table na listagem, Recharts nos gráficos, rota lazy, filtros específicos só na rota (Tasks 1 a 8).
- **Placeholders:** nenhum. Os pontos condicionais (nomes de ícones do `lucide-react`, exposição do `optgroup` como `group` no jsdom, textos duplicados em `getByText`, gravação da URL em `window.history` no teste de erro) trazem a ação corretiva concreta.
- **Consistência de tipos:** `LogisticsGroupKey`, `GroupStat`, `StepCount`, `LogisticsOverview`, `TypeComparisonRow`, `LogisticsCatalog`, `LogisticsKpi`, `LOG_KPI_META` e os hooks `useLogistics`, `useLogisticsTrend`, `useTypeComparison`, `useLogisticsCatalog` têm a mesma forma em todas as tarefas. As chaves de grupo do catálogo (`entregue`, `pendente`, `custodia`, `devolvido`) coincidem com as de `LogisticsKpi`.
- **Riscos conhecidos:** o worktree deste plano nasce de `main`, sem o código dos Planos 1 a 3 (a execução precisa partir de `modernize/template`); rótulos de ícones podem variar por versão do `lucide-react`; o filtro de etapa zera as demais etapas, então os percentuais ficam 100% no grupo dono da etapa (comportamento esperado, documentado no teste da Task 2).
