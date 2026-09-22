# Plano 3: Financial + Inventory Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar as páginas Desempenho Financeiro (legado: `legacy/src/pages/FinancialPerformance.jsx`) e Gestão de Estoque (`InventoryManagement.jsx`) para a arquitetura nova, com dados mock tipados, tabelas (TanStack Table), gráficos (Recharts) e mapa (react-leaflet).

**Architecture:** Mesmo padrão do Plano 2: repositórios mock por domínio (`financial`, `inventory`) derivados de `buildOverview` para que os números batam, hooks via `useDomainQuery`, seções pequenas por página. Novos componentes compartilhados: `DataTable`, `GroupedBarChartCard`, `RegionMap`. Páginas em `React.lazy` nas rotas.

**Tech Stack:** @tanstack/react-table, react-leaflet + leaflet, Recharts (existente), TanStack Query, Vitest, Testing Library, Tailwind 4, lucide-react.

**Spec:** `docs/superpowers/specs/2026-09-21-dashboard-showcase-template-design.md`

**Depende de:** Planos 1 e 2 (branch `modernize/template`). Antes do Task 1, `npm test`, `npm run typecheck`, `npm run lint` e `npm run build` devem estar verdes.

## Global Constraints

- TypeScript `strict: true`, sem `any` explícito.
- Datas, números e moedas em pt-BR via `@/shared/lib/formatters` (moeda BRL).
- Dados mock determinísticos (seed fixa); nenhum acesso a rede, banco ou Supabase. Os tiles do mapa (OpenStreetMap) são recurso de UI, não dado.
- Ícones com `lucide-react`; sem Font Awesome. Mapa com `CircleMarker` (sem imagens de marcador do Leaflet).
- Alias de import `@/` aponta para `src/`.
- Nenhum nome real ou marca do legado.
- Saída de testes limpa (sem warnings de `act()`, dimensões do Recharts ou Leaflet).
- Modo escuro: componentes novos usam variantes `dark:` ou as variáveis `--chart-*` já existentes.
- `shared` não importa de `@/app`, `@/data` nem de `features`.
- Nenhum arquivo com mais de ~150 linhas escrito numa única chamada.
- Commits com o trailer `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`.
- Decisão de escopo: estas páginas **não** têm as visões de workflow (fluxograma, organograma, POPs) do legado; o Plano 2 já as demonstra.
- O mock global de `recharts` em `src/test/setup.ts` continua; **não** criar mock global de `react-leaflet` (mockar só no arquivo de teste que precisar).

## Mapa de arquivos

```
src/data/mock/scale.ts, trend.ts    export periodFactor, periodLabels (Task 1)
src/data/types/financial.ts, inventory.ts   (Task 1)
src/data/mock/financial.ts, inventory.ts    (Tasks 2, 3)
src/data/repositories/financial.ts, inventory.ts (+ mock/*, index.ts)  (Tasks 2, 3)
src/shared/ui/DataTable.tsx                 (Task 4)
src/shared/charts/GroupedBarChartCard.tsx   (Task 5)
src/shared/maps/RegionMap.tsx               (Task 6)
src/features/financial/*                    (Tasks 7-9)
src/features/inventory/*                    (Task 10)
```

---

### Task 1: Helpers de período e tipos de Financial e Inventory (TDD)

**Files:**
- Modify: `src/data/mock/scale.ts`, `src/data/mock/trend.ts`, `src/data/mock/scale.test.ts`, `src/data/mock/trend.test.ts`
- Create: `src/data/types/financial.ts`, `src/data/types/inventory.ts`

**Interfaces:**
- Produces:
  - `periodFactor(f: GlobalFilters): number` (só o fator do período; `volumeFactor` passa a ser `periodFactor * fator da região`)
  - `periodLabels(f: GlobalFilters): string[]` (os rótulos que `buildTrend` já usa: `all`/`12m` → 12 meses, `90d` → 3, `30d` → 4, `7d` → 7)
  - Tipos de `financial.ts`: `RegionKey = Exclude<GlobalFilters['region'], 'all'>`, `LimitUsage { ratePercent; usedAmount; totalAmount; averageUsage; customers }`, `UsageRange { range: string; customers: number; percent: number; average: number; averageAvailable: number }`, `CostByStatus { status: string; count: number; amount: number; costPerCard: number; availablePerCard: number }`, `LogisticsUnitCosts { card; envelope; letter; shipping }`, `LogisticsCosts { totalAmount; unit: LogisticsUnitCosts; unitTotal: number; byStatus: CostByStatus[] }`, `FinancialOverview { limitUsage; usageByRange: UsageRange[]; logistics: LogisticsCosts }`, `RegionUnlock { region: RegionKey; label: string; unlocked: number; locked: number; lat: number; lng: number }`
  - Tipos de `inventory.ts`: `StockItemKey = 'cards' | 'envelopes' | 'letters'`, `StockItem { key; label: string; total; available; inTransit; lost }`, `InventoryOverview { items: StockItem[]; totalLost: number }`

- [ ] **Step 1: Escrever os testes que falham**

Acrescentar ao final de `src/data/mock/scale.test.ts`:

```ts
import { periodFactor } from './scale'

describe('periodFactor', () => {
  it('depends only on the period', () => {
    expect(periodFactor(DEFAULT_FILTERS)).toBe(1)
    expect(periodFactor({ ...DEFAULT_FILTERS, period: '7d' })).toBe(0.03)
    expect(periodFactor({ ...DEFAULT_FILTERS, region: 'sul' })).toBe(1)
  })
})
```

(Se o `import` ficar no meio do arquivo, mover para o bloco de imports do topo, juntando com o `import` existente de `./scale`.)

Acrescentar ao final de `src/data/mock/trend.test.ts`:

```ts
import { periodLabels } from './trend'

describe('periodLabels', () => {
  it('returns the labels used by the trend', () => {
    expect(periodLabels({ ...DEFAULT_FILTERS, period: '30d' })).toEqual(['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'])
    expect(periodLabels(DEFAULT_FILTERS)).toHaveLength(12)
    expect(periodLabels({ ...DEFAULT_FILTERS, period: '7d' })[0]).toBe('Seg')
  })
})
```

(Mesma regra: juntar o `import` ao topo.)

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/data/mock/scale.test.ts src/data/mock/trend.test.ts`
Expected: FAIL (`periodFactor` e `periodLabels` não são exportados).

- [ ] **Step 3: Implementar os exports**

Em `src/data/mock/scale.ts`, substituir a linha de `volumeFactor` por:

```ts
export const periodFactor = (f: GlobalFilters): number => PERIOD_FACTOR[f.period]

export const volumeFactor = (f: GlobalFilters): number => periodFactor(f) * REGION_FACTOR[f.region]
```

Em `src/data/mock/trend.ts`, acrescentar depois de `LABELS`:

```ts
export const periodLabels = (f: GlobalFilters): string[] => LABELS[f.period]
```

e trocar `LABELS[f.period].map(` por `periodLabels(f).map(` dentro de `buildTrend`.

- [ ] **Step 4: Criar os tipos**

`src/data/types/financial.ts`:

```ts
import type { GlobalFilters } from './filters'

export type RegionKey = Exclude<GlobalFilters['region'], 'all'>

export interface LimitUsage {
  ratePercent: number
  usedAmount: number
  totalAmount: number
  averageUsage: number
  customers: number
}

export interface UsageRange {
  range: string
  customers: number
  percent: number
  average: number
  averageAvailable: number
}

export interface CostByStatus {
  status: string
  count: number
  amount: number
  costPerCard: number
  availablePerCard: number
}

export interface LogisticsUnitCosts {
  card: number
  envelope: number
  letter: number
  shipping: number
}

export interface LogisticsCosts {
  totalAmount: number
  unit: LogisticsUnitCosts
  unitTotal: number
  byStatus: CostByStatus[]
}

export interface FinancialOverview {
  limitUsage: LimitUsage
  usageByRange: UsageRange[]
  logistics: LogisticsCosts
}

export interface RegionUnlock {
  region: RegionKey
  label: string
  unlocked: number
  locked: number
  lat: number
  lng: number
}
```

`src/data/types/inventory.ts`:

```ts
export type StockItemKey = 'cards' | 'envelopes' | 'letters'

export interface StockItem {
  key: StockItemKey
  label: string
  total: number
  available: number
  inTransit: number
  lost: number
}

export interface InventoryOverview {
  items: StockItem[]
  totalLost: number
}
```

- [ ] **Step 5: Rodar tudo e ver passar**

Run: `npm test && npm run typecheck && npm run lint`
Expected: todos passam (os testes existentes de `volumeFactor`/`buildTrend` continuam verdes).

- [ ] **Step 6: Commit**

```bash
git add src/data && git commit -m "feat: add periodFactor/periodLabels helpers and financial/inventory types

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 2: Mock e repositório financeiro (TDD)

**Files:**
- Create: `src/data/mock/financial.ts`, `src/data/repositories/financial.ts`, `src/data/repositories/mock/financial.ts`
- Modify: `src/data/repositories/index.ts`
- Test: `src/data/mock/financial.test.ts`, `src/data/repositories/mock/financial.test.ts`

**Interfaces:**
- Consumes: tipos do Task 1, `buildOverview`, `createRng`, `seedFor`, `volumeFactor`, `periodFactor`, `pct`, `splitByWeights`, `periodLabels`, `TrendPoint` (`@/data/types/card-processing`), `simulate`.
- Produces:
  - `buildFinancialOverview(f): FinancialOverview`, `buildUnlockByRegion(f): RegionUnlock[]` (com `region` diferente de `all`, só a região escolhida), `buildUsageEvolution(f): TrendPoint[]` (valores em R$ mil, um por rótulo de `periodLabels`)
  - `interface FinancialRepository { getOverview(f): Promise<FinancialOverview>; getUnlockByRegion(f): Promise<RegionUnlock[]>; getUsageEvolution(f): Promise<TrendPoint[]> }`
  - `repositories.financial: FinancialRepository`

- [ ] **Step 1: Escrever os testes que falham**

`src/data/mock/financial.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { DEFAULT_FILTERS } from '@/data/types/filters'
import { buildFinancialOverview, buildUnlockByRegion, buildUsageEvolution } from './financial'
import { buildOverview } from './overview'

describe('buildFinancialOverview', () => {
  const o = buildFinancialOverview(DEFAULT_FILTERS)

  it('keeps ranges, limit usage and costs consistent', () => {
    expect(o.usageByRange).toHaveLength(4)
    expect(o.usageByRange.reduce((s, r) => s + r.customers, 0)).toBe(o.limitUsage.customers)
    expect(o.usageByRange.reduce((s, r) => s + r.percent, 0)).toBeCloseTo(100, 5)
    const used = o.usageByRange.reduce((s, r) => s + r.customers * r.average, 0)
    expect(o.limitUsage.usedAmount).toBe(used)
    expect(o.limitUsage.ratePercent).toBeGreaterThan(0)
    expect(o.limitUsage.ratePercent).toBeLessThan(100)
    expect(o.logistics.byStatus).toHaveLength(5)
    expect(o.logistics.byStatus.reduce((s, c) => s + c.count, 0)).toBe(buildOverview(DEFAULT_FILTERS).cards.sent)
    expect(o.logistics.totalAmount).toBe(o.logistics.byStatus.reduce((s, c) => s + c.amount, 0))
    expect(o.logistics.unitTotal).toBe(40)
  })
  it('is deterministic and shrinks with the period', () => {
    expect(buildFinancialOverview(DEFAULT_FILTERS)).toEqual(o)
    expect(buildFinancialOverview({ ...DEFAULT_FILTERS, period: '7d' }).limitUsage.customers).toBeLessThan(
      o.limitUsage.customers,
    )
  })
  it('never divides by zero on tiny volumes', () => {
    const tiny = buildFinancialOverview({ ...DEFAULT_FILTERS, period: '7d', region: 'centro-oeste' })
    expect(Number.isFinite(tiny.limitUsage.averageUsage)).toBe(true)
    expect(Number.isFinite(tiny.limitUsage.ratePercent)).toBe(true)
  })
})

describe('buildUnlockByRegion', () => {
  it('returns the five regions with coordinates, or only the selected one', () => {
    const all = buildUnlockByRegion(DEFAULT_FILTERS)
    expect(all.map((r) => r.region)).toEqual(['norte', 'nordeste', 'sudeste', 'sul', 'centro-oeste'])
    expect(all.every((r) => Number.isFinite(r.lat) && Number.isFinite(r.lng))).toBe(true)
    expect(buildUnlockByRegion({ ...DEFAULT_FILTERS, region: 'sul' }).map((r) => r.region)).toEqual(['sul'])
  })
  it('shrinks with the period', () => {
    const week = buildUnlockByRegion({ ...DEFAULT_FILTERS, period: '7d' })
    expect(week[0]!.unlocked).toBeLessThan(buildUnlockByRegion(DEFAULT_FILTERS)[0]!.unlocked)
  })
})

describe('buildUsageEvolution', () => {
  it('has one non-negative point per period label', () => {
    const points = buildUsageEvolution(DEFAULT_FILTERS)
    expect(points).toHaveLength(12)
    expect(points.every((p) => p.value >= 0)).toBe(true)
    expect(buildUsageEvolution({ ...DEFAULT_FILTERS, period: '7d' })).toHaveLength(7)
  })
})
```

`src/data/repositories/mock/financial.test.ts`:

```ts
import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_FILTERS } from '@/data/types/filters'
import { mockFinancialRepository as repo } from './financial'

describe('mockFinancialRepository', () => {
  beforeEach(() => window.history.replaceState({}, '', '/?delay=0'))
  it('serves every section', async () => {
    expect((await repo.getOverview(DEFAULT_FILTERS)).usageByRange).toHaveLength(4)
    expect(await repo.getUnlockByRegion(DEFAULT_FILTERS)).toHaveLength(5)
    expect(await repo.getUsageEvolution(DEFAULT_FILTERS)).toHaveLength(12)
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/data/mock/financial.test.ts src/data/repositories/mock/financial.test.ts`
Expected: FAIL (módulos inexistentes).

- [ ] **Step 3: Implementar `src/data/mock/financial.ts`**

```ts
import type { TrendPoint } from '@/data/types/card-processing'
import type { FinancialOverview, RegionUnlock } from '@/data/types/financial'
import type { GlobalFilters } from '@/data/types/filters'
import { buildOverview } from './overview'
import { createRng } from './random'
import { pct, periodFactor, seedFor, splitByWeights, volumeFactor } from './scale'
import { periodLabels } from './trend'

const RANGES = ['0-25%', '26-50%', '51-75%', '76-100%'] as const
const RANGE_AVERAGE = [1200, 2300, 3100, 3800] as const
const RANGE_AVAILABLE = [800, 1500, 2000, 2500] as const

const STATUSES = ['Entregue', 'Em trânsito', 'Custódia', 'Em devolução', 'Devolvido'] as const
const COST_PER_CARD = [40, 38, 35, 42, 45] as const
const AVAILABLE_PER_CARD = [35, 32, 30, 28, 25] as const

const UNIT_COSTS = { card: 15, envelope: 8, letter: 5, shipping: 12 } as const

const REGIONS = [
  { region: 'norte', label: 'Norte', unlocked: 1500, locked: 300, lat: -3.4, lng: -60 },
  { region: 'nordeste', label: 'Nordeste', unlocked: 2500, locked: 700, lat: -9, lng: -40 },
  { region: 'sudeste', label: 'Sudeste', unlocked: 5500, locked: 1000, lat: -20, lng: -45 },
  { region: 'sul', label: 'Sul', unlocked: 3000, locked: 400, lat: -27, lng: -51.5 },
  { region: 'centro-oeste', label: 'Centro-Oeste', unlocked: 2000, locked: 500, lat: -15.5, lng: -54 },
] as const

export function buildFinancialOverview(f: GlobalFilters): FinancialOverview {
  const rng = createRng(seedFor(f, 'financial'))
  const customers = Math.round(rng.int(900, 1100) * volumeFactor(f))
  const usageByRange = splitByWeights(customers, RANGES, rng).map((slice, i) => ({
    range: slice.reason,
    customers: slice.count,
    percent: pct(slice.count, customers),
    average: Math.round((RANGE_AVERAGE[i] ?? 0) * (0.95 + rng.next() * 0.1)),
    averageAvailable: Math.round((RANGE_AVAILABLE[i] ?? 0) * (0.95 + rng.next() * 0.1)),
  }))
  const usedAmount = usageByRange.reduce((sum, r) => sum + r.customers * r.average, 0)
  const availableAmount = usageByRange.reduce((sum, r) => sum + r.customers * r.averageAvailable, 0)

  const sent = buildOverview(f).cards.sent
  const byStatus = splitByWeights(sent, STATUSES, rng).map((slice, i) => ({
    status: slice.reason,
    count: slice.count,
    amount: slice.count * (COST_PER_CARD[i] ?? 0),
    costPerCard: COST_PER_CARD[i] ?? 0,
    availablePerCard: AVAILABLE_PER_CARD[i] ?? 0,
  }))

  return {
    limitUsage: {
      ratePercent: pct(usedAmount, usedAmount + availableAmount),
      usedAmount,
      totalAmount: usedAmount + availableAmount,
      averageUsage: customers === 0 ? 0 : Math.round(usedAmount / customers),
      customers,
    },
    usageByRange,
    logistics: {
      totalAmount: byStatus.reduce((sum, s) => sum + s.amount, 0),
      unit: { ...UNIT_COSTS },
      unitTotal: UNIT_COSTS.card + UNIT_COSTS.envelope + UNIT_COSTS.letter + UNIT_COSTS.shipping,
      byStatus,
    },
  }
}

export function buildUnlockByRegion(f: GlobalFilters): RegionUnlock[] {
  const rng = createRng(seedFor(f, 'unlock'))
  const factor = periodFactor(f)
  return REGIONS.map((r) => {
    const k = factor * (0.9 + rng.next() * 0.2)
    return {
      region: r.region,
      label: r.label,
      unlocked: Math.round(r.unlocked * k),
      locked: Math.round(r.locked * k),
      lat: r.lat,
      lng: r.lng,
    }
  }).filter((r) => f.region === 'all' || r.region === f.region)
}

export function buildUsageEvolution(f: GlobalFilters): TrendPoint[] {
  const rng = createRng(seedFor(f, 'usage-evolution'))
  const averageThousands = buildFinancialOverview(f).limitUsage.averageUsage / 1000
  return periodLabels(f).map((label) => ({
    label,
    value: Math.round(averageThousands * (0.85 + rng.next() * 0.3) * 10) / 10,
  }))
}
```

- [ ] **Step 4: Repositório e ligação**

`src/data/repositories/financial.ts`:

```ts
import type { TrendPoint } from '@/data/types/card-processing'
import type { GlobalFilters } from '@/data/types/filters'
import type { FinancialOverview, RegionUnlock } from '@/data/types/financial'

export interface FinancialRepository {
  getOverview(filters: GlobalFilters): Promise<FinancialOverview>
  getUnlockByRegion(filters: GlobalFilters): Promise<RegionUnlock[]>
  getUsageEvolution(filters: GlobalFilters): Promise<TrendPoint[]>
}
```

`src/data/repositories/mock/financial.ts`:

```ts
import { buildFinancialOverview, buildUnlockByRegion, buildUsageEvolution } from '@/data/mock/financial'
import { simulate } from '@/data/mock/simulate'
import type { FinancialRepository } from '@/data/repositories/financial'

export const mockFinancialRepository: FinancialRepository = {
  getOverview: (filters) => simulate(() => buildFinancialOverview(filters)),
  getUnlockByRegion: (filters) => simulate(() => buildUnlockByRegion(filters)),
  getUsageEvolution: (filters) => simulate(() => buildUsageEvolution(filters)),
}
```

Em `src/data/repositories/index.ts`, importar `FinancialRepository` e `mockFinancialRepository`, acrescentar `financial: FinancialRepository` à interface `Repositories` e `financial: mockFinancialRepository` ao objeto exportado.

- [ ] **Step 5: Rodar tudo e ver passar**

Run: `npm test && npm run typecheck && npm run lint`
Expected: todos passam. O `filter` depois do `map` mantém o consumo do `rng` idêntico entre regiões (determinismo por convênio, não pela região).

- [ ] **Step 6: Commit**

```bash
git add src/data && git commit -m "feat: add financial mock data and repository

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 3: Mock e repositório de estoque (TDD)

**Files:**
- Create: `src/data/mock/inventory.ts`, `src/data/repositories/inventory.ts`, `src/data/repositories/mock/inventory.ts`
- Modify: `src/data/repositories/index.ts`
- Test: `src/data/mock/inventory.test.ts`, `src/data/repositories/mock/inventory.test.ts`

**Interfaces:**
- Consumes: tipos do Task 1, `createRng`, `seedFor`, `volumeFactor`, `periodLabels`, `TrendPoint`, `simulate`.
- Produces:
  - `buildInventory(f): InventoryOverview` (3 itens na ordem `cards`, `envelopes`, `letters`, rótulos `Cartões`, `Envelopes`, `Cartas Berço`; `available + inTransit + lost = total` em cada item; `totalLost` é a soma das perdas)
  - `buildLossTrend(f): TrendPoint[]` (perdas por rótulo de `periodLabels`, inteiros ≥ 0)
  - `interface InventoryRepository { getOverview(f): Promise<InventoryOverview>; getLossTrend(f): Promise<TrendPoint[]> }` e `repositories.inventory`

- [ ] **Step 1: Escrever os testes que falham**

`src/data/mock/inventory.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { DEFAULT_FILTERS } from '@/data/types/filters'
import { buildInventory, buildLossTrend } from './inventory'

describe('buildInventory', () => {
  const inv = buildInventory(DEFAULT_FILTERS)

  it('has the three stock items with balanced quantities', () => {
    expect(inv.items.map((i) => i.key)).toEqual(['cards', 'envelopes', 'letters'])
    expect(inv.items.map((i) => i.label)).toEqual(['Cartões', 'Envelopes', 'Cartas Berço'])
    for (const item of inv.items) {
      expect(item.available + item.inTransit + item.lost).toBe(item.total)
      expect(item.available).toBeGreaterThan(0)
      expect(item.lost).toBeGreaterThanOrEqual(0)
    }
    expect(inv.totalLost).toBe(inv.items.reduce((s, i) => s + i.lost, 0))
  })
  it('is deterministic and shrinks with the period', () => {
    expect(buildInventory(DEFAULT_FILTERS)).toEqual(inv)
    expect(buildInventory({ ...DEFAULT_FILTERS, period: '7d' }).items[0]!.total).toBeLessThan(inv.items[0]!.total)
  })
  it('never yields negative quantities on tiny volumes', () => {
    const tiny = buildInventory({ ...DEFAULT_FILTERS, period: '7d', region: 'centro-oeste' })
    for (const item of tiny.items) {
      expect(Math.min(item.total, item.available, item.inTransit, item.lost)).toBeGreaterThanOrEqual(0)
    }
  })
})

describe('buildLossTrend', () => {
  it('has one non-negative integer per period label', () => {
    const points = buildLossTrend(DEFAULT_FILTERS)
    expect(points).toHaveLength(12)
    expect(points.every((p) => Number.isInteger(p.value) && p.value >= 0)).toBe(true)
    expect(buildLossTrend({ ...DEFAULT_FILTERS, period: '30d' })).toHaveLength(4)
  })
})
```

`src/data/repositories/mock/inventory.test.ts`:

```ts
import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_FILTERS } from '@/data/types/filters'
import { mockInventoryRepository as repo } from './inventory'

describe('mockInventoryRepository', () => {
  beforeEach(() => window.history.replaceState({}, '', '/?delay=0'))
  it('serves overview and loss trend', async () => {
    expect((await repo.getOverview(DEFAULT_FILTERS)).items).toHaveLength(3)
    expect(await repo.getLossTrend(DEFAULT_FILTERS)).toHaveLength(12)
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/data/mock/inventory.test.ts src/data/repositories/mock/inventory.test.ts`
Expected: FAIL (módulos inexistentes).

- [ ] **Step 3: Implementar**

`src/data/mock/inventory.ts`:

```ts
import type { TrendPoint } from '@/data/types/card-processing'
import type { GlobalFilters } from '@/data/types/filters'
import type { InventoryOverview, StockItem, StockItemKey } from '@/data/types/inventory'
import { createRng } from './random'
import { seedFor, volumeFactor } from './scale'
import { periodLabels } from './trend'

const ITEMS: { key: StockItemKey; label: string; base: number }[] = [
  { key: 'cards', label: 'Cartões', base: 1000 },
  { key: 'envelopes', label: 'Envelopes', base: 1200 },
  { key: 'letters', label: 'Cartas Berço', base: 1200 },
]

export function buildInventory(f: GlobalFilters): InventoryOverview {
  const rng = createRng(seedFor(f, 'inventory'))
  const factor = volumeFactor(f)
  const items: StockItem[] = ITEMS.map(({ key, label, base }) => {
    const total = Math.round(base * (0.9 + rng.next() * 0.2) * factor)
    const lost = Math.round(total * (0.03 + rng.next() * 0.04))
    const inTransit = Math.round(total * (0.1 + rng.next() * 0.1))
    return { key, label, total, lost, inTransit, available: total - lost - inTransit }
  })
  return { items, totalLost: items.reduce((sum, item) => sum + item.lost, 0) }
}

export function buildLossTrend(f: GlobalFilters): TrendPoint[] {
  const rng = createRng(seedFor(f, 'loss-trend'))
  const labels = periodLabels(f)
  const perPoint = buildInventory(f).totalLost / labels.length
  return labels.map((label) => ({ label, value: Math.round(perPoint * (0.7 + rng.next() * 0.6)) }))
}
```

`src/data/repositories/inventory.ts`:

```ts
import type { TrendPoint } from '@/data/types/card-processing'
import type { GlobalFilters } from '@/data/types/filters'
import type { InventoryOverview } from '@/data/types/inventory'

export interface InventoryRepository {
  getOverview(filters: GlobalFilters): Promise<InventoryOverview>
  getLossTrend(filters: GlobalFilters): Promise<TrendPoint[]>
}
```

`src/data/repositories/mock/inventory.ts`:

```ts
import { buildInventory, buildLossTrend } from '@/data/mock/inventory'
import { simulate } from '@/data/mock/simulate'
import type { InventoryRepository } from '@/data/repositories/inventory'

export const mockInventoryRepository: InventoryRepository = {
  getOverview: (filters) => simulate(() => buildInventory(filters)),
  getLossTrend: (filters) => simulate(() => buildLossTrend(filters)),
}
```

Em `src/data/repositories/index.ts`, importar `InventoryRepository` e `mockInventoryRepository`, acrescentar `inventory: InventoryRepository` à interface `Repositories` e `inventory: mockInventoryRepository` ao objeto exportado.

- [ ] **Step 4: Rodar tudo e ver passar**

Run: `npm test && npm run typecheck && npm run lint`
Expected: todos passam.

- [ ] **Step 5: Commit**

```bash
git add src/data && git commit -m "feat: add inventory mock data and repository

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 4: `DataTable` com TanStack Table (TDD)

**Files:**
- Modify: `package.json` (dependência `@tanstack/react-table`)
- Create: `src/shared/ui/DataTable.tsx`
- Test: `src/shared/ui/DataTable.test.tsx`

**Interfaces:**
- Produces (sem tipos do domínio; o TanStack fica escondido atrás de uma API simples, sem `any`):
  - `interface DataColumn<T> { id: string; header: string; cell: (row: T) => ReactNode; sortValue?: (row: T) => number | string; align?: 'left' | 'right' }`
  - `DataTable<T>({ columns: DataColumn<T>[]; data: T[]; caption: string })`: `<table>` com `<caption>` (visível), cabeçalhos `<th scope="col">`; colunas com `sortValue` ganham um `<button>` no cabeçalho que alterna crescente → decrescente → sem ordenação, e `aria-sort` (`ascending`, `descending` ou `none`) no `<th>`; sem linhas, mostra uma linha "Sem dados".

- [ ] **Step 1: Instalar a dependência**

```bash
npm i @tanstack/react-table@latest
```

- [ ] **Step 2: Escrever o teste que falha**

`src/shared/ui/DataTable.test.tsx`:

```tsx
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { DataTable, type DataColumn } from './DataTable'

interface Row {
  name: string
  qty: number
}
const data: Row[] = [
  { name: 'Beta', qty: 5 },
  { name: 'Alfa', qty: 20 },
  { name: 'Gama', qty: 1 },
]
const columns: DataColumn<Row>[] = [
  { id: 'name', header: 'Nome', cell: (r) => r.name, sortValue: (r) => r.name },
  { id: 'qty', header: 'Quantidade', cell: (r) => `${r.qty} un.`, sortValue: (r) => r.qty, align: 'right' },
  { id: 'note', header: 'Obs.', cell: () => '-' },
]

const bodyNames = () =>
  screen
    .getAllByRole('row')
    .slice(1)
    .map((row) => within(row).getAllByRole('cell')[0]?.textContent)

describe('DataTable', () => {
  it('renders caption, headers and custom cells', () => {
    render(<DataTable caption="Itens" columns={columns} data={data} />)
    expect(screen.getByRole('table', { name: 'Itens' })).toBeInTheDocument()
    expect(screen.getAllByRole('columnheader')).toHaveLength(3)
    expect(screen.getByText('20 un.')).toBeInTheDocument()
    expect(bodyNames()).toEqual(['Beta', 'Alfa', 'Gama'])
  })

  it('sorts ascending, descending and back to the original order', async () => {
    render(<DataTable caption="Itens" columns={columns} data={data} />)
    const header = screen.getByRole('columnheader', { name: /Quantidade/ })
    expect(header).toHaveAttribute('aria-sort', 'none')
    await userEvent.click(within(header).getByRole('button'))
    expect(bodyNames()).toEqual(['Gama', 'Beta', 'Alfa'])
    expect(header).toHaveAttribute('aria-sort', 'ascending')
    await userEvent.click(within(header).getByRole('button'))
    expect(bodyNames()).toEqual(['Alfa', 'Beta', 'Gama'])
    expect(header).toHaveAttribute('aria-sort', 'descending')
    await userEvent.click(within(header).getByRole('button'))
    expect(bodyNames()).toEqual(['Beta', 'Alfa', 'Gama'])
    expect(header).toHaveAttribute('aria-sort', 'none')
  })

  it('does not offer sorting on columns without a sortValue', () => {
    render(<DataTable caption="Itens" columns={columns} data={data} />)
    const header = screen.getByRole('columnheader', { name: 'Obs.' })
    expect(within(header).queryByRole('button')).not.toBeInTheDocument()
    expect(header).not.toHaveAttribute('aria-sort')
  })

  it('shows an empty state', () => {
    render(<DataTable caption="Itens" columns={columns} data={[]} />)
    expect(screen.getByText('Sem dados')).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Rodar e ver falhar**

Run: `npx vitest run src/shared/ui/DataTable.test.tsx`
Expected: FAIL (módulo `./DataTable` não existe).

- [ ] **Step 4: Implementar**

`src/shared/ui/DataTable.tsx`:

```tsx
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'

export interface DataColumn<T> {
  id: string
  header: string
  cell: (row: T) => ReactNode
  sortValue?: (row: T) => number | string
  align?: 'left' | 'right'
}

interface DataTableProps<T> {
  columns: DataColumn<T>[]
  data: T[]
  caption: string
}

const ARIA_SORT = { asc: 'ascending', desc: 'descending' } as const

export function DataTable<T>({ columns, data, caption }: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([])

  const defs = useMemo<ColumnDef<T>[]>(
    () =>
      columns.map((c) => ({
        id: c.id,
        header: c.header,
        enableSorting: c.sortValue !== undefined,
        accessorFn: (row: T) => c.sortValue?.(row) ?? '',
        cell: ({ row }) => c.cell(row.original),
      })),
    [columns],
  )
  const byId = useMemo(() => new Map(columns.map((c) => [c.id, c])), [columns])

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table não é compatível com o React Compiler; sem memoização automática aqui
  const table = useReactTable({
    data,
    columns: defs,
    state: { sorting },
    onSortingChange: setSorting,
    sortDescFirst: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const rows = table.getRowModel().rows
  const alignClass = (id: string) => (byId.get(id)?.align === 'right' ? 'text-right' : 'text-left')

  return (
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
              <td colSpan={columns.length} className="px-3 py-4 text-center text-slate-500">
                Sem dados
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className={`px-3 py-2 tabular-nums ${alignClass(cell.column.id)}`}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 5: Rodar tudo e ver passar**

Run: `npm test && npm run typecheck && npm run lint && npm run build`
Expected: todos passam. Ajustes aceitáveis sem replanejar: se o `eslint-disable` de `react-hooks/incompatible-library` não existir na versão instalada do plugin (regra desconhecida gera erro), removê-lo; se a regra existir e emitir apenas warning sem o comentário, mantê-lo. O `sortDescFirst: false` garante que o primeiro clique ordene de forma crescente também em colunas numéricas (o padrão do TanStack é decrescente primeiro para números). Se o terceiro clique não voltar à ordem original, garantir `enableSortingRemoval: true` em `useReactTable`. Registrar qualquer ajuste no relatório.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/shared/ui && git commit -m "feat: add sortable DataTable on TanStack Table

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 5: `GroupedBarChartCard` (TDD)

**Files:**
- Create: `src/shared/charts/GroupedBarChartCard.tsx`
- Test: `src/shared/charts/GroupedBarChartCard.test.tsx`

**Interfaces:**
- Consumes: `CHART_CARD_CLASS`, `AXIS_TICK`, `GRID_STROKE`, `TOOLTIP_STYLE` (`./chartTheme`; confira os nomes reais em `src/shared/charts/chartTheme.ts`), `formatNumber`.
- Produces:
  - `interface GroupedSeries { key: string; label: string; color: string }`
  - `interface GroupedDatum { label: string; [seriesKey: string]: string | number }`
  - `GroupedBarChartCard({ title?: string; series: GroupedSeries[]; data: GroupedDatum[]; height?: number })`: uma barra por série em cada categoria, com legenda; o wrapper tem `role="img"` e `aria-label` no formato `"<categoria>: <série> <valor>, <série> <valor>; ..."` (valores com `formatNumber`).

- [ ] **Step 1: Escrever o teste que falha**

`src/shared/charts/GroupedBarChartCard.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { GroupedBarChartCard } from './GroupedBarChartCard'

afterEach(() => vi.restoreAllMocks())

const series = [
  { key: 'unlocked', label: 'Desbloqueados', color: '#10b981' },
  { key: 'locked', label: 'Bloqueados', color: '#ef4444' },
]
const data = [
  { label: 'Norte', unlocked: 1500, locked: 300 },
  { label: 'Sul', unlocked: 3000, locked: 400 },
]

describe('GroupedBarChartCard', () => {
  it('renders the title, an svg and an accessible summary of every series', () => {
    const error = vi.spyOn(console, 'error')
    const warn = vi.spyOn(console, 'warn')
    const { container } = render(<GroupedBarChartCard title="Por região" series={series} data={data} />)
    expect(screen.getByRole('heading', { name: 'Por região' })).toBeInTheDocument()
    expect(container.querySelector('svg')).not.toBeNull()
    const summary = screen.getByRole('img')
    expect(summary).toHaveAccessibleName(/Norte: Desbloqueados 1\.500, Bloqueados 300/)
    expect(summary).toHaveAccessibleName(/Sul: Desbloqueados 3\.000, Bloqueados 400/)
    expect(error).not.toHaveBeenCalled()
    expect(warn).not.toHaveBeenCalled()
  })

  it('works without a title', () => {
    render(<GroupedBarChartCard series={series} data={data} />)
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/shared/charts/GroupedBarChartCard.test.tsx`
Expected: FAIL (módulo inexistente).

- [ ] **Step 3: Implementar**

`src/shared/charts/GroupedBarChartCard.tsx`:

```tsx
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatNumber } from '@/shared/lib/formatters'
import { AXIS_TICK, CHART_CARD_CLASS, GRID_STROKE, TOOLTIP_STYLE } from './chartTheme'

export interface GroupedSeries {
  key: string
  label: string
  color: string
}

export interface GroupedDatum {
  label: string
  [seriesKey: string]: string | number
}

interface GroupedBarChartCardProps {
  title?: string
  series: GroupedSeries[]
  data: GroupedDatum[]
  height?: number
}

const describe = (series: GroupedSeries[], data: GroupedDatum[]): string =>
  data
    .map((row) => {
      const values = series.map((s) => `${s.label} ${formatNumber(Number(row[s.key] ?? 0))}`)
      return `${row.label}: ${values.join(', ')}`
    })
    .join('; ')

export function GroupedBarChartCard({ title, series, data, height = 280 }: GroupedBarChartCardProps) {
  return (
    <section className={CHART_CARD_CLASS}>
      {title && <h3 className="mb-2 text-base font-semibold">{title}</h3>}
      <div role="img" aria-label={describe(series, data)} style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={AXIS_TICK} />
            <YAxis tick={AXIS_TICK} tickFormatter={(v) => formatNumber(Number(v))} />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => formatNumber(Number(value))} />
            <Legend />
            {series.map((s) => (
              <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Rodar tudo e ver passar**

Run: `npm test && npm run typecheck && npm run lint`
Expected: todos passam, sem `console.error`/`console.warn`. Se algum dos nomes `AXIS_TICK`, `GRID_STROKE`, `TOOLTIP_STYLE` diferir em `chartTheme.ts`, usar os nomes reais e registrar. Se o nome local `describe` colidir com o `describe` global do Vitest (não colide aqui, pois o arquivo de componente não importa o Vitest), renomear para `summarize`.

- [ ] **Step 5: Commit**

```bash
git add src/shared/charts && git commit -m "feat: add GroupedBarChartCard

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 6: `RegionMap` com react-leaflet (TDD)

**Files:**
- Modify: `package.json` (dependências `leaflet`, `react-leaflet`, `@types/leaflet`)
- Create: `src/shared/maps/RegionMap.tsx`
- Test: `src/shared/maps/RegionMap.test.tsx`

**Interfaces:**
- Consumes: `CHART_CARD_CLASS` (`@/shared/charts/chartTheme`).
- Produces:
  - `interface MapPoint { id: string; label: string; lat: number; lng: number; value: number; detail: string }`
  - `defaultColorFor(value: number): string` (`>= 85` verde `#10b981`, `>= 75` âmbar `#f59e0b`, senão vermelho `#ef4444`)
  - `RegionMap({ title: string; points: MapPoint[]; format?: (value: number) => string; colorFor?: (value: number) => string; height?: number })`: mapa centrado no Brasil (`[-14.2, -51.9]`, zoom 4, sem zoom por scroll) com um `CircleMarker` por ponto (raio `10 + value / 10`, cor por `colorFor`, `Popup` com rótulo, valor formatado e `detail`), `role="region"` com `aria-label="Mapa: <title>"` e uma lista `<ul aria-label="Valores: <title>">` com `"<rótulo>: <valor formatado>"` por ponto (alternativa textual ao mapa).

- [ ] **Step 1: Instalar as dependências**

```bash
npm i leaflet@latest react-leaflet@latest
npm i -D @types/leaflet@latest
```

- [ ] **Step 2: Escrever o teste que falha**

O jsdom não suporta o renderizador SVG/canvas do Leaflet; por isso o teste mocka `react-leaflet` **neste arquivo apenas**.

`src/shared/maps/RegionMap.test.tsx`:

```tsx
import { render, screen, within } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { RegionMap, defaultColorFor, type MapPoint } from './RegionMap'

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: ReactNode }) => <div data-testid="map">{children}</div>,
  TileLayer: () => null,
  CircleMarker: ({ children, center, radius }: { children: ReactNode; center: [number, number]; radius: number }) => (
    <div data-testid="marker" data-center={center.join(',')} data-radius={radius}>
      {children}
    </div>
  ),
  Popup: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

const points: MapPoint[] = [
  { id: 'norte', label: 'Norte', lat: -3.4, lng: -60, value: 83.3, detail: '1.500 desbloqueados' },
  { id: 'sul', label: 'Sul', lat: -27, lng: -51.5, value: 88.2, detail: '3.000 desbloqueados' },
]
const format = (v: number) => `${v.toFixed(1)}%`

describe('RegionMap', () => {
  it('renders an accessible region with a title and one marker per point', () => {
    render(<RegionMap title="Taxa de desbloqueio" points={points} format={format} />)
    expect(screen.getByRole('heading', { name: 'Taxa de desbloqueio' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Mapa: Taxa de desbloqueio' })).toBeInTheDocument()
    const markers = screen.getAllByTestId('marker')
    expect(markers).toHaveLength(2)
    expect(markers[0]).toHaveAttribute('data-center', '-3.4,-60')
    expect(markers[1]).toHaveTextContent('3.000 desbloqueados')
  })

  it('scales the marker radius with the value', () => {
    render(<RegionMap title="Mapa" points={points} format={format} />)
    const [norte, sul] = screen.getAllByTestId('marker')
    expect(Number(sul?.getAttribute('data-radius'))).toBeGreaterThan(Number(norte?.getAttribute('data-radius')))
  })

  it('offers a textual alternative with formatted values', () => {
    render(<RegionMap title="Mapa" points={points} format={format} />)
    const list = screen.getByRole('list', { name: 'Valores: Mapa' })
    expect(within(list).getByText('Norte: 83.3%')).toBeInTheDocument()
    expect(within(list).getByText('Sul: 88.2%')).toBeInTheDocument()
  })
})

describe('defaultColorFor', () => {
  it('maps value bands to colors', () => {
    expect(defaultColorFor(90)).toBe('#10b981')
    expect(defaultColorFor(80)).toBe('#f59e0b')
    expect(defaultColorFor(50)).toBe('#ef4444')
  })
})
```

- [ ] **Step 3: Rodar e ver falhar**

Run: `npx vitest run src/shared/maps`
Expected: FAIL (módulo `./RegionMap` não existe).

- [ ] **Step 4: Implementar**

`src/shared/maps/RegionMap.tsx`:

```tsx
import 'leaflet/dist/leaflet.css'
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet'
import { CHART_CARD_CLASS } from '@/shared/charts/chartTheme'

export interface MapPoint {
  id: string
  label: string
  lat: number
  lng: number
  value: number
  detail: string
}

interface RegionMapProps {
  title: string
  points: MapPoint[]
  format?: (value: number) => string
  colorFor?: (value: number) => string
  height?: number
}

export const defaultColorFor = (value: number): string =>
  value >= 85 ? '#10b981' : value >= 75 ? '#f59e0b' : '#ef4444'

const BRAZIL_CENTER: [number, number] = [-14.2, -51.9]

export function RegionMap({
  title,
  points,
  format = (value) => String(value),
  colorFor = defaultColorFor,
  height = 320,
}: RegionMapProps) {
  return (
    <section className={CHART_CARD_CLASS}>
      <h3 className="mb-2 text-base font-semibold">{title}</h3>
      <div role="region" aria-label={`Mapa: ${title}`} style={{ height }} className="overflow-hidden rounded-lg">
        <MapContainer center={BRAZIL_CENTER} zoom={4} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {points.map((p) => (
            <CircleMarker
              key={p.id}
              center={[p.lat, p.lng]}
              radius={10 + p.value / 10}
              pathOptions={{ color: colorFor(p.value), fillColor: colorFor(p.value), fillOpacity: 0.6 }}
            >
              <Popup>
                <strong>{p.label}</strong>: {format(p.value)}
                <br />
                {p.detail}
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
      <ul aria-label={`Valores: ${title}`} className="mt-2 grid grid-cols-1 gap-1 text-xs sm:grid-cols-2">
        {points.map((p) => (
          <li key={p.id} className="flex items-center gap-2">
            <span aria-hidden className="size-3 shrink-0 rounded-full" style={{ backgroundColor: colorFor(p.value) }} />
            {`${p.label}: ${format(p.value)}`}
          </li>
        ))}
      </ul>
    </section>
  )
}
```

- [ ] **Step 5: Rodar tudo e ver passar**

Run: `npm test && npm run typecheck && npm run lint && npm run build`
Expected: todos passam. Se a fábrica do `vi.mock` com JSX falhar por ordem de içamento, trocar o JSX por `createElement` importado de `react` dentro da fábrica e registrar o desvio. Confirmar no `build` que `leaflet` fica fora do bundle principal (será carregado junto da página financeira, que é lazy).

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/shared/maps && git commit -m "feat: add RegionMap on react-leaflet with circle markers

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 7: Hooks e KPIs da página financeira (TDD)

**Files:**
- Create: `src/features/financial/api.ts`, `src/features/financial/kpis.ts`, `src/features/financial/FinancialKpis.tsx`
- Test: `src/features/financial/FinancialKpis.test.tsx`

**Interfaces:**
- Consumes: `useDomainQuery` (`@/app/data/useDomainQuery`), `repositories.financial`, `KPICard`, `QueryBoundary`, `Skeleton`, formatters.
- Produces:
  - `useFinancialOverview()`, `useUnlockByRegion()`, `useUsageEvolution()` (via `useDomainQuery('financial', ...)`)
  - `type FinancialKpi = 'usage' | 'total' | 'average' | 'logistics'` e `FIN_KPI_META: Record<FinancialKpi, { title: string; detailsTitle: string }>` com: `usage` → `Taxa de Utilização` / `Detalhamento - Utilização do Limite`; `total` → `Valor Total Utilizado` / `Detalhamento - Distribuição de Utilização`; `average` → `Média de Uso` / `Detalhamento - Média de Uso por Cliente`; `logistics` → `Custos Logísticos` / `Detalhamento - Custos Logísticos`
  - `FinancialKpis({ onSelect: (kpi: FinancialKpi) => void })`: 4 `KPICard` clicáveis. Valores: `usage` = `formatPercentage(limitUsage.ratePercent)` com hint `formatCurrency(usedAmount)` (ícone `Percent`, accent `teal`); `total` = `formatCurrency(usedAmount)` com hint `"<N> clientes acima de 75%"` onde N é `customers` da última faixa (`76-100%`) formatado com `formatNumber` (ícone `Banknote`, `purple`); `average` = `formatCurrency(averageUsage)` com hint `Por cliente` (ícone `Calculator`, `orange`); `logistics` = `formatCurrency(logistics.totalAmount)` com hint `"<unitTotal em BRL> por cartão"` (ícone `Truck`, `pink`).

- [ ] **Step 1: Escrever o teste que falha**

`src/features/financial/FinancialKpis.test.tsx`:

```tsx
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildFinancialOverview } from '@/data/mock/financial'
import { DEFAULT_FILTERS } from '@/data/types/filters'
import { formatCurrency, formatNumber, formatPercentage } from '@/shared/lib/formatters'
import { renderWithProviders } from '@/test/renderWithProviders'
import { FinancialKpis } from './FinancialKpis'

// Intl usa espaço não separável (U+00A0); o Testing Library normaliza o texto do DOM para espaço comum.
const norm = (text: string) => text.replace(/ /g, ' ')
const o = buildFinancialOverview(DEFAULT_FILTERS)
const url = '/?delay=0'

describe('FinancialKpis', () => {
  beforeEach(() => window.history.replaceState({}, '', url))

  it('shows the four KPIs with formatted values and hints', async () => {
    renderWithProviders(<FinancialKpis onSelect={vi.fn()} />, { url })
    const cards = await screen.findAllByRole('article')
    expect(cards).toHaveLength(4)
    expect(within(cards[0]!).getByText('Taxa de Utilização')).toBeInTheDocument()
    expect(within(cards[0]!).getByText(norm(formatPercentage(o.limitUsage.ratePercent)))).toBeInTheDocument()
    expect(within(cards[0]!).getByText(norm(formatCurrency(o.limitUsage.usedAmount)))).toBeInTheDocument()
    expect(within(cards[1]!).getByText('Valor Total Utilizado')).toBeInTheDocument()
    const top = o.usageByRange.at(-1)!.customers
    expect(within(cards[1]!).getByText(`${formatNumber(top)} clientes acima de 75%`)).toBeInTheDocument()
    expect(within(cards[2]!).getByText(norm(formatCurrency(o.limitUsage.averageUsage)))).toBeInTheDocument()
    expect(within(cards[2]!).getByText('Por cliente')).toBeInTheDocument()
    expect(within(cards[3]!).getByText(norm(formatCurrency(o.logistics.totalAmount)))).toBeInTheDocument()
    expect(within(cards[3]!).getByText(norm(`${formatCurrency(o.logistics.unitTotal)} por cartão`))).toBeInTheDocument()
  })

  it('reports which KPI was selected', async () => {
    const onSelect = vi.fn()
    renderWithProviders(<FinancialKpis onSelect={onSelect} />, { url })
    await screen.findAllByRole('article')
    await userEvent.click(screen.getByRole('button', { name: /^Média de Uso/ }))
    expect(onSelect).toHaveBeenCalledWith('average')
    await userEvent.click(screen.getByRole('button', { name: /^Custos Logísticos/ }))
    expect(onSelect).toHaveBeenCalledWith('logistics')
  })

  it('shows the error state', async () => {
    window.history.replaceState({}, '', '/?delay=0&error=1')
    renderWithProviders(<FinancialKpis onSelect={vi.fn()} />, { url: '/?delay=0&error=1' })
    expect(await screen.findByRole('alert')).toHaveTextContent('Falha simulada')
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/features/financial/FinancialKpis.test.tsx`
Expected: FAIL (módulos inexistentes).

- [ ] **Step 3: Implementar**

`src/features/financial/api.ts`:

```ts
import { useDomainQuery } from '@/app/data/useDomainQuery'
import { repositories } from '@/data/repositories'

const repo = repositories.financial

export const useFinancialOverview = () =>
  useDomainQuery('financial', 'overview', (f) => repo.getOverview(f))
export const useUnlockByRegion = () =>
  useDomainQuery('financial', 'unlock', (f) => repo.getUnlockByRegion(f))
export const useUsageEvolution = () =>
  useDomainQuery('financial', 'evolution', (f) => repo.getUsageEvolution(f))
```

`src/features/financial/kpis.ts`:

```ts
export type FinancialKpi = 'usage' | 'total' | 'average' | 'logistics'

export const FIN_KPI_META: Record<FinancialKpi, { title: string; detailsTitle: string }> = {
  usage: { title: 'Taxa de Utilização', detailsTitle: 'Detalhamento - Utilização do Limite' },
  total: { title: 'Valor Total Utilizado', detailsTitle: 'Detalhamento - Distribuição de Utilização' },
  average: { title: 'Média de Uso', detailsTitle: 'Detalhamento - Média de Uso por Cliente' },
  logistics: { title: 'Custos Logísticos', detailsTitle: 'Detalhamento - Custos Logísticos' },
}
```

`src/features/financial/FinancialKpis.tsx`:

```tsx
import { Banknote, Calculator, Percent, Truck } from 'lucide-react'
import { formatCurrency, formatNumber, formatPercentage } from '@/shared/lib/formatters'
import { KPICard } from '@/shared/ui/KPICard'
import { QueryBoundary } from '@/shared/ui/QueryBoundary'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useFinancialOverview } from './api'
import { FIN_KPI_META, type FinancialKpi } from './kpis'

const GRID = 'grid gap-4 sm:grid-cols-2 xl:grid-cols-4'

export function FinancialKpis({ onSelect }: { onSelect: (kpi: FinancialKpi) => void }) {
  const query = useFinancialOverview()
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
      {({ limitUsage, usageByRange, logistics }) => {
        const topRange = usageByRange.at(-1)
        return (
          <div className={GRID}>
            <KPICard
              label={FIN_KPI_META.usage.title}
              value={formatPercentage(limitUsage.ratePercent)}
              hint={formatCurrency(limitUsage.usedAmount)}
              icon={Percent}
              accent="teal"
              onSelect={() => onSelect('usage')}
            />
            <KPICard
              label={FIN_KPI_META.total.title}
              value={formatCurrency(limitUsage.usedAmount)}
              hint={`${formatNumber(topRange?.customers ?? 0)} clientes acima de 75%`}
              icon={Banknote}
              accent="purple"
              onSelect={() => onSelect('total')}
            />
            <KPICard
              label={FIN_KPI_META.average.title}
              value={formatCurrency(limitUsage.averageUsage)}
              hint="Por cliente"
              icon={Calculator}
              accent="orange"
              onSelect={() => onSelect('average')}
            />
            <KPICard
              label={FIN_KPI_META.logistics.title}
              value={formatCurrency(logistics.totalAmount)}
              hint={`${formatCurrency(logistics.unitTotal)} por cartão`}
              icon={Truck}
              accent="pink"
              onSelect={() => onSelect('logistics')}
            />
          </div>
        )
      }}
    </QueryBoundary>
  )
}
```

- [ ] **Step 4: Rodar tudo e ver passar**

Run: `npm test && npm run typecheck && npm run lint`
Expected: todos passam. Se `Percent`, `Banknote`, `Calculator` ou `Truck` não existirem na versão instalada do `lucide-react`, usar o ícone equivalente mais próximo e registrar.

- [ ] **Step 5: Commit**

```bash
git add src/features/financial && git commit -m "feat: add financial data hooks and KPI cards

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 8: Conteúdo dos modais de detalhe financeiros (TDD)

**Files:**
- Create: `src/features/financial/FinancialDetails.tsx`
- Test: `src/features/financial/FinancialDetails.test.tsx`

**Interfaces:**
- Consumes: `useFinancialOverview` (Task 7), `FinancialKpi` (Task 7), `PieChartCard`, `BarChartCard`, `GroupedBarChartCard`, `ACCENT_HEX`, `DataTable`/`DataColumn` (Task 4), `SummaryStat`, `QueryBoundary`, formatters, `CostByStatus`.
- Produces: `FinancialDetails({ kpi }: { kpi: FinancialKpi })` com o conteúdo por KPI (títulos dos gráficos e da tabela exatamente como nos testes):
  - `usage`: `PieChartCard` `Distribuição do Limite de Crédito` (uma fatia por faixa, valor = `customers`) e três `SummaryStat`: `Limite utilizado`, `Limite disponível` (`totalAmount - usedAmount`), `Limite total`, todos em BRL
  - `total`: `BarChartCard` `Clientes por faixa de utilização` (rótulo = faixa, valor = `customers`)
  - `average`: `GroupedBarChartCard` `Uso médio por faixa` com as séries `Uso médio` (`average`, roxo) e `Disponível médio` (`averageAvailable`, verde)
  - `logistics`: `BarChartCard` `Composição do custo por cartão` (Cartão, Envelope, Carta, Envio, com os valores de `logistics.unit`) e `DataTable` de legenda `Custos por status` com as colunas `Status`, `Cartões`, `Valor total`, `Custo por cartão`, `Disponível por cartão` e `Percentual` (participação do `amount` no `totalAmount`, 1 casa); todas as colunas numéricas ordenáveis

- [ ] **Step 1: Escrever o teste que falha**

`src/features/financial/FinancialDetails.test.tsx`:

```tsx
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { buildFinancialOverview } from '@/data/mock/financial'
import { DEFAULT_FILTERS } from '@/data/types/filters'
import { formatCurrency, formatNumber } from '@/shared/lib/formatters'
import { renderWithProviders } from '@/test/renderWithProviders'
import { FinancialDetails } from './FinancialDetails'

const norm = (text: string) => text.replace(/ /g, ' ')
const o = buildFinancialOverview(DEFAULT_FILTERS)
const url = '/?delay=0'
const heading = (name: string) => screen.findByRole('heading', { name })

describe('FinancialDetails', () => {
  beforeEach(() => window.history.replaceState({}, '', url))

  it('usage: pie of the credit limit distribution and the limit summary', async () => {
    renderWithProviders(<FinancialDetails kpi="usage" />, { url })
    expect(await heading('Distribuição do Limite de Crédito')).toBeInTheDocument()
    expect(screen.getByText('Limite utilizado')).toBeInTheDocument()
    expect(screen.getByText(norm(formatCurrency(o.limitUsage.usedAmount)))).toBeInTheDocument()
    const available = o.limitUsage.totalAmount - o.limitUsage.usedAmount
    expect(screen.getByText(norm(formatCurrency(available)))).toBeInTheDocument()
    expect(screen.getByText('Limite total')).toBeInTheDocument()
  })

  it('total: bar of customers per range', async () => {
    renderWithProviders(<FinancialDetails kpi="total" />, { url })
    expect(await heading('Clientes por faixa de utilização')).toBeInTheDocument()
    const first = o.usageByRange[0]!
    expect(screen.getByRole('img', { name: new RegExp(`${first.range}: ${formatNumber(first.customers)}`) })).toBeInTheDocument()
  })

  it('average: grouped bars of average and available usage', async () => {
    renderWithProviders(<FinancialDetails kpi="average" />, { url })
    expect(await heading('Uso médio por faixa')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /Uso médio .*Disponível médio/ })).toBeInTheDocument()
  })

  it('logistics: cost composition and a sortable costs-by-status table', async () => {
    renderWithProviders(<FinancialDetails kpi="logistics" />, { url })
    expect(await heading('Composição do custo por cartão')).toBeInTheDocument()
    const table = await screen.findByRole('table', { name: 'Custos por status' })
    expect(within(table).getAllByRole('columnheader')).toHaveLength(6)
    expect(within(table).getAllByRole('row')).toHaveLength(1 + o.logistics.byStatus.length)
    expect(within(table).getByText('Entregue')).toBeInTheDocument()
    const biggest = [...o.logistics.byStatus].sort((a, b) => b.count - a.count)[0]!
    await userEvent.click(within(table).getByRole('button', { name: /Cartões/ }))
    await userEvent.click(within(table).getByRole('button', { name: /Cartões/ }))
    const firstRow = within(table).getAllByRole('row')[1]!
    expect(within(firstRow).getByText(biggest.status)).toBeInTheDocument()
  })

  it('shows the error state', async () => {
    window.history.replaceState({}, '', '/?delay=0&error=1')
    renderWithProviders(<FinancialDetails kpi="usage" />, { url: '/?delay=0&error=1' })
    expect(await screen.findByRole('alert')).toHaveTextContent('Falha simulada')
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/features/financial/FinancialDetails.test.tsx`
Expected: FAIL (módulo `./FinancialDetails` não existe).

- [ ] **Step 3: Implementar**

`src/features/financial/FinancialDetails.tsx`:

```tsx
import { useMemo } from 'react'
import type { CostByStatus } from '@/data/types/financial'
import { ACCENT_HEX } from '@/shared/charts/chartTheme'
import { BarChartCard } from '@/shared/charts/BarChartCard'
import { GroupedBarChartCard } from '@/shared/charts/GroupedBarChartCard'
import { PieChartCard } from '@/shared/charts/PieChartCard'
import { formatCurrency, formatNumber, formatPercentage } from '@/shared/lib/formatters'
import { DataTable, type DataColumn } from '@/shared/ui/DataTable'
import { QueryBoundary } from '@/shared/ui/QueryBoundary'
import { SummaryStat } from '@/shared/ui/SummaryStat'
import { useFinancialOverview } from './api'
import type { FinancialKpi } from './kpis'

function CostsTable({ rows, total }: { rows: CostByStatus[]; total: number }) {
  const columns = useMemo<DataColumn<CostByStatus>[]>(
    () => [
      { id: 'status', header: 'Status', cell: (r) => r.status, sortValue: (r) => r.status },
      { id: 'count', header: 'Cartões', cell: (r) => formatNumber(r.count), sortValue: (r) => r.count, align: 'right' },
      { id: 'amount', header: 'Valor total', cell: (r) => formatCurrency(r.amount), sortValue: (r) => r.amount, align: 'right' },
      { id: 'cost', header: 'Custo por cartão', cell: (r) => formatCurrency(r.costPerCard), sortValue: (r) => r.costPerCard, align: 'right' },
      { id: 'available', header: 'Disponível por cartão', cell: (r) => formatCurrency(r.availablePerCard), sortValue: (r) => r.availablePerCard, align: 'right' },
      {
        id: 'share',
        header: 'Percentual',
        cell: (r) => formatPercentage(total === 0 ? 0 : (r.amount / total) * 100, 1),
        sortValue: (r) => r.amount,
        align: 'right',
      },
    ],
    [total],
  )
  return <DataTable caption="Custos por status" columns={columns} data={rows} />
}

export function FinancialDetails({ kpi }: { kpi: FinancialKpi }) {
  const query = useFinancialOverview()
  return (
    <QueryBoundary query={query}>
      {({ limitUsage, usageByRange, logistics }) => {
        if (kpi === 'usage') {
          return (
            <div className="space-y-4">
              <PieChartCard
                title="Distribuição do Limite de Crédito"
                data={usageByRange.map((r) => ({ label: r.range, value: r.customers }))}
              />
              <div className="grid gap-3 sm:grid-cols-3">
                <SummaryStat label="Limite utilizado" value={formatCurrency(limitUsage.usedAmount)} tone="blue" />
                <SummaryStat
                  label="Limite disponível"
                  value={formatCurrency(limitUsage.totalAmount - limitUsage.usedAmount)}
                  tone="green"
                />
                <SummaryStat label="Limite total" value={formatCurrency(limitUsage.totalAmount)} tone="blue" />
              </div>
            </div>
          )
        }
        if (kpi === 'total') {
          return (
            <BarChartCard
              title="Clientes por faixa de utilização"
              data={usageByRange.map((r) => ({ label: r.range, value: r.customers }))}
            />
          )
        }
        if (kpi === 'average') {
          return (
            <GroupedBarChartCard
              title="Uso médio por faixa"
              series={[
                { key: 'average', label: 'Uso médio', color: ACCENT_HEX.purple },
                { key: 'available', label: 'Disponível médio', color: ACCENT_HEX.green },
              ]}
              data={usageByRange.map((r) => ({
                label: r.range,
                average: r.average,
                available: r.averageAvailable,
              }))}
            />
          )
        }
        return (
          <div className="space-y-4">
            <BarChartCard
              title="Composição do custo por cartão"
              data={[
                { label: 'Cartão', value: logistics.unit.card },
                { label: 'Envelope', value: logistics.unit.envelope },
                { label: 'Carta', value: logistics.unit.letter },
                { label: 'Envio', value: logistics.unit.shipping },
              ]}
            />
            <CostsTable rows={logistics.byStatus} total={logistics.totalAmount} />
          </div>
        )
      }}
    </QueryBoundary>
  )
}
```

- [ ] **Step 4: Rodar tudo e ver passar**

Run: `npm test && npm run typecheck && npm run lint`
Expected: todos passam. Se a colunas do teste (`getByRole('button', { name: /Cartões/ })`) casar com mais de um botão por causa do nome "Custo por cartão" (não casa, pois a expressão diferencia maiúsculas: `Cartões` com "ões"), manter; se casar, usar `{ name: 'Cartões' }` exato. O segundo clique deixa a coluna em ordem decrescente, então a primeira linha é a de maior quantidade.

- [ ] **Step 5: Commit**

```bash
git add src/features/financial && git commit -m "feat: add financial KPI details content

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 9: Seção por região, evolução e página financeira (TDD)

**Files:**
- Create: `src/features/financial/UnlockByRegion.tsx`, `src/features/financial/UsageEvolution.tsx`, `src/features/financial/FinancialPage.tsx`
- Modify: `src/app/routes.tsx`, `src/app/layout/AppLayout.test.tsx`
- Test: `src/features/financial/UnlockByRegion.test.tsx`, `src/features/financial/FinancialPage.test.tsx`

**Interfaces:**
- Consumes: `useUnlockByRegion`/`useUsageEvolution` (Task 7), `FinancialKpis`/`FIN_KPI_META` (Task 7), `FinancialDetails` (Task 8), `RegionMap` (Task 6), `GroupedBarChartCard` (Task 5), `LineChartCard`, `Modal`, `AgreementFilters`, `renderWithProviders`.
- Produces:
  - `UnlockByRegion()`: `RegionMap` `Taxa de Desbloqueio de Cartões por Região` (valor do ponto = `unlocked / (unlocked + locked) * 100`, formatado com `formatPercentage(v, 1)`; `detail` = `"<N> desbloqueados, <M> bloqueados"`) e `GroupedBarChartCard` `Comparativo Desbloqueios vs. Bloqueios por Região` (séries `Desbloqueados` verde e `Bloqueados` vermelho)
  - `UsageEvolution()`: `LineChartCard` `Evolução da Utilização Média (em R$ mil)`
  - `FinancialPage` (export nomeado): `h1` `Desempenho Financeiro`, `AgreementFilters`, `FinancialKpis`, `UnlockByRegion`, `UsageEvolution` e um `Modal` (`wide`) que mostra `FinancialDetails` com o título `FIN_KPI_META[kpi].detailsTitle`
  - Rota `/financial` passa a carregar `FinancialPage` por `lazy` (como `card-processing`)

- [ ] **Step 1: Escrever os testes que falham**

`src/features/financial/UnlockByRegion.test.tsx`:

```tsx
import { screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/renderWithProviders'
import { UnlockByRegion } from './UnlockByRegion'

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TileLayer: () => null,
  CircleMarker: ({ children }: { children: ReactNode }) => <div data-testid="marker">{children}</div>,
  Popup: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

describe('UnlockByRegion', () => {
  beforeEach(() => window.history.replaceState({}, '', '/?delay=0'))

  it('shows the map and the grouped comparison for the five regions', async () => {
    renderWithProviders(<UnlockByRegion />, { url: '/?delay=0' })
    expect(await screen.findByRole('heading', { name: 'Taxa de Desbloqueio de Cartões por Região' })).toBeInTheDocument()
    expect(await screen.findAllByTestId('marker')).toHaveLength(5)
    expect(screen.getByRole('heading', { name: 'Comparativo Desbloqueios vs. Bloqueios por Região' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /Norte: Desbloqueados .*Bloqueados/ })).toBeInTheDocument()
    expect(screen.getByRole('list', { name: /Valores: Taxa de Desbloqueio/ })).toHaveTextContent(/Sudeste: \d+,\d%/)
  })

  it('follows the region filter', async () => {
    renderWithProviders(<UnlockByRegion />, { url: '/?delay=0&region=sul' })
    expect(await screen.findAllByTestId('marker')).toHaveLength(1)
  })

  it('shows the error state', async () => {
    window.history.replaceState({}, '', '/?delay=0&error=1')
    renderWithProviders(<UnlockByRegion />, { url: '/?delay=0&error=1' })
    expect((await screen.findAllByRole('alert')).length).toBeGreaterThan(0)
  })
})
```

`src/features/financial/FinancialPage.test.tsx`:

```tsx
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/renderWithProviders'
import { FinancialPage } from './FinancialPage'

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TileLayer: () => null,
  CircleMarker: ({ children }: { children: ReactNode }) => <div data-testid="marker">{children}</div>,
  Popup: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

const url = '/?delay=0'

describe('FinancialPage', () => {
  beforeEach(() => window.history.replaceState({}, '', url))

  it('renders the heading, filters, KPIs, regional section and evolution', async () => {
    renderWithProviders(<FinancialPage />, { url })
    expect(screen.getByRole('heading', { level: 1, name: 'Desempenho Financeiro' })).toBeInTheDocument()
    expect(await screen.findAllByRole('article')).toHaveLength(4)
    expect(await screen.findByLabelText('Categoria')).toBeInTheDocument()
    expect(await screen.findAllByTestId('marker')).toHaveLength(5)
    expect(await screen.findByRole('heading', { name: 'Evolução da Utilização Média (em R$ mil)' })).toBeInTheDocument()
  })

  it('opens the details of a KPI in a dialog and closes it with Escape', async () => {
    renderWithProviders(<FinancialPage />, { url })
    await userEvent.click(await screen.findByRole('button', { name: /^Custos Logísticos/ }))
    const dialog = await screen.findByRole('dialog', { name: 'Detalhamento - Custos Logísticos' })
    expect(await within(dialog).findByRole('table', { name: 'Custos por status' })).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows error alerts when the repository fails', async () => {
    window.history.replaceState({}, '', '/?delay=0&error=1')
    renderWithProviders(<FinancialPage />, { url: '/?delay=0&error=1' })
    expect((await screen.findAllByRole('alert')).length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/features/financial/UnlockByRegion.test.tsx src/features/financial/FinancialPage.test.tsx`
Expected: FAIL (módulos inexistentes).

- [ ] **Step 3: Implementar as seções e a página**

`src/features/financial/UnlockByRegion.tsx`:

```tsx
import { ACCENT_HEX } from '@/shared/charts/chartTheme'
import { GroupedBarChartCard } from '@/shared/charts/GroupedBarChartCard'
import { formatNumber, formatPercentage } from '@/shared/lib/formatters'
import { RegionMap } from '@/shared/maps/RegionMap'
import { QueryBoundary } from '@/shared/ui/QueryBoundary'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useUnlockByRegion } from './api'

export function UnlockByRegion() {
  const query = useUnlockByRegion()
  return (
    <QueryBoundary query={query} skeleton={<Skeleton className="h-80" />}>
      {(regions) => (
        <div className="grid gap-4 xl:grid-cols-2">
          <RegionMap
            title="Taxa de Desbloqueio de Cartões por Região"
            format={(v) => formatPercentage(v, 1)}
            points={regions.map((r) => {
              const total = r.unlocked + r.locked
              return {
                id: r.region,
                label: r.label,
                lat: r.lat,
                lng: r.lng,
                value: total === 0 ? 0 : (r.unlocked / total) * 100,
                detail: `${formatNumber(r.unlocked)} desbloqueados, ${formatNumber(r.locked)} bloqueados`,
              }
            })}
          />
          <GroupedBarChartCard
            title="Comparativo Desbloqueios vs. Bloqueios por Região"
            series={[
              { key: 'unlocked', label: 'Desbloqueados', color: ACCENT_HEX.green },
              { key: 'locked', label: 'Bloqueados', color: ACCENT_HEX.red },
            ]}
            data={regions.map((r) => ({ label: r.label, unlocked: r.unlocked, locked: r.locked }))}
          />
        </div>
      )}
    </QueryBoundary>
  )
}
```

`src/features/financial/UsageEvolution.tsx`:

```tsx
import { LineChartCard } from '@/shared/charts/LineChartCard'
import { QueryBoundary } from '@/shared/ui/QueryBoundary'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useUsageEvolution } from './api'

export function UsageEvolution() {
  const query = useUsageEvolution()
  return (
    <QueryBoundary query={query} skeleton={<Skeleton className="h-72" />}>
      {(points) => (
        <LineChartCard
          title="Evolução da Utilização Média (em R$ mil)"
          data={points.map((p) => ({ label: p.label, value: p.value }))}
        />
      )}
    </QueryBoundary>
  )
}
```

`src/features/financial/FinancialPage.tsx`:

```tsx
import { useCallback, useState } from 'react'
import { AgreementFilters } from '@/app/filters/AgreementFilters'
import { Modal } from '@/shared/ui/Modal'
import { FinancialDetails } from './FinancialDetails'
import { FinancialKpis } from './FinancialKpis'
import { UnlockByRegion } from './UnlockByRegion'
import { UsageEvolution } from './UsageEvolution'
import { FIN_KPI_META, type FinancialKpi } from './kpis'

export function FinancialPage() {
  const [selected, setSelected] = useState<FinancialKpi | null>(null)
  const close = useCallback(() => setSelected(null), [])
  return (
    <section className="space-y-6">
      <h1 className="text-xl font-semibold">Desempenho Financeiro</h1>
      <AgreementFilters />
      <FinancialKpis onSelect={setSelected} />
      <UnlockByRegion />
      <UsageEvolution />
      <Modal open={selected !== null} title={selected ? FIN_KPI_META[selected].detailsTitle : ''} onClose={close} wide>
        {selected && <FinancialDetails kpi={selected} />}
      </Modal>
    </section>
  )
}
```

- [ ] **Step 4: Ligar a rota e ajustar os testes do layout**

Em `src/app/routes.tsx`, trocar a rota `financial` (hoje `element: <ComingSoon title="Desempenho Financeiro" />`) por:

```tsx
      {
        path: 'financial',
        lazy: async () => ({
          Component: (await import('@/features/financial/FinancialPage')).FinancialPage,
        }),
      },
```

Em `src/app/layout/AppLayout.test.tsx`, os testes que abrem `/financial` (o de links com filtro, o de placeholder, o de tema e o de período) passam a usar `/gallery`, que continua sendo um placeholder leve (o mapa e os gráficos não rodam bem sem mock no jsdom). Ajustar também o teste do placeholder: título `Galeria de Componentes` e o nome do teste para "shows the placeholder for routes not built yet".

- [ ] **Step 5: Rodar tudo e ver passar**

Run: `npm test && npm run typecheck && npm run lint && npm run build`
Expected: todos passam sem warnings. No `build`, conferir que `leaflet` sai no chunk da página financeira e não no bundle principal (`grep -l leaflet dist/assets/*.js`). Rodar `npm test` duas vezes seguidas: a suíte deve ficar estável.

- [ ] **Step 6: Commit**

```bash
git add src && git commit -m "feat: add Financial page with regional map, evolution and details dialogs

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 10: Hooks, KPIs e detalhes de estoque (TDD)

**Files:**
- Create: `src/features/inventory/api.ts`, `src/features/inventory/kpis.ts`, `src/features/inventory/InventoryKpis.tsx`, `src/features/inventory/InventoryDetails.tsx`
- Test: `src/features/inventory/InventoryKpis.test.tsx`, `src/features/inventory/InventoryDetails.test.tsx`

**Interfaces:**
- Consumes: `useDomainQuery`, `repositories.inventory` (Task 3), `KPICard`, `SummaryStat`, `PieChartCard`, `BarChartCard`, `DataTable` (Task 4), `QueryBoundary`, formatters.
- Produces:
  - `useInventory()`, `useLossTrend()` (via `useDomainQuery('inventory', ...)`)
  - `type InventoryKpi = 'cards' | 'envelopes' | 'letters' | 'losses'` e `INV_KPI_META: Record<InventoryKpi, { title: string; detailsTitle: string }>`: `Cartões` / `Cartões - Detalhamento`, `Envelopes` / `Envelopes - Detalhamento`, `Cartas Berço` / `Cartas Berço - Detalhamento`, `Perdas Totais` / `Perdas Totais - Detalhamento`
  - `InventoryKpis({ onSelect: (kpi: InventoryKpi) => void })`: 4 `KPICard`. Itens: valor = `formatNumber(total)`, hint = `"<available> disponíveis"` (ícones `CreditCard`/`Mail`/`ScrollText`, accents `blue`/`teal`/`purple`). Perdas: valor = `formatNumber(totalLost)`, hint `Total de itens extraviados` (ícone `PackageX`, `orange`)
  - `InventoryDetails({ kpi })`: para um item, `PieChartCard` `Distribuição de <título>` (Disponíveis, Em trânsito, Perdidos) e `DataTable` de legenda `Status de <título>` com as colunas `Status`, `Quantidade` e `Percentual` (1 casa) sobre o `total`; para `losses`, `BarChartCard` `Perdas por item` (uma barra por item, valor = `lost`) e `SummaryStat` `Total de perdas`

- [ ] **Step 1: Escrever os testes que falham**

`src/features/inventory/InventoryKpis.test.tsx`:

```tsx
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildInventory } from '@/data/mock/inventory'
import { DEFAULT_FILTERS } from '@/data/types/filters'
import { formatNumber } from '@/shared/lib/formatters'
import { renderWithProviders } from '@/test/renderWithProviders'
import { InventoryKpis } from './InventoryKpis'

const inv = buildInventory(DEFAULT_FILTERS)
const url = '/?delay=0'

describe('InventoryKpis', () => {
  beforeEach(() => window.history.replaceState({}, '', url))

  it('shows the three stock items and the total losses', async () => {
    renderWithProviders(<InventoryKpis onSelect={vi.fn()} />, { url })
    const cards = await screen.findAllByRole('article')
    expect(cards).toHaveLength(4)
    const cardsItem = inv.items[0]!
    expect(within(cards[0]!).getByText('Cartões')).toBeInTheDocument()
    expect(within(cards[0]!).getByText(formatNumber(cardsItem.total))).toBeInTheDocument()
    expect(within(cards[0]!).getByText(`${formatNumber(cardsItem.available)} disponíveis`)).toBeInTheDocument()
    expect(within(cards[2]!).getByText('Cartas Berço')).toBeInTheDocument()
    expect(within(cards[3]!).getByText(formatNumber(inv.totalLost))).toBeInTheDocument()
    expect(within(cards[3]!).getByText('Total de itens extraviados')).toBeInTheDocument()
  })

  it('reports which KPI was selected', async () => {
    const onSelect = vi.fn()
    renderWithProviders(<InventoryKpis onSelect={onSelect} />, { url })
    await screen.findAllByRole('article')
    await userEvent.click(screen.getByRole('button', { name: /^Envelopes/ }))
    expect(onSelect).toHaveBeenCalledWith('envelopes')
    await userEvent.click(screen.getByRole('button', { name: /^Perdas Totais/ }))
    expect(onSelect).toHaveBeenCalledWith('losses')
  })

  it('shows the error state', async () => {
    window.history.replaceState({}, '', '/?delay=0&error=1')
    renderWithProviders(<InventoryKpis onSelect={vi.fn()} />, { url: '/?delay=0&error=1' })
    expect(await screen.findByRole('alert')).toHaveTextContent('Falha simulada')
  })
})
```

`src/features/inventory/InventoryDetails.test.tsx`:

```tsx
import { screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { buildInventory } from '@/data/mock/inventory'
import { DEFAULT_FILTERS } from '@/data/types/filters'
import { formatNumber } from '@/shared/lib/formatters'
import { renderWithProviders } from '@/test/renderWithProviders'
import { InventoryDetails } from './InventoryDetails'

const inv = buildInventory(DEFAULT_FILTERS)
const url = '/?delay=0'

describe('InventoryDetails', () => {
  beforeEach(() => window.history.replaceState({}, '', url))

  it('item: pie of the stock split and a status table that adds up to the total', async () => {
    renderWithProviders(<InventoryDetails kpi="envelopes" />, { url })
    expect(await screen.findByRole('heading', { name: 'Distribuição de Envelopes' })).toBeInTheDocument()
    const table = await screen.findByRole('table', { name: 'Status de Envelopes' })
    const item = inv.items[1]!
    const rows = within(table).getAllByRole('row').slice(1)
    expect(rows.map((r) => within(r).getAllByRole('cell')[0]?.textContent)).toEqual(['Disponíveis', 'Em trânsito', 'Perdidos'])
    expect(within(rows[0]!).getByText(formatNumber(item.available))).toBeInTheDocument()
  })

  it('losses: bar of losses per item and the total', async () => {
    renderWithProviders(<InventoryDetails kpi="losses" />, { url })
    expect(await screen.findByRole('heading', { name: 'Perdas por item' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: new RegExp(`Cartões: ${formatNumber(inv.items[0]!.lost)}`) })).toBeInTheDocument()
    expect(screen.getByText('Total de perdas')).toBeInTheDocument()
    expect(screen.getByText(formatNumber(inv.totalLost))).toBeInTheDocument()
  })

  it('shows the error state', async () => {
    window.history.replaceState({}, '', '/?delay=0&error=1')
    renderWithProviders(<InventoryDetails kpi="cards" />, { url: '/?delay=0&error=1' })
    expect(await screen.findByRole('alert')).toHaveTextContent('Falha simulada')
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/features/inventory`
Expected: FAIL (módulos inexistentes).

- [ ] **Step 3: Implementar hooks, metadados e KPIs**

`src/features/inventory/api.ts`:

```ts
import { useDomainQuery } from '@/app/data/useDomainQuery'
import { repositories } from '@/data/repositories'

const repo = repositories.inventory

export const useInventory = () => useDomainQuery('inventory', 'overview', (f) => repo.getOverview(f))
export const useLossTrend = () => useDomainQuery('inventory', 'loss-trend', (f) => repo.getLossTrend(f))
```

`src/features/inventory/kpis.ts`:

```ts
export type InventoryKpi = 'cards' | 'envelopes' | 'letters' | 'losses'

export const INV_KPI_META: Record<InventoryKpi, { title: string; detailsTitle: string }> = {
  cards: { title: 'Cartões', detailsTitle: 'Cartões - Detalhamento' },
  envelopes: { title: 'Envelopes', detailsTitle: 'Envelopes - Detalhamento' },
  letters: { title: 'Cartas Berço', detailsTitle: 'Cartas Berço - Detalhamento' },
  losses: { title: 'Perdas Totais', detailsTitle: 'Perdas Totais - Detalhamento' },
}
```

`src/features/inventory/InventoryKpis.tsx`:

```tsx
import { CreditCard, Mail, PackageX, ScrollText, type LucideIcon } from 'lucide-react'
import type { StockItemKey } from '@/data/types/inventory'
import { formatNumber } from '@/shared/lib/formatters'
import { KPICard, type KPIAccent } from '@/shared/ui/KPICard'
import { QueryBoundary } from '@/shared/ui/QueryBoundary'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useInventory } from './api'
import { INV_KPI_META, type InventoryKpi } from './kpis'

const GRID = 'grid gap-4 sm:grid-cols-2 xl:grid-cols-4'

const ITEMS: { key: StockItemKey; icon: LucideIcon; accent: KPIAccent }[] = [
  { key: 'cards', icon: CreditCard, accent: 'blue' },
  { key: 'envelopes', icon: Mail, accent: 'teal' },
  { key: 'letters', icon: ScrollText, accent: 'purple' },
]

export function InventoryKpis({ onSelect }: { onSelect: (kpi: InventoryKpi) => void }) {
  const query = useInventory()
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
      {({ items, totalLost }) => (
        <div className={GRID}>
          {ITEMS.map(({ key, icon, accent }) => {
            const item = items.find((i) => i.key === key)
            return (
              <KPICard
                key={key}
                label={INV_KPI_META[key].title}
                value={formatNumber(item?.total ?? 0)}
                hint={`${formatNumber(item?.available ?? 0)} disponíveis`}
                icon={icon}
                accent={accent}
                onSelect={() => onSelect(key)}
              />
            )
          })}
          <KPICard
            label={INV_KPI_META.losses.title}
            value={formatNumber(totalLost)}
            hint="Total de itens extraviados"
            icon={PackageX}
            accent="orange"
            onSelect={() => onSelect('losses')}
          />
        </div>
      )}
    </QueryBoundary>
  )
}
```

- [ ] **Step 4: Implementar os detalhes**

`src/features/inventory/InventoryDetails.tsx`:

```tsx
import { useMemo } from 'react'
import type { StockItem } from '@/data/types/inventory'
import { ACCENT_HEX } from '@/shared/charts/chartTheme'
import { BarChartCard } from '@/shared/charts/BarChartCard'
import { PieChartCard } from '@/shared/charts/PieChartCard'
import { formatNumber, formatPercentage } from '@/shared/lib/formatters'
import { DataTable, type DataColumn } from '@/shared/ui/DataTable'
import { QueryBoundary } from '@/shared/ui/QueryBoundary'
import { SummaryStat } from '@/shared/ui/SummaryStat'
import { useInventory } from './api'
import type { InventoryKpi } from './kpis'

interface StatusRow {
  status: string
  quantity: number
}

function ItemDetails({ item }: { item: StockItem }) {
  const rows = useMemo<StatusRow[]>(
    () => [
      { status: 'Disponíveis', quantity: item.available },
      { status: 'Em trânsito', quantity: item.inTransit },
      { status: 'Perdidos', quantity: item.lost },
    ],
    [item],
  )
  const columns = useMemo<DataColumn<StatusRow>[]>(
    () => [
      { id: 'status', header: 'Status', cell: (r) => r.status, sortValue: (r) => r.status },
      { id: 'quantity', header: 'Quantidade', cell: (r) => formatNumber(r.quantity), sortValue: (r) => r.quantity, align: 'right' },
      {
        id: 'share',
        header: 'Percentual',
        cell: (r) => formatPercentage(item.total === 0 ? 0 : (r.quantity / item.total) * 100, 1),
        sortValue: (r) => r.quantity,
        align: 'right',
      },
    ],
    [item.total],
  )
  return (
    <div className="space-y-4">
      <PieChartCard title={`Distribuição de ${item.label}`} data={rows.map((r) => ({ label: r.status, value: r.quantity }))} />
      <DataTable caption={`Status de ${item.label}`} columns={columns} data={rows} />
    </div>
  )
}

export function InventoryDetails({ kpi }: { kpi: InventoryKpi }) {
  const query = useInventory()
  return (
    <QueryBoundary query={query}>
      {({ items, totalLost }) => {
        if (kpi === 'losses') {
          return (
            <div className="space-y-4">
              <BarChartCard
                title="Perdas por item"
                data={items.map((i) => ({ label: i.label, value: i.lost, color: ACCENT_HEX.red }))}
              />
              <SummaryStat label="Total de perdas" value={formatNumber(totalLost)} tone="red" />
            </div>
          )
        }
        const item = items.find((i) => i.key === kpi)
        return item ? <ItemDetails item={item} /> : null
      }}
    </QueryBoundary>
  )
}
```

- [ ] **Step 5: Rodar tudo e ver passar**

Run: `npm test && npm run typecheck && npm run lint`
Expected: todos passam. Se `Mail`, `ScrollText` ou `PackageX` não existirem no `lucide-react` instalado, usar o ícone equivalente mais próximo e registrar.

- [ ] **Step 6: Commit**

```bash
git add src/features/inventory && git commit -m "feat: add inventory data hooks, KPIs and details content

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 11: Página de estoque, rota e fechamento do plano (TDD)

**Files:**
- Create: `src/features/inventory/InventoryCharts.tsx`, `src/features/inventory/InventoryPage.tsx`
- Modify: `src/app/routes.tsx`, `README.md`
- Test: `src/features/inventory/InventoryPage.test.tsx`

**Interfaces:**
- Consumes: `InventoryKpis`/`INV_KPI_META` (Task 10), `InventoryDetails` (Task 10), `useInventory`/`useLossTrend` (Task 10), `GroupedBarChartCard` (Task 5), `LineChartCard`, `Modal`, `renderWithProviders`.
- Produces:
  - `InventoryCharts()`: `GroupedBarChartCard` `Estoque por item` (séries `Disponíveis` verde, `Em trânsito` roxo, `Perdidos` vermelho; uma categoria por item) e `LineChartCard` `Perdas no período` (vermelho)
  - `InventoryPage` (export nomeado): `h1` `Gestão de Estoque`, `InventoryKpis`, `InventoryCharts` e um `Modal` (`wide`) com `InventoryDetails` e o título `INV_KPI_META[kpi].detailsTitle`. Sem filtros de convênio (o legado só usa o período).
  - Rota `/inventory` passa a carregar `InventoryPage` por `lazy`

- [ ] **Step 1: Escrever o teste que falha**

`src/features/inventory/InventoryPage.test.tsx`:

```tsx
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/renderWithProviders'
import { InventoryPage } from './InventoryPage'

const url = '/?delay=0'

describe('InventoryPage', () => {
  beforeEach(() => window.history.replaceState({}, '', url))

  it('renders the heading, the four KPIs and both charts', async () => {
    renderWithProviders(<InventoryPage />, { url })
    expect(screen.getByRole('heading', { level: 1, name: 'Gestão de Estoque' })).toBeInTheDocument()
    expect(await screen.findAllByRole('article')).toHaveLength(4)
    expect(await screen.findByRole('heading', { name: 'Estoque por item' })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Perdas no período' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /Cartões: Disponíveis .*Em trânsito .*Perdidos/ })).toBeInTheDocument()
  })

  it('opens the details of an item in a dialog and closes it with Escape', async () => {
    renderWithProviders(<InventoryPage />, { url })
    await userEvent.click(await screen.findByRole('button', { name: /^Cartões/ }))
    const dialog = await screen.findByRole('dialog', { name: 'Cartões - Detalhamento' })
    expect(await within(dialog).findByRole('table', { name: 'Status de Cartões' })).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows error alerts when the repository fails', async () => {
    window.history.replaceState({}, '', '/?delay=0&error=1')
    renderWithProviders(<InventoryPage />, { url: '/?delay=0&error=1' })
    expect((await screen.findAllByRole('alert')).length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/features/inventory/InventoryPage.test.tsx`
Expected: FAIL (módulos inexistentes).

- [ ] **Step 3: Implementar**

`src/features/inventory/InventoryCharts.tsx`:

```tsx
import { ACCENT_HEX } from '@/shared/charts/chartTheme'
import { GroupedBarChartCard } from '@/shared/charts/GroupedBarChartCard'
import { LineChartCard } from '@/shared/charts/LineChartCard'
import { QueryBoundary } from '@/shared/ui/QueryBoundary'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useInventory, useLossTrend } from './api'

export function InventoryCharts() {
  const inventory = useInventory()
  const losses = useLossTrend()
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <QueryBoundary query={inventory} skeleton={<Skeleton className="h-80" />}>
        {({ items }) => (
          <GroupedBarChartCard
            title="Estoque por item"
            series={[
              { key: 'available', label: 'Disponíveis', color: ACCENT_HEX.green },
              { key: 'inTransit', label: 'Em trânsito', color: ACCENT_HEX.purple },
              { key: 'lost', label: 'Perdidos', color: ACCENT_HEX.red },
            ]}
            data={items.map((i) => ({
              label: i.label,
              available: i.available,
              inTransit: i.inTransit,
              lost: i.lost,
            }))}
          />
        )}
      </QueryBoundary>
      <QueryBoundary query={losses} skeleton={<Skeleton className="h-80" />}>
        {(points) => (
          <LineChartCard
            title="Perdas no período"
            color={ACCENT_HEX.red}
            data={points.map((p) => ({ label: p.label, value: p.value }))}
          />
        )}
      </QueryBoundary>
    </div>
  )
}
```

`src/features/inventory/InventoryPage.tsx`:

```tsx
import { useCallback, useState } from 'react'
import { Modal } from '@/shared/ui/Modal'
import { InventoryCharts } from './InventoryCharts'
import { InventoryDetails } from './InventoryDetails'
import { InventoryKpis } from './InventoryKpis'
import { INV_KPI_META, type InventoryKpi } from './kpis'

export function InventoryPage() {
  const [selected, setSelected] = useState<InventoryKpi | null>(null)
  const close = useCallback(() => setSelected(null), [])
  return (
    <section className="space-y-6">
      <h1 className="text-xl font-semibold">Gestão de Estoque</h1>
      <InventoryKpis onSelect={setSelected} />
      <InventoryCharts />
      <Modal open={selected !== null} title={selected ? INV_KPI_META[selected].detailsTitle : ''} onClose={close} wide>
        {selected && <InventoryDetails kpi={selected} />}
      </Modal>
    </section>
  )
}
```

- [ ] **Step 4: Ligar a rota e atualizar o README**

Em `src/app/routes.tsx`, trocar a rota `inventory` (hoje `element: <ComingSoon title="Gestão de Estoque" />`) por:

```tsx
      {
        path: 'inventory',
        lazy: async () => ({
          Component: (await import('@/features/inventory/InventoryPage')).InventoryPage,
        }),
      },
```

Em `README.md`, na seção "Páginas", acrescentar antes da linha `/financial, /inventory, /logistics, /gallery: em migração` (e ajustar essa linha para `/logistics`, `/gallery`):

```markdown
- `/financial`: KPIs de limite e custos logísticos, mapa de desbloqueio por região (react-leaflet),
  comparativo por região e evolução da utilização, com detalhamento por KPI (tabela ordenável em TanStack Table).
- `/inventory`: estoque de cartões, envelopes e cartas berço, perdas e detalhamento por item.
```

- [ ] **Step 5: Verificação completa**

Run: `npm test` (duas vezes seguidas), `npm run typecheck`, `npm run lint`, `npm run build`
Expected: tudo passa; suíte estável nas duas rodadas. No `build`: `leaflet` só aparece no chunk da página financeira (`grep -l leaflet dist/assets/*.js` não lista `index-*.js`), e o bundle principal não cresce (comparar com o `index-*.js` de ~433 kB do Plano 2). Registrar os tamanhos dos chunks no relatório.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: add Inventory page and wire Financial and Inventory routes

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Self-Review

- **Cobertura do legado:** Financial: 4 KPIs, detalhamentos (utilização, distribuição, média por faixa, custos logísticos com tabela por status), taxa de desbloqueio por região em mapa, comparativo desbloqueios vs. bloqueios, evolução da utilização (Tasks 2, 7, 8, 9). Inventory: 4 KPIs, tabela de status por item, perdas por item, estoque por item e perdas no período (Tasks 3, 10, 11). Fora de escopo por decisão: as visões de workflow (fluxograma, organograma, POPs), já demonstradas no Plano 2; o gráfico "Distribuição da Utilização do Limite" da página legada foi absorvido pelo detalhamento de `total`.
- **Placeholders:** nenhum. Pontos condicionais (nomes de ícones do `lucide-react`, sintaxe de `vi.mock` com JSX, comportamento de ordenação do TanStack, regra `react-hooks/incompatible-library`) trazem a ação corretiva concreta.
- **Consistência de tipos:** `RegionKey`, `FinancialOverview`, `RegionUnlock`, `InventoryOverview`, `StockItem`, `TrendPoint`, `FinancialKpi`, `InventoryKpi`, `DataColumn`, `GroupedSeries`, `MapPoint` e os nomes dos hooks têm a mesma forma em todas as tarefas. Os nomes `AXIS_TICK`, `GRID_STROKE`, `TOOLTIP_STYLE` e `ACCENT_HEX` (sem `blue`) vêm do `chartTheme.ts` deixado pelo Plano 2.
- **Riscos conhecidos:** Leaflet em jsdom (mock só nos testes que renderizam mapa; o `AppLayout.test` passa a usar `/gallery` para não carregar o mapa), TanStack Table com o compilador do React (uma linha `eslint-disable` justificada) e o tempo de carga dos chunks lazy em testes (o `asyncUtilTimeout` global de 5 s já cobre).
