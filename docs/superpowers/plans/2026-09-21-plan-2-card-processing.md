# Plano 2: Card Processing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar a página Processamento de Cartões (legado: `legacy/src/pages/CardProcessing.jsx`, 1.086 linhas) para a arquitetura nova: 4 KPIs com resumo, tendência de integração, modais de detalhe (barras e pizzas) e modais de workflow (fluxograma, organograma e POPs), tudo com dados mock tipados.

**Architecture:** Repositório mock com métodos por seção (overview, motivos, seguros, tendência, workflow) e catálogo de convênios, derivados de um mesmo `buildOverview` para que os números batam entre si. Gráficos via wrappers finos de Recharts em `shared/charts`; fluxograma e organograma via React Flow. Hooks de query usam `useDomainQuery`, que inclui filtros e dev flags na chave. A página é montada por seções pequenas.

**Tech Stack:** Recharts, @xyflow/react (React Flow), TanStack Query, Zod, Vitest, Testing Library, Tailwind 4, lucide-react.

**Spec:** `docs/superpowers/specs/2026-09-21-dashboard-showcase-template-design.md`

**Depende de:** Plano 1 (branch `modernize/template`). Antes do Task 1, `npm test`, `npm run typecheck`, `npm run lint` e `npm run build` devem estar verdes.

## Global Constraints

- TypeScript `strict: true`, sem `any` explícito.
- Datas, números e moedas em pt-BR via `@/shared/lib/formatters`.
- Dados mock determinísticos (seed fixa); nenhum acesso a rede, banco ou Supabase.
- Ícones com `lucide-react`; sem Font Awesome.
- Alias de import `@/` aponta para `src/`.
- Nenhum nome de pessoa real, marca ou logo do legado: organogramas usam cargos e "Analista N".
- Saída de testes limpa (sem warnings de `act()` ou de dimensões do Recharts).
- Nenhum arquivo com mais de ~150 linhas escrito numa única chamada.
- Commits com o trailer `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`.
- Até o Task 12, `CardProcessingKpis` e `getKpis` continuam existindo (a página exemplar do Plano 1 depende deles); o Task 12 os remove.

## Mapa de arquivos

```
src/data/types/card-processing.ts   tipos novos (Task 1)
src/data/types/catalog.ts           catálogo de convênios (Task 2)
src/data/mock/scale.ts              fatores, seed, pct, splitByWeights (Task 1)
src/data/mock/overview.ts           buildOverview (Task 2)
src/data/mock/trend.ts              buildTrend (Task 2)
src/data/mock/breakdowns.ts         motivos e seguros (Task 3)
src/data/mock/workflows.ts          fluxo, organograma, POPs (Task 3)
src/data/repositories/catalog.ts    interface (Task 2); mock/catalog.ts
src/app/data/useDomainQuery.ts      useDomainQuery, useDevFlags (Task 4)
src/shared/ui/Modal.tsx             (Task 5)
src/shared/charts/*                 tema, percent, Pie/Bar/Line (Task 6)
src/shared/ui/KPICard.tsx           estendido (Task 7)
src/app/filters/AgreementFilters.tsx, useAgreementCatalog.ts (Task 8)
src/features/card-processing/       api.ts, OverviewCards, IntegrationTrend,
                                    details/*, workflow/*, CardProcessingPage (Tasks 9-12)
```

---

### Task 1: Tipos do domínio e helpers de escala (TDD)

**Files:**
- Modify: `src/data/types/card-processing.ts` (acrescentar; manter `CardProcessingKpis`)
- Create: `src/data/mock/scale.ts`
- Test: `src/data/mock/scale.test.ts`

**Interfaces:**
- Consumes: `GlobalFilters` (`@/data/types/filters`), `Rng`/`createRng` (`@/data/mock/random`).
- Produces:
  - Tipos: `IntegrationStats { ratePercent; digitized; notDigitized }`, `AccountsStats { ratePercent; created; notCreated }`, `CardsStats { sent; notSent; totalAccounts }`, `InsuranceStats { total; withInsurance; withoutInsurance }`, `CardProcessingOverview { integration; accounts; cards; insurance }`, `ReasonCount { reason: string; count: number }`, `IntegrationReasons { stopReasons; nonDigitizedBreakdown }` (ambos `ReasonCount[]`), `AccountReasons { created; notCreated }`, `InsuranceBreakdown { byCoverage; byValue; byAssignment }`, `TrendPoint { label: string; value: number }`, `WorkflowKpi = 'integration' | 'accounts' | 'cards' | 'insurance'`, `OrgNode { id; name; role; children: OrgNode[] }`, `FlowStep { id; label }`, `WorkflowDoc { id; title; description }`, `WorkflowInfo { flow: FlowStep[]; org: OrgNode; docs: WorkflowDoc[] }`
  - `volumeFactor(f: GlobalFilters): number`, `seedFor(f: GlobalFilters, salt: string): number`, `pct(part: number, whole: number): number`, `splitByWeights(total: number, reasons: readonly string[], rng: Rng): ReasonCount[]` (soma exata igual a `total`)

- [ ] **Step 1: Acrescentar os tipos**

Ao final de `src/data/types/card-processing.ts` (sem apagar `CardProcessingKpis`):

```ts
export interface IntegrationStats { ratePercent: number; digitized: number; notDigitized: number }
export interface AccountsStats { ratePercent: number; created: number; notCreated: number }
export interface CardsStats { sent: number; notSent: number; totalAccounts: number }
export interface InsuranceStats { total: number; withInsurance: number; withoutInsurance: number }

export interface CardProcessingOverview {
  integration: IntegrationStats
  accounts: AccountsStats
  cards: CardsStats
  insurance: InsuranceStats
}

export interface ReasonCount { reason: string; count: number }
export interface IntegrationReasons { stopReasons: ReasonCount[]; nonDigitizedBreakdown: ReasonCount[] }
export interface AccountReasons { created: ReasonCount[]; notCreated: ReasonCount[] }
export interface InsuranceBreakdown {
  byCoverage: ReasonCount[]
  byValue: ReasonCount[]
  byAssignment: ReasonCount[]
}

export interface TrendPoint { label: string; value: number }

export type WorkflowKpi = 'integration' | 'accounts' | 'cards' | 'insurance'
export interface OrgNode { id: string; name: string; role: string; children: OrgNode[] }
export interface FlowStep { id: string; label: string }
export interface WorkflowDoc { id: string; title: string; description: string }
export interface WorkflowInfo { flow: FlowStep[]; org: OrgNode; docs: WorkflowDoc[] }
```

- [ ] **Step 2: Escrever o teste que falha**

`src/data/mock/scale.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { DEFAULT_FILTERS } from '@/data/types/filters'
import { createRng } from './random'
import { pct, seedFor, splitByWeights, volumeFactor } from './scale'

describe('volumeFactor', () => {
  it('is 1 for default filters and shrinks with period and region', () => {
    expect(volumeFactor(DEFAULT_FILTERS)).toBe(1)
    expect(volumeFactor({ ...DEFAULT_FILTERS, period: '7d' })).toBeLessThan(1)
    expect(volumeFactor({ ...DEFAULT_FILTERS, period: '7d', region: 'sul' })).toBeLessThan(
      volumeFactor({ ...DEFAULT_FILTERS, period: '7d' }),
    )
  })
})

describe('seedFor', () => {
  it('is stable and depends on salt and agreement', () => {
    expect(seedFor(DEFAULT_FILTERS, 'a')).toBe(seedFor(DEFAULT_FILTERS, 'a'))
    expect(seedFor(DEFAULT_FILTERS, 'a')).not.toBe(seedFor(DEFAULT_FILTERS, 'b'))
    expect(seedFor({ ...DEFAULT_FILTERS, agreement: 'x' }, 'a')).not.toBe(seedFor(DEFAULT_FILTERS, 'a'))
  })
})

describe('pct', () => {
  it('computes a percentage and guards division by zero', () => {
    expect(pct(1, 4)).toBe(25)
    expect(pct(1, 0)).toBe(0)
  })
})

describe('splitByWeights', () => {
  const reasons = ['A', 'B', 'C', 'D'] as const
  it('splits exactly the total across all reasons, never negative', () => {
    const parts = splitByWeights(1000, reasons, createRng(3))
    expect(parts.map((p) => p.reason)).toEqual([...reasons])
    expect(parts.reduce((sum, p) => sum + p.count, 0)).toBe(1000)
    expect(parts.every((p) => p.count >= 0)).toBe(true)
  })
  it('is deterministic for the same seed and handles zero', () => {
    expect(splitByWeights(50, reasons, createRng(9))).toEqual(splitByWeights(50, reasons, createRng(9)))
    expect(splitByWeights(0, reasons, createRng(9)).every((p) => p.count === 0)).toBe(true)
  })
})
```

- [ ] **Step 3: Rodar e ver falhar**

Run: `npx vitest run src/data/mock/scale.test.ts`
Expected: FAIL (módulo `./scale` não existe).

- [ ] **Step 4: Implementar `src/data/mock/scale.ts`**

```ts
import type { ReasonCount } from '@/data/types/card-processing'
import type { GlobalFilters } from '@/data/types/filters'
import type { Rng } from './random'

const PERIOD_FACTOR: Record<GlobalFilters['period'], number> = {
  all: 1, '12m': 0.8, '90d': 0.3, '30d': 0.1, '7d': 0.03,
}
const REGION_FACTOR: Record<GlobalFilters['region'], number> = {
  all: 1, sudeste: 0.42, nordeste: 0.27, sul: 0.15, norte: 0.09, 'centro-oeste': 0.07,
}

export const volumeFactor = (f: GlobalFilters): number => PERIOD_FACTOR[f.period] * REGION_FACTOR[f.region]

const hash = (text: string): number =>
  [...text].reduce((acc, ch) => (Math.imul(acc, 31) + ch.charCodeAt(0)) >>> 0, 7)

/** A seed depende só de convênio e do sal; período e região apenas escalam os volumes. */
export const seedFor = (f: GlobalFilters, salt: string): number =>
  hash(`${salt}|${f.agreementCategory}|${f.agreement}`)

export const pct = (part: number, whole: number): number => (whole === 0 ? 0 : (part / whole) * 100)

export function splitByWeights(total: number, reasons: readonly string[], rng: Rng): ReasonCount[] {
  const weights = reasons.map(() => 1 + rng.next() * 3)
  const sum = weights.reduce((a, b) => a + b, 0)
  const counts = weights.map((w) => Math.floor((total * w) / sum))
  const remainder = total - counts.reduce((a, b) => a + b, 0)
  if (counts.length > 0) counts[0] = (counts[0] ?? 0) + remainder
  return reasons.map((reason, i) => ({ reason, count: counts[i] ?? 0 }))
}
```

- [ ] **Step 5: Rodar tudo e ver passar**

Run: `npx vitest run src/data/mock/scale.test.ts && npm run typecheck && npm run lint`
Expected: PASS (5 testes), typecheck e lint limpos.

- [ ] **Step 6: Commit**

```bash
git add src/data && git commit -m "feat: add card-processing domain types and mock scale helpers

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 2: Mock de overview, tendência e catálogo de convênios (TDD)

**Files:**
- Create: `src/data/mock/overview.ts`, `src/data/mock/trend.ts`, `src/data/types/catalog.ts`, `src/data/repositories/catalog.ts`, `src/data/repositories/mock/catalog.ts`
- Modify: `src/data/repositories/card-processing.ts`, `src/data/repositories/mock/card-processing.ts`, `src/data/repositories/index.ts`
- Test: `src/data/mock/overview.test.ts`, `src/data/mock/trend.test.ts`, `src/data/repositories/mock/catalog.test.ts`

**Interfaces:**
- Consumes: tipos e helpers do Task 1; `simulate` (`@/data/mock/simulate`).
- Produces:
  - `buildOverview(f: GlobalFilters): CardProcessingOverview`
  - `buildTrend(f: GlobalFilters): TrendPoint[]` (`all`/`12m` → 12 pontos, `90d` → 3, `30d` → 4, `7d` → 7; valores 0 a 100 com 1 casa)
  - `AgreementCatalog { categories: { id: string; label: string; agreements: { id: string; label: string }[] }[] }`
  - `CatalogRepository { getAgreementCatalog(): Promise<AgreementCatalog> }`
  - `CardProcessingRepository` ganha `getOverview(f): Promise<CardProcessingOverview>` e `getIntegrationTrend(f): Promise<TrendPoint[]>` (mantém `getKpis`)
  - `repositories.catalog: CatalogRepository`

- [ ] **Step 1: Escrever os testes que falham**

`src/data/mock/overview.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { DEFAULT_FILTERS } from '@/data/types/filters'
import { buildOverview } from './overview'

describe('buildOverview', () => {
  it('is deterministic and internally consistent', () => {
    const a = buildOverview(DEFAULT_FILTERS)
    expect(a).toEqual(buildOverview(DEFAULT_FILTERS))
    expect(a.integration.digitized + a.integration.notDigitized).toBeGreaterThan(9000)
    expect(a.accounts.created + a.accounts.notCreated).toBe(a.integration.digitized)
    expect(a.cards.sent + a.cards.notSent).toBe(a.cards.totalAccounts)
    expect(a.cards.totalAccounts).toBe(a.accounts.created)
    expect(a.insurance.withInsurance + a.insurance.withoutInsurance).toBe(a.insurance.total)
    expect(a.integration.ratePercent).toBeGreaterThan(0)
    expect(a.integration.ratePercent).toBeLessThanOrEqual(100)
  })
  it('shrinks with period, region and changes with agreement', () => {
    const all = buildOverview(DEFAULT_FILTERS)
    expect(buildOverview({ ...DEFAULT_FILTERS, period: '7d' }).insurance.total).toBeLessThan(
      all.insurance.total,
    )
    expect(buildOverview({ ...DEFAULT_FILTERS, region: 'sul' }).cards.sent).toBeLessThan(
      all.cards.sent,
    )
    expect(buildOverview({ ...DEFAULT_FILTERS, agreement: 'x' })).not.toEqual(all)
  })
})
```

`src/data/mock/trend.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { DEFAULT_FILTERS } from '@/data/types/filters'
import { buildTrend } from './trend'

describe('buildTrend', () => {
  it.each([
    ['all', 12],
    ['12m', 12],
    ['90d', 3],
    ['30d', 4],
    ['7d', 7],
  ] as const)('has the expected number of points for %s', (period, length) => {
    expect(buildTrend({ ...DEFAULT_FILTERS, period })).toHaveLength(length)
  })
  it('keeps values between 0 and 100 and is deterministic', () => {
    const points = buildTrend(DEFAULT_FILTERS)
    expect(points.every((p) => p.value >= 0 && p.value <= 100)).toBe(true)
    expect(points).toEqual(buildTrend(DEFAULT_FILTERS))
  })
})
```

`src/data/repositories/mock/catalog.test.ts`:

```ts
import { beforeEach, describe, expect, it } from 'vitest'
import { mockCatalogRepository } from './catalog'

describe('mockCatalogRepository', () => {
  beforeEach(() => window.history.replaceState({}, '', '/?delay=0'))
  it('returns categories with unique agreement ids', async () => {
    const { categories } = await mockCatalogRepository.getAgreementCatalog()
    expect(categories.map((c) => c.id)).toEqual(['governo', 'inss', 'prefeitura'])
    const ids = categories.flatMap((c) => c.agreements.map((a) => a.id))
    expect(ids.length).toBeGreaterThanOrEqual(6)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/data/mock/overview.test.ts src/data/mock/trend.test.ts src/data/repositories/mock/catalog.test.ts`
Expected: FAIL (módulos inexistentes).

- [ ] **Step 3: Implementar `overview.ts` e `trend.ts`**

`src/data/mock/overview.ts`:

```ts
import type { CardProcessingOverview } from '@/data/types/card-processing'
import type { GlobalFilters } from '@/data/types/filters'
import { createRng } from './random'
import { pct, seedFor, volumeFactor } from './scale'

export function buildOverview(f: GlobalFilters): CardProcessingOverview {
  const rng = createRng(seedFor(f, 'overview'))
  const total = Math.round(rng.int(9000, 11000) * volumeFactor(f))
  const digitized = Math.round(total * (0.75 + rng.next() * 0.1))
  const created = Math.round(digitized * (0.9 + rng.next() * 0.08))
  const sent = Math.round(created * (0.8 + rng.next() * 0.1))
  const withInsurance = Math.round(digitized * (0.3 + rng.next() * 0.2))
  return {
    integration: { ratePercent: pct(digitized, total), digitized, notDigitized: total - digitized },
    accounts: { ratePercent: pct(created, digitized), created, notCreated: digitized - created },
    cards: { sent, notSent: created - sent, totalAccounts: created },
    insurance: { total: digitized, withInsurance, withoutInsurance: digitized - withInsurance },
  }
}
```

`src/data/mock/trend.ts`:

```ts
import type { TrendPoint } from '@/data/types/card-processing'
import type { GlobalFilters } from '@/data/types/filters'
import { buildOverview } from './overview'
import { createRng } from './random'
import { seedFor } from './scale'

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const LABELS: Record<GlobalFilters['period'], string[]> = {
  all: MONTHS,
  '12m': MONTHS,
  '90d': ['Mês 1', 'Mês 2', 'Mês 3'],
  '30d': ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
  '7d': ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
}

export function buildTrend(f: GlobalFilters): TrendPoint[] {
  const rng = createRng(seedFor(f, 'trend'))
  const base = buildOverview(f).integration.ratePercent
  return LABELS[f.period].map((label) => {
    const value = Math.min(100, Math.max(0, base + (rng.next() - 0.5) * 12))
    return { label, value: Math.round(value * 10) / 10 }
  })
}
```

- [ ] **Step 4: Implementar o catálogo e ligar nos repositórios**

`src/data/types/catalog.ts`:

```ts
export interface Agreement {
  id: string
  label: string
}
export interface AgreementCategory {
  id: string
  label: string
  agreements: Agreement[]
}
export interface AgreementCatalog {
  categories: AgreementCategory[]
}
```

`src/data/repositories/catalog.ts`:

```ts
import type { AgreementCatalog } from '@/data/types/catalog'

export interface CatalogRepository {
  getAgreementCatalog(): Promise<AgreementCatalog>
}
```

`src/data/repositories/mock/catalog.ts`:

```ts
import { simulate } from '@/data/mock/simulate'
import type { CatalogRepository } from '@/data/repositories/catalog'
import type { AgreementCatalog } from '@/data/types/catalog'

const CATALOG: AgreementCatalog = {
  categories: [
    {
      id: 'governo',
      label: 'Governo',
      agreements: [
        { id: 'gov-estadual-a', label: 'Governo Estadual A' },
        { id: 'gov-estadual-b', label: 'Governo Estadual B' },
        { id: 'gov-federal', label: 'Governo Federal' },
      ],
    },
    {
      id: 'inss',
      label: 'INSS',
      agreements: [
        { id: 'inss-aposentados', label: 'INSS Aposentados' },
        { id: 'inss-pensionistas', label: 'INSS Pensionistas' },
      ],
    },
    {
      id: 'prefeitura',
      label: 'Prefeitura',
      agreements: [
        { id: 'pref-capital', label: 'Prefeitura da Capital' },
        { id: 'pref-interior', label: 'Prefeituras do Interior' },
      ],
    },
  ],
}

export const mockCatalogRepository: CatalogRepository = {
  getAgreementCatalog: () => simulate(() => CATALOG),
}
```

Em `src/data/repositories/card-processing.ts`, importar `CardProcessingOverview` e `TrendPoint` de `@/data/types/card-processing` e acrescentar à interface (mantendo `getKpis`):

```ts
  getOverview(filters: GlobalFilters): Promise<CardProcessingOverview>
  getIntegrationTrend(filters: GlobalFilters): Promise<TrendPoint[]>
```

Em `src/data/repositories/mock/card-processing.ts`, importar `buildOverview` (`@/data/mock/overview`) e `buildTrend` (`@/data/mock/trend`) e acrescentar ao objeto (o `simulate` já está importado):

```ts
  getOverview: (filters) => simulate(() => buildOverview(filters)),
  getIntegrationTrend: (filters) => simulate(() => buildTrend(filters)),
```

Em `src/data/repositories/index.ts`, acrescentar `catalog: CatalogRepository` à interface `Repositories` e `catalog: mockCatalogRepository` ao objeto exportado.

- [ ] **Step 5: Rodar tudo e ver passar**

Run: `npm test && npm run typecheck && npm run lint`
Expected: todos passam (os 30 anteriores mais os novos).

- [ ] **Step 6: Commit**

```bash
git add src/data && git commit -m "feat: add mock overview, trend and agreement catalog repositories

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 3: Mock de motivos, seguros e workflows (TDD)

**Files:**
- Create: `src/data/mock/breakdowns.ts`, `src/data/mock/workflows.ts`
- Modify: `src/data/repositories/card-processing.ts`, `src/data/repositories/mock/card-processing.ts`
- Test: `src/data/mock/breakdowns.test.ts`, `src/data/mock/workflows.test.ts`, `src/data/repositories/mock/card-processing-sections.test.ts`

**Interfaces:**
- Consumes: `buildOverview` (Task 2), `splitByWeights`/`seedFor` (Task 1), `createRng`.
- Produces:
  - `buildIntegrationReasons(f): IntegrationReasons`, `buildAccountReasons(f): AccountReasons`, `buildInsuranceBreakdown(f): InsuranceBreakdown`
  - `getWorkflowInfo(kpi: WorkflowKpi): WorkflowInfo`
  - `CardProcessingRepository` ganha `getIntegrationReasons(f)`, `getAccountReasons(f)`, `getInsuranceBreakdown(f)` (todos `Promise<...>`) e `getWorkflow(kpi: WorkflowKpi): Promise<WorkflowInfo>`

- [ ] **Step 1: Escrever os testes que falham**

`src/data/mock/breakdowns.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { DEFAULT_FILTERS } from '@/data/types/filters'
import { buildAccountReasons, buildInsuranceBreakdown, buildIntegrationReasons } from './breakdowns'
import { buildOverview } from './overview'

const sum = (items: { count: number }[]) => items.reduce((s, i) => s + i.count, 0)

describe('breakdowns tie to the overview', () => {
  const filters = { ...DEFAULT_FILTERS, region: 'sudeste' as const }
  const o = buildOverview(filters)

  it('integration reasons', () => {
    const r = buildIntegrationReasons(filters)
    expect(r.stopReasons).toHaveLength(5)
    expect(sum(r.stopReasons)).toBe(Math.round(o.integration.digitized * 0.2))
    expect(sum(r.nonDigitizedBreakdown)).toBe(o.integration.notDigitized)
  })
  it('account reasons', () => {
    const r = buildAccountReasons(filters)
    expect(sum(r.created)).toBe(o.accounts.created)
    expect(sum(r.notCreated)).toBe(o.accounts.notCreated)
  })
  it('insurance breakdown', () => {
    const b = buildInsuranceBreakdown(filters)
    expect(sum(b.byCoverage)).toBe(o.insurance.total)
    expect(sum(b.byValue)).toBe(o.insurance.withInsurance)
    expect(sum(b.byAssignment)).toBe(b.byValue[0]?.count)
  })
  it('is deterministic', () => {
    expect(buildInsuranceBreakdown(filters)).toEqual(buildInsuranceBreakdown(filters))
  })
})
```

`src/data/mock/workflows.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import type { OrgNode, WorkflowKpi } from '@/data/types/card-processing'
import { getWorkflowInfo } from './workflows'

const KPIS: WorkflowKpi[] = ['integration', 'accounts', 'cards', 'insurance']
const flatten = (n: OrgNode): OrgNode[] => [n, ...n.children.flatMap(flatten)]

describe('getWorkflowInfo', () => {
  it.each(KPIS)('has a coherent flow, org chart and docs for %s', (kpi) => {
    const info = getWorkflowInfo(kpi)
    expect(info.flow).toHaveLength(5)
    expect(new Set(info.flow.map((s) => s.id)).size).toBe(5)
    const nodes = flatten(info.org)
    expect(new Set(nodes.map((n) => n.id)).size).toBe(nodes.length)
    expect(info.docs.length).toBeGreaterThanOrEqual(1)
  })
  it('uses only generic role names (no real people)', () => {
    for (const kpi of KPIS) {
      for (const n of flatten(getWorkflowInfo(kpi).org)) {
        expect(n.name).toMatch(/^(Gestor Geral|Supervisor de Operações|Analista \d+)$/)
      }
    }
  })
  it('sizes the team per kpi', () => {
    const analysts = (k: WorkflowKpi) => flatten(getWorkflowInfo(k).org).filter((n) => n.role === 'Equipe')
    expect(analysts('cards')).toHaveLength(6)
    expect(analysts('accounts')).toHaveLength(2)
  })
})
```

`src/data/repositories/mock/card-processing-sections.test.ts`:

```ts
import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_FILTERS } from '@/data/types/filters'
import { mockCardProcessingRepository as repo } from './card-processing'

describe('mockCardProcessingRepository sections', () => {
  beforeEach(() => window.history.replaceState({}, '', '/?delay=0'))
  it('serves every section', async () => {
    expect((await repo.getOverview(DEFAULT_FILTERS)).integration.digitized).toBeGreaterThan(0)
    expect(await repo.getIntegrationTrend(DEFAULT_FILTERS)).toHaveLength(12)
    expect((await repo.getIntegrationReasons(DEFAULT_FILTERS)).stopReasons.length).toBeGreaterThan(0)
    expect((await repo.getAccountReasons(DEFAULT_FILTERS)).notCreated.length).toBeGreaterThan(0)
    expect((await repo.getInsuranceBreakdown(DEFAULT_FILTERS)).byValue).toHaveLength(2)
    expect((await repo.getWorkflow('cards')).flow.length).toBe(5)
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/data/mock/breakdowns.test.ts src/data/mock/workflows.test.ts src/data/repositories/mock/card-processing-sections.test.ts`
Expected: FAIL (módulos e métodos inexistentes).

- [ ] **Step 3: Implementar `breakdowns.ts`**

```ts
import type {
  AccountReasons,
  InsuranceBreakdown,
  IntegrationReasons,
} from '@/data/types/card-processing'
import type { GlobalFilters } from '@/data/types/filters'
import { buildOverview } from './overview'
import { createRng } from './random'
import { seedFor, splitByWeights } from './scale'

const STOP_REASONS = [
  'Margem negativa',
  'Em criação de conta',
  'Endereço errado',
  'Benefício assistencial',
  'Emissão não autorizada',
] as const
const NON_DIGITIZED = ['Saque realizado', 'Liquidado'] as const
const CREATED = ['Conta nova', 'Conta portada', 'Conta reaproveitada'] as const
const NOT_CREATED = ['Endereço errado', 'Documentação incompleta', 'Dados inválidos', 'Erro de sistema'] as const

export function buildIntegrationReasons(f: GlobalFilters): IntegrationReasons {
  const o = buildOverview(f)
  const rng = createRng(seedFor(f, 'integration-reasons'))
  return {
    stopReasons: splitByWeights(Math.round(o.integration.digitized * 0.2), STOP_REASONS, rng),
    nonDigitizedBreakdown: splitByWeights(o.integration.notDigitized, NON_DIGITIZED, rng),
  }
}

export function buildAccountReasons(f: GlobalFilters): AccountReasons {
  const o = buildOverview(f)
  const rng = createRng(seedFor(f, 'account-reasons'))
  return {
    created: splitByWeights(o.accounts.created, CREATED, rng),
    notCreated: splitByWeights(o.accounts.notCreated, NOT_CREATED, rng),
  }
}

export function buildInsuranceBreakdown(f: GlobalFilters): InsuranceBreakdown {
  const { insurance } = buildOverview(f)
  const rng = createRng(seedFor(f, 'insurance'))
  const large = Math.round(insurance.withInsurance * (0.55 + rng.next() * 0.2))
  const assigned = Math.round(large * (0.4 + rng.next() * 0.3))
  return {
    byCoverage: [
      { reason: 'Com seguro', count: insurance.withInsurance },
      { reason: 'Sem seguro', count: insurance.withoutInsurance },
    ],
    byValue: [
      { reason: 'Maiores que R$ 200', count: large },
      { reason: 'Menores que R$ 200', count: insurance.withInsurance - large },
    ],
    byAssignment: [
      { reason: 'Casos cedidos', count: assigned },
      { reason: 'Em processo de cessão', count: large - assigned },
    ],
  }
}
```

- [ ] **Step 4: Implementar `workflows.ts` e ligar nos repositórios**

`src/data/mock/workflows.ts`:

```ts
import type { OrgNode, WorkflowDoc, WorkflowInfo, WorkflowKpi } from '@/data/types/card-processing'

const FLOWS: Record<WorkflowKpi, string[]> = {
  integration: [
    'Proposta recebida',
    'Validação de documentos',
    'Digitação no sistema',
    'Conferência',
    'Integração concluída',
  ],
  accounts: ['Proposta digitada', 'Análise de margem', 'Criação da conta', 'Confirmação de dados', 'Conta ativa'],
  cards: ['Conta criada', 'Emissão do cartão', 'Postagem', 'Rastreio', 'Entrega'],
  insurance: ['Proposta digitada', 'Oferta de seguro', 'Aceite do cliente', 'Emissão da apólice', 'Cessão'],
}

const TEAM_SIZE: Record<WorkflowKpi, number> = { integration: 3, accounts: 2, cards: 6, insurance: 3 }

const DOCS: Record<WorkflowKpi, WorkflowDoc[]> = {
  integration: [
    { id: 'pop-digitacao', title: 'POP: Digitação de propostas', description: 'Passo a passo da digitação e conferência.' },
    { id: 'pop-integracao', title: 'POP: Tratamento de pendências', description: 'Como tratar propostas paradas na integração.' },
  ],
  accounts: [
    { id: 'pop-contas', title: 'POP: Criação de contas', description: 'Regras de análise de margem e abertura de conta.' },
  ],
  cards: [
    { id: 'pop-emissao', title: 'POP: Emissão e postagem', description: 'Fluxo de emissão, postagem e rastreio.' },
    { id: 'pop-devolucao', title: 'POP: Cartões devolvidos', description: 'Tratamento de devolução e reenvio.' },
  ],
  insurance: [
    { id: 'pop-seguros', title: 'POP: Oferta de seguros', description: 'Abordagem, aceite e emissão da apólice.' },
    { id: 'pop-cessao', title: 'POP: Cessão de casos', description: 'Critérios e etapas da cessão.' },
  ],
}

function buildOrg(kpi: WorkflowKpi): OrgNode {
  const team: OrgNode[] = Array.from({ length: TEAM_SIZE[kpi] }, (_, i) => ({
    id: `analista-${i + 1}`,
    name: `Analista ${i + 1}`,
    role: 'Equipe',
    children: [],
  }))
  return {
    id: 'gestor',
    name: 'Gestor Geral',
    role: 'Gestão',
    children: [{ id: 'supervisor', name: 'Supervisor de Operações', role: 'Supervisão', children: team }],
  }
}

export function getWorkflowInfo(kpi: WorkflowKpi): WorkflowInfo {
  return {
    flow: FLOWS[kpi].map((label, i) => ({ id: `step-${i + 1}`, label })),
    org: buildOrg(kpi),
    docs: DOCS[kpi],
  }
}
```

Em `src/data/repositories/card-processing.ts`, importar os tipos `AccountReasons`, `InsuranceBreakdown`, `IntegrationReasons`, `WorkflowInfo`, `WorkflowKpi` e acrescentar à interface:

```ts
  getIntegrationReasons(filters: GlobalFilters): Promise<IntegrationReasons>
  getAccountReasons(filters: GlobalFilters): Promise<AccountReasons>
  getInsuranceBreakdown(filters: GlobalFilters): Promise<InsuranceBreakdown>
  getWorkflow(kpi: WorkflowKpi): Promise<WorkflowInfo>
```

Em `src/data/repositories/mock/card-processing.ts`, importar as funções de `@/data/mock/breakdowns` e `getWorkflowInfo` de `@/data/mock/workflows` e acrescentar:

```ts
  getIntegrationReasons: (filters) => simulate(() => buildIntegrationReasons(filters)),
  getAccountReasons: (filters) => simulate(() => buildAccountReasons(filters)),
  getInsuranceBreakdown: (filters) => simulate(() => buildInsuranceBreakdown(filters)),
  getWorkflow: (kpi) => simulate(() => getWorkflowInfo(kpi)),
```

- [ ] **Step 5: Rodar tudo e ver passar**

Run: `npm test && npm run typecheck && npm run lint`
Expected: todos passam.

- [ ] **Step 6: Commit**

```bash
git add src/data && git commit -m "feat: add mock breakdowns, insurance split and workflow info

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 4: `useDomainQuery`, `useDevFlags` e hooks do domínio (TDD)

**Files:**
- Create: `src/app/data/useDomainQuery.ts`
- Modify: `src/features/card-processing/api.ts`
- Test: `src/app/data/useDomainQuery.test.tsx`

**Interfaces:**
- Consumes: `useGlobalFilters` (`@/app/filters/useGlobalFilters`), `readDevFlags` (`@/data/mock/simulate`), `repositories`.
- Produces:
  - `useDevFlags(): DevFlags` (memoizado pelo `search` da URL)
  - `useDomainQuery<T>(domain: string, name: string, fetcher: (filters: GlobalFilters) => Promise<T>): UseQueryResult<T>` com `queryKey = [domain, name, filters, devFlags]`
  - Em `api.ts`: `useOverview()`, `useIntegrationTrend()`, `useIntegrationReasons()`, `useAccountReasons()`, `useInsuranceBreakdown()` (todos via `useDomainQuery('card-processing', ...)`), `useWorkflow(kpi: WorkflowKpi)` (chave `['card-processing','workflow',kpi,devFlags]`, `staleTime: Infinity`); `useCardProcessingKpis` passa a usar `useDomainQuery`.

- [ ] **Step 1: Escrever o teste que falha**

`src/app/data/useDomainQuery.test.tsx`:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter, useNavigate } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import type { GlobalFilters } from '@/data/types/filters'
import { useDevFlags, useDomainQuery } from './useDomainQuery'

const wrap = (url: string) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[url]}>{children}</MemoryRouter>
    </QueryClientProvider>
  )
}

describe('useDomainQuery', () => {
  it('passes validated filters to the fetcher and returns its data', async () => {
    const fetcher = vi.fn(async (f: GlobalFilters) => ({ period: f.period }))
    const { result } = renderHook(() => useDomainQuery('t', 'x', fetcher), {
      wrapper: wrap('/?period=30d'),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ period: '30d' })
    expect(fetcher).toHaveBeenCalledWith(expect.objectContaining({ period: '30d' }))
  })

  it('refetches when a dev flag changes in the URL', async () => {
    const fetcher = vi.fn(async () => 1)
    const { result } = renderHook(
      () => ({ q: useDomainQuery('t', 'y', fetcher), navigate: useNavigate() }),
      { wrapper: wrap('/?delay=0') },
    )
    await waitFor(() => expect(result.current.q.isSuccess).toBe(true))
    act(() => result.current.navigate('/?delay=0&error=1'))
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2))
  })
})

describe('useDevFlags', () => {
  it('reads the flags from the URL', () => {
    const { result } = renderHook(() => useDevFlags(), { wrapper: wrap('/?delay=0&error=1') })
    expect(result.current).toEqual({ delayMs: 0, forceError: true })
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/app/data`
Expected: FAIL (módulo `./useDomainQuery` não existe).

- [ ] **Step 3: Implementar**

`src/app/data/useDomainQuery.ts`:

```ts
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useGlobalFilters } from '@/app/filters/useGlobalFilters'
import { readDevFlags, type DevFlags } from '@/data/mock/simulate'
import type { GlobalFilters } from '@/data/types/filters'

export function useDevFlags(): DevFlags {
  const { search } = useLocation()
  return useMemo(() => readDevFlags(search), [search])
}

export function useDomainQuery<T>(
  domain: string,
  name: string,
  fetcher: (filters: GlobalFilters) => Promise<T>,
) {
  const { filters } = useGlobalFilters()
  const devFlags = useDevFlags()
  return useQuery({
    queryKey: [domain, name, filters, devFlags],
    queryFn: () => fetcher(filters),
  })
}
```

`src/features/card-processing/api.ts` (substitui o conteúdo atual):

```ts
import { useQuery } from '@tanstack/react-query'
import { useDevFlags, useDomainQuery } from '@/app/data/useDomainQuery'
import { repositories } from '@/data/repositories'
import type { WorkflowKpi } from '@/data/types/card-processing'

const repo = repositories.cardProcessing

export const useCardProcessingKpis = () =>
  useDomainQuery('card-processing', 'kpis', (f) => repo.getKpis(f))
export const useOverview = () => useDomainQuery('card-processing', 'overview', (f) => repo.getOverview(f))
export const useIntegrationTrend = () =>
  useDomainQuery('card-processing', 'trend', (f) => repo.getIntegrationTrend(f))
export const useIntegrationReasons = () =>
  useDomainQuery('card-processing', 'integration-reasons', (f) => repo.getIntegrationReasons(f))
export const useAccountReasons = () =>
  useDomainQuery('card-processing', 'account-reasons', (f) => repo.getAccountReasons(f))
export const useInsuranceBreakdown = () =>
  useDomainQuery('card-processing', 'insurance', (f) => repo.getInsuranceBreakdown(f))

export function useWorkflow(kpi: WorkflowKpi) {
  const devFlags = useDevFlags()
  return useQuery({
    queryKey: ['card-processing', 'workflow', kpi, devFlags],
    queryFn: () => repo.getWorkflow(kpi),
    staleTime: Infinity,
  })
}
```

- [ ] **Step 4: Rodar tudo e ver passar**

Run: `npm test && npm run typecheck && npm run lint`
Expected: todos passam, incluindo os testes existentes de `CardProcessingPage` (a chave agora vem de `useDomainQuery`).

- [ ] **Step 5: Commit**

```bash
git add src && git commit -m "feat: add useDomainQuery and card-processing data hooks

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 5: Modal acessível (TDD)

**Files:**
- Create: `src/shared/ui/Modal.tsx`
- Test: `src/shared/ui/Modal.test.tsx`

**Interfaces:**
- Produces: `Modal({ open: boolean; title: string; onClose: () => void; children: ReactNode; wide?: boolean })`. Renderiza em portal no `document.body` só quando `open`; `role="dialog"`, `aria-modal="true"` e `aria-labelledby` no título; fecha com Esc, clique no fundo e botão "Fechar"; foca o botão ao abrir, trava a rolagem do `body` e devolve foco e rolagem ao fechar.

- [ ] **Step 1: Escrever o teste que falha**

`src/shared/ui/Modal.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Modal } from './Modal'

const setup = (open = true) => {
  const onClose = vi.fn()
  const view = render(
    <Modal open={open} title="Detalhamento" onClose={onClose}>
      <p>Conteúdo</p>
    </Modal>,
  )
  return { onClose, ...view }
}

describe('Modal', () => {
  it('renders nothing when closed', () => {
    setup(false)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
  it('renders an accessible dialog with title and content', () => {
    setup()
    expect(screen.getByRole('dialog', { name: 'Detalhamento' })).toHaveAttribute('aria-modal', 'true')
    expect(screen.getByText('Conteúdo')).toBeInTheDocument()
  })
  it('closes on Escape, on the close button and on backdrop click, but not on inner click', async () => {
    const { onClose } = setup()
    await userEvent.keyboard('{Escape}')
    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(onClose).toHaveBeenCalledTimes(2)
    await userEvent.click(screen.getByText('Conteúdo'))
    expect(onClose).toHaveBeenCalledTimes(2)
    await userEvent.click(screen.getByTestId('modal-backdrop'))
    expect(onClose).toHaveBeenCalledTimes(3)
  })
  it('focuses the close button and locks body scroll while open', () => {
    const { unmount } = setup()
    expect(screen.getByRole('button', { name: 'Fechar' })).toHaveFocus()
    expect(document.body.style.overflow).toBe('hidden')
    unmount()
    expect(document.body.style.overflow).toBe('')
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/shared/ui/Modal.test.tsx`
Expected: FAIL (módulo `./Modal` não existe).

- [ ] **Step 3: Implementar**

`src/shared/ui/Modal.tsx`:

```tsx
import { X } from 'lucide-react'
import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  wide?: boolean
}

export function Modal({ open, title, onClose, children, wide = false }: ModalProps) {
  const titleId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus?.()
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      data-testid="modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`max-h-[90vh] w-full overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900 ${
          wide ? 'max-w-5xl' : 'max-w-2xl'
        }`}
      >
        <header className="mb-4 flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-lg font-semibold">
            {title}
          </h2>
          <button
            ref={closeRef}
            type="button"
            aria-label="Fechar"
            onClick={onClose}
            className="rounded-md p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={18} aria-hidden />
          </button>
        </header>
        {children}
      </div>
    </div>,
    document.body,
  )
}
```

- [ ] **Step 4: Rodar tudo e ver passar**

Run: `npx vitest run src/shared/ui/Modal.test.tsx && npm run typecheck && npm run lint`
Expected: PASS (4 testes). Se o clique no fundo não disparar (o componente usa `onMouseDown` e o `userEvent.click` emite `mousedown`), manter `onMouseDown`; se `react-hooks` reclamar de atualizar o ref no efeito sem dependências, é o padrão aceito aqui.

- [ ] **Step 5: Commit**

```bash
git add src/shared/ui && git commit -m "feat: add accessible Modal

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 6: Wrappers de gráfico com Recharts (TDD)

**Files:**
- Modify: `package.json` (dependência `recharts`), `src/test/setup.ts`
- Create: `src/shared/charts/chartTheme.ts`, `src/shared/charts/percent.ts`, `src/shared/charts/PieChartCard.tsx`, `src/shared/charts/BarChartCard.tsx`, `src/shared/charts/LineChartCard.tsx`
- Test: `src/shared/charts/percent.test.ts`, `src/shared/charts/charts.test.tsx`

**Interfaces:**
- Consumes: `formatNumber`, `formatPercentage` (`@/shared/lib/formatters`).
- Produces (nenhum tipo do domínio entra em `shared`):
  - `type ChartDatum = { label: string; value: number }`
  - `CHART_COLORS: readonly string[]` (8 cores) e `ACCENT_HEX: Record<'green' | 'pink' | 'red' | 'blue' | 'purple', string>`
  - `toPercentages(items: readonly ChartDatum[]): (ChartDatum & { percent: number })[]` (percentuais em pontos, `0` se o total for `0`)
  - `PieChartCard({ title: string; data: ChartDatum[]; footnote?: string })`: rosca + legenda HTML `<ul>` com `"<label>: <percent com 1 casa>"`
  - `BarChartCard({ title?: string; data: (ChartDatum & { color?: string })[]; height?: number })`
  - `LineChartCard({ title: string; data: ChartDatum[]; suffix?: string; color?: string; height?: number })`

- [ ] **Step 1: Instalar Recharts e preparar o ambiente de teste**

```bash
npm i recharts@latest
```

O `ResponsiveContainer` do Recharts não renderiza em jsdom (largura 0) e emite warnings. Acrescentar ao **final** de `src/test/setup.ts`:

```ts
import { cloneElement, type ReactElement } from 'react'
import { vi } from 'vitest'

vi.mock('recharts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('recharts')>()
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: ReactElement<object> }) =>
      cloneElement(children, { width: 400, height: 300 }),
  }
})
```

Se o `vi.mock` no arquivo de setup não valer para os testes (o gráfico não renderiza `svg`), mover o mesmo mock para o topo de `charts.test.tsx` e registrar o desvio no relatório.

- [ ] **Step 2: Escrever os testes que falham**

`src/shared/charts/percent.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { toPercentages } from './percent'

describe('toPercentages', () => {
  it('computes each share in percentage points', () => {
    const result = toPercentages([
      { label: 'A', value: 1 },
      { label: 'B', value: 3 },
    ])
    expect(result.map((r) => r.percent)).toEqual([25, 75])
    expect(result[0]?.label).toBe('A')
  })
  it('returns 0 when the total is 0', () => {
    expect(toPercentages([{ label: 'A', value: 0 }])[0]?.percent).toBe(0)
  })
})
```

`src/shared/charts/charts.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { BarChartCard } from './BarChartCard'
import { LineChartCard } from './LineChartCard'
import { PieChartCard } from './PieChartCard'

afterEach(() => vi.restoreAllMocks())

describe('PieChartCard', () => {
  it('renders the title, an svg and a legend with percentages', () => {
    const error = vi.spyOn(console, 'error')
    const warn = vi.spyOn(console, 'warn')
    const { container } = render(
      <PieChartCard
        title="Distribuição"
        footnote="* nota"
        data={[
          { label: 'A', value: 1 },
          { label: 'B', value: 3 },
        ]}
      />,
    )
    expect(screen.getByRole('heading', { name: 'Distribuição' })).toBeInTheDocument()
    expect(container.querySelector('svg')).not.toBeNull()
    const legend = screen.getByRole('list', { name: 'Legenda de Distribuição' })
    expect(legend).toHaveTextContent('A: 25,0%')
    expect(legend).toHaveTextContent('B: 75,0%')
    expect(screen.getByText('* nota')).toBeInTheDocument()
    expect(error).not.toHaveBeenCalled()
    expect(warn).not.toHaveBeenCalled()
  })
})

describe('BarChartCard', () => {
  it('renders an svg and an accessible summary of the values', () => {
    const { container } = render(
      <BarChartCard
        title="Digitadas x Não digitadas"
        data={[
          { label: 'Digitadas', value: 800 },
          { label: 'Não digitadas', value: 200, color: '#ec4899' },
        ]}
      />,
    )
    expect(screen.getByRole('heading', { name: 'Digitadas x Não digitadas' })).toBeInTheDocument()
    expect(container.querySelector('svg')).not.toBeNull()
    expect(screen.getByRole('img')).toHaveAccessibleName(/Digitadas: 800/)
  })
})

describe('LineChartCard', () => {
  it('renders the title and an svg', () => {
    const { container } = render(
      <LineChartCard
        title="Tendência"
        suffix="%"
        data={[
          { label: 'Jan', value: 75 },
          { label: 'Fev', value: 80 },
        ]}
      />,
    )
    expect(screen.getByRole('heading', { name: 'Tendência' })).toBeInTheDocument()
    expect(container.querySelector('svg')).not.toBeNull()
    expect(screen.getByRole('img')).toHaveAccessibleName(/Jan: 75/)
  })
})
```

- [ ] **Step 3: Rodar e ver falhar**

Run: `npx vitest run src/shared/charts`
Expected: FAIL (módulos inexistentes).

- [ ] **Step 4: Implementar tema, tipos e percentuais**

`src/shared/charts/types.ts`:

```ts
export interface ChartDatum {
  label: string
  value: number
}
```

`src/shared/charts/chartTheme.ts`:

```ts
export const CHART_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#14b8a6', '#f97316', '#ec4899',
] as const

export const ACCENT_HEX = {
  green: '#10b981',
  pink: '#ec4899',
  red: '#ef4444',
  blue: '#3b82f6',
  purple: '#a855f7',
} as const

export const CHART_CARD_CLASS =
  'rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900'

export const describeData = (data: readonly { label: string; value: number }[], suffix = ''): string =>
  data
    .map((d) => `${d.label}: ${d.value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}${suffix}`)
    .join(', ')
```

`src/shared/charts/percent.ts`:

```ts
import type { ChartDatum } from './types'

export function toPercentages(items: readonly ChartDatum[]): (ChartDatum & { percent: number })[] {
  const total = items.reduce((sum, item) => sum + item.value, 0)
  return items.map((item) => ({ ...item, percent: total === 0 ? 0 : (item.value / total) * 100 }))
}
```

- [ ] **Step 5: Implementar os três gráficos**

`src/shared/charts/PieChartCard.tsx`:

```tsx
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { formatNumber, formatPercentage } from '@/shared/lib/formatters'
import { CHART_CARD_CLASS, CHART_COLORS } from './chartTheme'
import { toPercentages } from './percent'
import type { ChartDatum } from './types'

interface PieChartCardProps {
  title: string
  data: ChartDatum[]
  footnote?: string
}

export function PieChartCard({ title, data, footnote }: PieChartCardProps) {
  const color = (i: number) => CHART_COLORS[i % CHART_COLORS.length]
  return (
    <section className={CHART_CARD_CLASS}>
      <h3 className="mb-2 text-base font-semibold">{title}</h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="label" innerRadius={40} outerRadius={80}>
              {data.map((d, i) => (
                <Cell key={d.label} fill={color(i)} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatNumber(Number(value))} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul aria-label={`Legenda de ${title}`} className="mt-2 grid grid-cols-1 gap-1 text-xs sm:grid-cols-2">
        {toPercentages(data).map((d, i) => (
          <li key={d.label} className="flex items-center gap-2">
            <span aria-hidden className="size-3 shrink-0 rounded-full" style={{ backgroundColor: color(i) }} />
            {`${d.label}: ${formatPercentage(d.percent, 1)}`}
          </li>
        ))}
      </ul>
      {footnote && <p className="mt-2 text-center text-xs italic text-slate-500">{footnote}</p>}
    </section>
  )
}
```

`src/shared/charts/BarChartCard.tsx`:

```tsx
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatNumber } from '@/shared/lib/formatters'
import { CHART_CARD_CLASS, CHART_COLORS, describeData } from './chartTheme'
import type { ChartDatum } from './types'

interface BarChartCardProps {
  title?: string
  data: (ChartDatum & { color?: string })[]
  height?: number
}

export function BarChartCard({ title, data, height = 240 }: BarChartCardProps) {
  return (
    <section className={CHART_CARD_CLASS}>
      {title && <h3 className="mb-2 text-base font-semibold">{title}</h3>}
      <div role="img" aria-label={describeData(data)} style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" />
            <YAxis tickFormatter={(v) => formatNumber(Number(v))} />
            <Tooltip formatter={(value) => formatNumber(Number(value))} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((d, i) => (
                <Cell key={d.label} fill={d.color ?? CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
```

`src/shared/charts/LineChartCard.tsx`:

```tsx
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ACCENT_HEX, CHART_CARD_CLASS, describeData } from './chartTheme'
import type { ChartDatum } from './types'

interface LineChartCardProps {
  title: string
  data: ChartDatum[]
  suffix?: string
  color?: string
  height?: number
}

export function LineChartCard({ title, data, suffix = '', color = ACCENT_HEX.purple, height = 260 }: LineChartCardProps) {
  return (
    <section className={CHART_CARD_CLASS}>
      <h3 className="mb-2 text-base font-semibold">{title}</h3>
      <div role="img" aria-label={`${title}. ${describeData(data, suffix)}`} style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" />
            <YAxis tickFormatter={(v) => `${v}${suffix}`} />
            <Tooltip formatter={(value) => `${value}${suffix}`} />
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
```

- [ ] **Step 6: Rodar tudo e ver passar**

Run: `npm test && npm run typecheck && npm run lint && npm run build`
Expected: todos passam, sem `console.error`/`console.warn` nos testes de gráfico. Ajustes aceitáveis sem replanejar: tipagem do `formatter` do `Tooltip` conforme a versão instalada do Recharts (usar `(value) => ...` com `Number(value)`), e nome acessível do `role="img"`. Registrar qualquer desvio no relatório.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json src && git commit -m "feat: add Recharts-based Pie, Bar and Line chart cards

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 7: KPICard estendido e SummaryStat (TDD)

**Files:**
- Modify: `src/shared/ui/KPICard.tsx`, `src/shared/ui/KPICard.test.tsx`
- Create: `src/shared/ui/SummaryStat.tsx`
- Test: `src/shared/ui/SummaryStat.test.tsx`

**Interfaces:**
- Produces:
  - `KPICard({ label: string; value: string; hint?: string; icon?: LucideIcon; accent?: KPIAccent; onSelect?: () => void; children?: ReactNode; actions?: ReactNode })`, com `type KPIAccent = 'blue' | 'purple' | 'teal' | 'orange' | 'pink'` (padrão `'blue'`). Com `onSelect`, o bloco de rótulo/valor vira um `<button>` (o nome acessível é o próprio texto). `children` é o resumo, `actions` a linha de botões; ambos ficam fora do `<button>`.
  - `SummaryStat({ label: string; value: string; tone?: 'blue' | 'green' | 'red' })`
  - Compatível com os usos existentes (`label`, `value`, `hint`). Corrige de quebra o contraste do `hint` no tema escuro (item Minor do Plano 1).

- [ ] **Step 1: Escrever os testes que falham**

Substituir `src/shared/ui/KPICard.test.tsx` por (o primeiro teste é o existente):

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreditCard } from 'lucide-react'
import { describe, expect, it, vi } from 'vitest'
import { KPICard } from './KPICard'

describe('KPICard', () => {
  it('renders label, value and optional hint', () => {
    render(<KPICard label="Taxa de integração" value="80,00%" hint="vs. mês anterior" />)
    expect(screen.getByText('Taxa de integração')).toBeInTheDocument()
    expect(screen.getByText('80,00%')).toBeInTheDocument()
    expect(screen.getByText('vs. mês anterior')).toBeInTheDocument()
  })

  it('is not interactive without onSelect', () => {
    render(<KPICard label="Contas" value="10" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('calls onSelect when the value area is clicked', async () => {
    const onSelect = vi.fn()
    render(<KPICard label="Contas" value="10" onSelect={onSelect} />)
    await userEvent.click(screen.getByRole('button', { name: /Contas/ }))
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('renders the icon, the summary children and the actions outside the select button', async () => {
    const onSelect = vi.fn()
    const onAction = vi.fn()
    const { container } = render(
      <KPICard label="Contas" value="10" icon={CreditCard} accent="teal" onSelect={onSelect} actions={<button type="button" onClick={onAction}>Fluxograma</button>}>
        <p>Resumo</p>
      </KPICard>,
    )
    expect(container.querySelector('svg')).not.toBeNull()
    expect(screen.getByText('Resumo')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Fluxograma' }))
    expect(onAction).toHaveBeenCalledTimes(1)
    expect(onSelect).not.toHaveBeenCalled()
  })
})
```

`src/shared/ui/SummaryStat.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SummaryStat } from './SummaryStat'

describe('SummaryStat', () => {
  it('renders label and value', () => {
    render(<SummaryStat label="Contas criadas" value="830" tone="green" />)
    expect(screen.getByText('Contas criadas')).toBeInTheDocument()
    expect(screen.getByText('830')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/shared/ui/KPICard.test.tsx src/shared/ui/SummaryStat.test.tsx`
Expected: FAIL (os testes novos do KPICard e o módulo `./SummaryStat` não existem).

- [ ] **Step 3: Implementar**

`src/shared/ui/KPICard.tsx` (substitui o conteúdo):

```tsx
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export type KPIAccent = 'blue' | 'purple' | 'teal' | 'orange' | 'pink'

const ACCENT_CLASSES: Record<KPIAccent, string> = {
  blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300',
  purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-300',
  teal: 'bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-300',
  orange: 'bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-300',
  pink: 'bg-pink-50 text-pink-600 dark:bg-pink-950 dark:text-pink-300',
}

interface KPICardProps {
  label: string
  value: string
  hint?: string
  icon?: LucideIcon
  accent?: KPIAccent
  onSelect?: () => void
  children?: ReactNode
  actions?: ReactNode
}

export function KPICard({ label, value, hint, icon: Icon, accent = 'blue', onSelect, children, actions }: KPICardProps) {
  const head = (
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
        {hint && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
      </div>
      {Icon && (
        <span aria-hidden className={`rounded-lg p-2 ${ACCENT_CLASSES[accent]}`}>
          <Icon size={20} />
        </span>
      )}
    </div>
  )
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {onSelect ? (
        <button type="button" onClick={onSelect} className="block w-full cursor-pointer text-left">
          {head}
        </button>
      ) : (
        head
      )}
      {children && <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-800">{children}</div>}
      {actions && <div className="mt-3 flex flex-wrap gap-2">{actions}</div>}
    </article>
  )
}
```

`src/shared/ui/SummaryStat.tsx`:

```tsx
const TONES = {
  blue: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  green: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300',
  red: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
} as const

interface SummaryStatProps {
  label: string
  value: string
  tone?: keyof typeof TONES
}

export function SummaryStat({ label, value, tone = 'blue' }: SummaryStatProps) {
  return (
    <div className={`rounded-lg p-2 text-center ${TONES[tone]}`}>
      <p className="text-xs">{label}</p>
      <p className="text-lg font-bold tabular-nums">{value}</p>
    </div>
  )
}
```

- [ ] **Step 4: Rodar tudo e ver passar**

Run: `npm test && npm run typecheck && npm run lint`
Expected: todos passam (a página exemplar do Plano 1 continua funcionando, pois só usa `label`, `value`).

- [ ] **Step 5: Commit**

```bash
git add src/shared/ui && git commit -m "feat: extend KPICard with icon, summary and actions; add SummaryStat

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 8: Filtros de convênio (TDD)

**Files:**
- Create: `src/app/filters/useAgreementCatalog.ts`, `src/app/filters/AgreementFilters.tsx`
- Test: `src/app/filters/AgreementFilters.test.tsx`

**Interfaces:**
- Consumes: `useGlobalFilters` (Plano 1), `repositories.catalog` (Task 2), `useDevFlags` (Task 4).
- Produces:
  - `useAgreementCatalog(): UseQueryResult<AgreementCatalog>` (chave `['catalog', devFlags]`, `staleTime: Infinity`)
  - `AgreementFilters()`: dois `<select>` com rótulos "Categoria" e "Convênio". "Categoria" lista `Todas` mais as categorias; "Convênio" lista `Todos` mais os convênios da categoria escolhida (ou de todas, se `all`). Trocar a categoria zera o convênio (regra do `useGlobalFilters`). Enquanto carrega, os selects ficam desabilitados; em erro mostra "Filtros de convênio indisponíveis".

- [ ] **Step 1: Escrever o teste que falha**

`src/app/filters/AgreementFilters.test.tsx`:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { AgreementFilters } from './AgreementFilters'

const renderAt = (url: string) =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter initialEntries={[url]}>
        <AgreementFilters />
      </MemoryRouter>
    </QueryClientProvider>,
  )

describe('AgreementFilters', () => {
  beforeEach(() => window.history.replaceState({}, '', '/?delay=0'))

  it('lists all agreements when no category is selected', async () => {
    renderAt('/')
    expect(await screen.findByRole('option', { name: 'INSS Aposentados' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Governo Federal' })).toBeInTheDocument()
  })

  it('narrows agreements to the selected category and keeps the choice in the URL state', async () => {
    renderAt('/')
    await screen.findByRole('option', { name: 'INSS Aposentados' })
    await userEvent.selectOptions(screen.getByLabelText('Categoria'), 'inss')
    expect(screen.queryByRole('option', { name: 'Governo Federal' })).not.toBeInTheDocument()
    await userEvent.selectOptions(screen.getByLabelText('Convênio'), 'inss-pensionistas')
    expect(screen.getByLabelText('Convênio')).toHaveValue('inss-pensionistas')
  })

  it('resets the agreement when the category changes', async () => {
    renderAt('/?agreementCategory=inss&agreement=inss-pensionistas')
    await screen.findByRole('option', { name: 'INSS Pensionistas' })
    expect(screen.getByLabelText('Convênio')).toHaveValue('inss-pensionistas')
    await userEvent.selectOptions(screen.getByLabelText('Categoria'), 'governo')
    expect(screen.getByLabelText('Convênio')).toHaveValue('all')
  })

  it('shows a fallback message when the catalog fails to load', async () => {
    window.history.replaceState({}, '', '/?delay=0&error=1')
    renderAt('/?delay=0&error=1')
    expect(await screen.findByText('Filtros de convênio indisponíveis')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/app/filters/AgreementFilters.test.tsx`
Expected: FAIL (módulos inexistentes).

- [ ] **Step 3: Implementar**

`src/app/filters/useAgreementCatalog.ts`:

```ts
import { useQuery } from '@tanstack/react-query'
import { useDevFlags } from '@/app/data/useDomainQuery'
import { repositories } from '@/data/repositories'

export function useAgreementCatalog() {
  const devFlags = useDevFlags()
  return useQuery({
    queryKey: ['catalog', devFlags],
    queryFn: () => repositories.catalog.getAgreementCatalog(),
    staleTime: Infinity,
  })
}
```

`src/app/filters/AgreementFilters.tsx`:

```tsx
import { useAgreementCatalog } from './useAgreementCatalog'
import { useGlobalFilters } from './useGlobalFilters'

const selectClass =
  'rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900'

export function AgreementFilters() {
  const { filters, setFilters } = useGlobalFilters()
  const catalog = useAgreementCatalog()

  if (catalog.isError) {
    return <p className="text-sm text-slate-500">Filtros de convênio indisponíveis</p>
  }

  const categories = catalog.data?.categories ?? []
  const visible = filters.agreementCategory === 'all'
    ? categories
    : categories.filter((c) => c.id === filters.agreementCategory)
  const agreements = visible.flatMap((c) => c.agreements)

  return (
    <div className="flex flex-wrap gap-4">
      <label className="flex items-center gap-2 text-sm">
        Categoria
        <select
          className={selectClass}
          disabled={catalog.isPending}
          value={filters.agreementCategory}
          onChange={(e) => setFilters({ agreementCategory: e.target.value })}
        >
          <option value="all">Todas</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm">
        Convênio
        <select
          className={selectClass}
          disabled={catalog.isPending}
          value={filters.agreement}
          onChange={(e) => setFilters({ agreement: e.target.value })}
        >
          <option value="all">Todos</option>
          {agreements.map((a) => (
            <option key={a.id} value={a.id}>{a.label}</option>
          ))}
        </select>
      </label>
    </div>
  )
}
```

- [ ] **Step 4: Rodar tudo e ver passar**

Run: `npm test && npm run typecheck && npm run lint`
Expected: todos passam. No teste 3, o `<select>` de convênio recebe `value="inss-pensionistas"` antes de as opções existirem; por isso o teste espera a opção aparecer antes de checar o valor. Se o valor não persistir por ordem de renderização, é aceitável renderizar as opções do `Convênio` apenas depois de o catálogo carregar, mantendo o `value` controlado.

- [ ] **Step 5: Commit**

```bash
git add src/app/filters && git commit -m "feat: add agreement category/agreement filters backed by catalog repository

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 9: Seções da página, KPIs e tendência (TDD)

**Files:**
- Create: `src/test/renderWithProviders.tsx`, `src/features/card-processing/kpis.ts`, `src/features/card-processing/OverviewCards.tsx`, `src/features/card-processing/IntegrationTrend.tsx`
- Test: `src/features/card-processing/OverviewCards.test.tsx`, `src/features/card-processing/IntegrationTrend.test.tsx`

**Interfaces:**
- Consumes: hooks do Task 4 (`useOverview`, `useIntegrationTrend`), `KPICard`/`SummaryStat` (Task 7), `LineChartCard` (Task 6), `QueryBoundary`/`Skeleton`, formatters.
- Produces:
  - `renderWithProviders(ui: ReactElement, options?: { url?: string })`: renderiza dentro de `QueryClientProvider` (retry desligado) e `MemoryRouter`.
  - `type WorkflowView = 'flowchart' | 'orgchart' | 'docs'`; `KPI_META: Record<WorkflowKpi, { title: string; detailsTitle: string; area: string }>`; `VIEW_LABEL: Record<WorkflowView, string>` (`Fluxograma`, `Organograma`, `POPs`)
  - `OverviewCards({ onDetails: (kpi: WorkflowKpi) => void; onWorkflow: (kpi: WorkflowKpi, view: WorkflowView) => void })`: 4 `KPICard` com resumo; cada botão de ação tem nome acessível `"<VIEW_LABEL>: <título do KPI>"`
  - `IntegrationTrend()`: `LineChartCard` com título `Taxa de Integração ao longo do tempo` e sufixo `%`

- [ ] **Step 1: Criar o helper de teste e os metadados**

`src/test/renderWithProviders.tsx`:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { MemoryRouter } from 'react-router-dom'

export function renderWithProviders(ui: ReactElement, { url = '/' }: { url?: string } = {}) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[url]}>{ui}</MemoryRouter>
    </QueryClientProvider>,
  )
}
```

`src/features/card-processing/kpis.ts`:

```ts
import type { WorkflowKpi } from '@/data/types/card-processing'

export type WorkflowView = 'flowchart' | 'orgchart' | 'docs'

export const KPI_META: Record<WorkflowKpi, { title: string; detailsTitle: string; area: string }> = {
  integration: { title: 'Taxa de Integração', detailsTitle: 'Taxa de Integração - Detalhamento', area: 'Operações' },
  accounts: { title: 'Contas Criadas', detailsTitle: 'Contas Criadas e Não Criadas - Detalhamento', area: 'Criação de Contas' },
  cards: { title: 'Cartões Enviados', detailsTitle: 'Cartões Enviados - Detalhamento', area: 'Envio de Cartões' },
  insurance: { title: 'Propostas com Seguro', detailsTitle: 'Propostas com Seguro - Detalhamento', area: 'Seguros' },
}

export const VIEW_LABEL: Record<WorkflowView, string> = {
  flowchart: 'Fluxograma',
  orgchart: 'Organograma',
  docs: 'POPs',
}
```

- [ ] **Step 2: Escrever os testes que falham**

`src/features/card-processing/OverviewCards.test.tsx`:

```tsx
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildOverview } from '@/data/mock/overview'
import { DEFAULT_FILTERS } from '@/data/types/filters'
import { formatNumber, formatPercentage } from '@/shared/lib/formatters'
import { renderWithProviders } from '@/test/renderWithProviders'
import { OverviewCards } from './OverviewCards'

describe('OverviewCards', () => {
  beforeEach(() => window.history.replaceState({}, '', '/?delay=0'))
  const o = buildOverview(DEFAULT_FILTERS)

  it('shows the four KPIs with their formatted values and summaries', async () => {
    renderWithProviders(<OverviewCards onDetails={vi.fn()} onWorkflow={vi.fn()} />, { url: '/?delay=0' })
    const cards = await screen.findAllByRole('article')
    expect(cards).toHaveLength(4)
    expect(within(cards[0]!).getByText('Taxa de Integração')).toBeInTheDocument()
    expect(within(cards[0]!).getByText(formatPercentage(o.integration.ratePercent))).toBeInTheDocument()
    expect(within(cards[0]!).getByText(formatNumber(o.integration.notDigitized))).toBeInTheDocument()
    expect(within(cards[1]!).getByText(formatPercentage(o.accounts.ratePercent))).toBeInTheDocument()
    expect(within(cards[2]!).getByText('Cartões Enviados')).toBeInTheDocument()
    expect(within(cards[3]!).getByText('Propostas com Seguro')).toBeInTheDocument()
  })

  it('reports details and workflow clicks with the right kpi and view', async () => {
    const onDetails = vi.fn()
    const onWorkflow = vi.fn()
    renderWithProviders(<OverviewCards onDetails={onDetails} onWorkflow={onWorkflow} />, { url: '/?delay=0' })
    await screen.findAllByRole('article')
    await userEvent.click(screen.getByRole('button', { name: /^Contas Criadas/ }))
    expect(onDetails).toHaveBeenCalledWith('accounts')
    await userEvent.click(screen.getByRole('button', { name: 'Organograma: Cartões Enviados' }))
    expect(onWorkflow).toHaveBeenCalledWith('cards', 'orgchart')
    await userEvent.click(screen.getByRole('button', { name: 'POPs: Propostas com Seguro' }))
    expect(onWorkflow).toHaveBeenCalledWith('insurance', 'docs')
  })

  it('shows the error state with a retry button', async () => {
    window.history.replaceState({}, '', '/?delay=0&error=1')
    renderWithProviders(<OverviewCards onDetails={vi.fn()} onWorkflow={vi.fn()} />, { url: '/?delay=0&error=1' })
    expect(await screen.findByRole('alert')).toHaveTextContent('Falha simulada')
  })
})
```

`src/features/card-processing/IntegrationTrend.test.tsx`:

```tsx
import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/renderWithProviders'
import { IntegrationTrend } from './IntegrationTrend'

describe('IntegrationTrend', () => {
  beforeEach(() => window.history.replaceState({}, '', '/?delay=0'))

  it('renders a titled line chart with one point per month', async () => {
    renderWithProviders(<IntegrationTrend />, { url: '/?delay=0' })
    expect(await screen.findByRole('heading', { name: 'Taxa de Integração ao longo do tempo' })).toBeInTheDocument()
    expect(screen.getByRole('img')).toHaveAccessibleName(/Jan: .*%.*Dez: /)
  })

  it('follows the period filter', async () => {
    renderWithProviders(<IntegrationTrend />, { url: '/?delay=0&period=7d' })
    await screen.findByRole('heading', { name: 'Taxa de Integração ao longo do tempo' })
    expect(screen.getByRole('img')).toHaveAccessibleName(/Seg: .*Dom: /)
  })
})
```

- [ ] **Step 3: Rodar e ver falhar**

Run: `npx vitest run src/features/card-processing/OverviewCards.test.tsx src/features/card-processing/IntegrationTrend.test.tsx`
Expected: FAIL (componentes inexistentes).

- [ ] **Step 4: Implementar `OverviewCards` e `IntegrationTrend`**

`src/features/card-processing/OverviewCards.tsx`:

```tsx
import { BookOpen, CreditCard, FileText, Network, RefreshCw, UserPlus, Workflow, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import type { CardProcessingOverview, WorkflowKpi } from '@/data/types/card-processing'
import { formatNumber, formatPercentage } from '@/shared/lib/formatters'
import { KPICard, type KPIAccent } from '@/shared/ui/KPICard'
import { QueryBoundary } from '@/shared/ui/QueryBoundary'
import { Skeleton } from '@/shared/ui/Skeleton'
import { SummaryStat } from '@/shared/ui/SummaryStat'
import { useOverview } from './api'
import { KPI_META, VIEW_LABEL, type WorkflowView } from './kpis'

interface OverviewCardsProps {
  onDetails: (kpi: WorkflowKpi) => void
  onWorkflow: (kpi: WorkflowKpi, view: WorkflowView) => void
}

interface KpiView {
  kpi: WorkflowKpi
  hint: string
  icon: LucideIcon
  accent: KPIAccent
  value: (o: CardProcessingOverview) => string
  summary: (o: CardProcessingOverview) => ReactNode
}

const KPIS: KpiView[] = [
  {
    kpi: 'integration', hint: 'Das contas para digitar', icon: RefreshCw, accent: 'purple',
    value: (o) => formatPercentage(o.integration.ratePercent),
    summary: (o) => (
      <>
        <SummaryStat label="Propostas digitadas" value={formatNumber(o.integration.digitized)} tone="blue" />
        <SummaryStat label="Propostas não digitadas" value={formatNumber(o.integration.notDigitized)} tone="red" />
      </>
    ),
  },
  {
    kpi: 'accounts', hint: 'Das contas digitadas', icon: UserPlus, accent: 'teal',
    value: (o) => formatPercentage(o.accounts.ratePercent),
    summary: (o) => (
      <>
        <SummaryStat label="Contas criadas" value={formatNumber(o.accounts.created)} tone="green" />
        <SummaryStat label="Contas não criadas" value={formatNumber(o.accounts.notCreated)} tone="red" />
      </>
    ),
  },
  {
    kpi: 'cards', hint: 'Cartões que saíram para entrega', icon: CreditCard, accent: 'orange',
    value: (o) => formatNumber(o.cards.sent),
    summary: (o) => (
      <>
        <SummaryStat label="Total de cartões" value={formatNumber(o.cards.totalAccounts)} tone="blue" />
        <SummaryStat label="Cartões enviados" value={formatNumber(o.cards.sent)} tone="green" />
      </>
    ),
  },
  {
    kpi: 'insurance', hint: 'Das contas digitadas', icon: FileText, accent: 'pink',
    value: (o) => formatNumber(o.insurance.withInsurance),
    summary: (o) => (
      <>
        <SummaryStat label="Total de propostas" value={formatNumber(o.insurance.total)} tone="blue" />
        <SummaryStat label="Propostas com seguro" value={formatNumber(o.insurance.withInsurance)} tone="green" />
      </>
    ),
  },
]

const VIEWS: { view: WorkflowView; icon: LucideIcon }[] = [
  { view: 'flowchart', icon: Workflow },
  { view: 'orgchart', icon: Network },
  { view: 'docs', icon: BookOpen },
]

const GRID = 'grid gap-4 sm:grid-cols-2 xl:grid-cols-4'

export function OverviewCards({ onDetails, onWorkflow }: OverviewCardsProps) {
  const query = useOverview()
  return (
    <QueryBoundary
      query={query}
      skeleton={
        <div className={GRID}>
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
      }
    >
      {(overview) => (
        <div className={GRID}>
          {KPIS.map((k) => (
            <KPICard
              key={k.kpi}
              label={KPI_META[k.kpi].title}
              value={k.value(overview)}
              hint={k.hint}
              icon={k.icon}
              accent={k.accent}
              onSelect={() => onDetails(k.kpi)}
              actions={VIEWS.map(({ view, icon: Icon }) => (
                <button
                  key={view}
                  type="button"
                  aria-label={`${VIEW_LABEL[view]}: ${KPI_META[k.kpi].title}`}
                  onClick={() => onWorkflow(k.kpi, view)}
                  className="flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  <Icon size={14} aria-hidden />
                  {VIEW_LABEL[view]}
                </button>
              ))}
            >
              <div className="grid grid-cols-2 gap-2">{k.summary(overview)}</div>
            </KPICard>
          ))}
        </div>
      )}
    </QueryBoundary>
  )
}
```

`src/features/card-processing/IntegrationTrend.tsx`:

```tsx
import { LineChartCard } from '@/shared/charts/LineChartCard'
import { QueryBoundary } from '@/shared/ui/QueryBoundary'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useIntegrationTrend } from './api'

export function IntegrationTrend() {
  const query = useIntegrationTrend()
  return (
    <QueryBoundary query={query} skeleton={<Skeleton className="h-72" />}>
      {(points) => (
        <LineChartCard
          title="Taxa de Integração ao longo do tempo"
          suffix="%"
          data={points.map((p) => ({ label: p.label, value: p.value }))}
        />
      )}
    </QueryBoundary>
  )
}
```

- [ ] **Step 5: Rodar tudo e ver passar**

Run: `npm test && npm run typecheck && npm run lint`
Expected: todos passam, sem warnings de `act()`. Se o `QueryBoundary` exigir o tipo genérico explícito, usar `QueryBoundary<CardProcessingOverview>` / `QueryBoundary<TrendPoint[]>`. Se o nome acessível do botão de seleção do KPI não casar com `/^Contas Criadas/` porque o `<button>` inclui o ícone, confirmar que o ícone é `aria-hidden` (já é, no `KPICard`).

- [ ] **Step 6: Commit**

```bash
git add src && git commit -m "feat: add card-processing KPI overview and integration trend sections

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 10: Conteúdo dos modais de detalhe (TDD)

**Files:**
- Create: `src/features/card-processing/details/toChartData.ts`, `src/features/card-processing/details/DetailsContent.tsx`
- Test: `src/features/card-processing/details/DetailsContent.test.tsx`

**Interfaces:**
- Consumes: hooks do Task 4, `BarChartCard`/`PieChartCard`/`ACCENT_HEX` (Task 6), `SummaryStat` (Task 7), `renderWithProviders` (Task 9).
- Produces:
  - `toChartData(items: ReasonCount[]): ChartDatum[]` (`reason` → `label`, `count` → `value`)
  - `DetailsContent({ kpi }: { kpi: WorkflowKpi })` com o conteúdo por KPI (títulos dos gráficos exatamente como nos testes abaixo)

- [ ] **Step 1: Escrever o teste que falha**

`src/features/card-processing/details/DetailsContent.test.tsx`:

```tsx
import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { buildOverview } from '@/data/mock/overview'
import { DEFAULT_FILTERS } from '@/data/types/filters'
import { formatNumber } from '@/shared/lib/formatters'
import { renderWithProviders } from '@/test/renderWithProviders'
import { DetailsContent } from './DetailsContent'

const o = buildOverview(DEFAULT_FILTERS)
const heading = (name: string) => screen.findByRole('heading', { name })

describe('DetailsContent', () => {
  beforeEach(() => window.history.replaceState({}, '', '/?delay=0'))

  it('shows integration bar and reason pies', async () => {
    renderWithProviders(<DetailsContent kpi="integration" />, { url: '/?delay=0' })
    expect(await heading('Digitadas x Não digitadas')).toBeInTheDocument()
    expect(await heading('Motivos de parada das propostas digitadas')).toBeInTheDocument()
    expect(await heading('Propostas não digitadas')).toBeInTheDocument()
    expect(
      await screen.findByRole('img', { name: new RegExp(`Digitadas: ${formatNumber(o.integration.digitized)}`) }),
    ).toBeInTheDocument()
  })

  it('shows accounts bar and reason pies', async () => {
    renderWithProviders(<DetailsContent kpi="accounts" />, { url: '/?delay=0' })
    expect(await heading('Contas criadas x não criadas')).toBeInTheDocument()
    expect(await heading('Motivos das contas criadas')).toBeInTheDocument()
    expect(await heading('Motivos das contas não criadas')).toBeInTheDocument()
  })

  it('shows the cards status bar', async () => {
    renderWithProviders(<DetailsContent kpi="cards" />, { url: '/?delay=0' })
    expect(await heading('Status dos cartões')).toBeInTheDocument()
    expect(
      await screen.findByRole('img', { name: new RegExp(`Enviados: ${formatNumber(o.cards.sent)}`) }),
    ).toBeInTheDocument()
  })

  it('shows the insurance pies, the assignment footnote and the summary', async () => {
    renderWithProviders(<DetailsContent kpi="insurance" />, { url: '/?delay=0' })
    expect(await heading('Distribuição total de propostas')).toBeInTheDocument()
    expect(await heading('Distribuição por valor')).toBeInTheDocument()
    expect(await heading('Status de cessão')).toBeInTheDocument()
    expect(screen.getByText('* Referente às propostas maiores que R$ 200')).toBeInTheDocument()
    expect(await screen.findByText('Total de propostas')).toBeInTheDocument()
    expect(await screen.findByText('Propostas com seguro')).toBeInTheDocument()
  })

  it('shows the error state when a query fails', async () => {
    window.history.replaceState({}, '', '/?delay=0&error=1')
    renderWithProviders(<DetailsContent kpi="cards" />, { url: '/?delay=0&error=1' })
    expect((await screen.findAllByRole('alert')).length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/features/card-processing/details`
Expected: FAIL (módulos inexistentes).

- [ ] **Step 3: Implementar**

`src/features/card-processing/details/toChartData.ts`:

```ts
import type { ReasonCount } from '@/data/types/card-processing'
import type { ChartDatum } from '@/shared/charts/types'

export const toChartData = (items: ReasonCount[]): ChartDatum[] =>
  items.map((i) => ({ label: i.reason, value: i.count }))
```

`src/features/card-processing/details/DetailsContent.tsx`:

```tsx
import type { WorkflowKpi } from '@/data/types/card-processing'
import { ACCENT_HEX } from '@/shared/charts/chartTheme'
import { BarChartCard } from '@/shared/charts/BarChartCard'
import { PieChartCard } from '@/shared/charts/PieChartCard'
import { formatNumber } from '@/shared/lib/formatters'
import { QueryBoundary } from '@/shared/ui/QueryBoundary'
import { SummaryStat } from '@/shared/ui/SummaryStat'
import { useAccountReasons, useInsuranceBreakdown, useIntegrationReasons, useOverview } from '../api'
import { toChartData } from './toChartData'

const GRID = 'grid gap-4 md:grid-cols-2'

function IntegrationDetails() {
  const overview = useOverview()
  const reasons = useIntegrationReasons()
  return (
    <QueryBoundary query={overview}>
      {(o) => (
        <div className="space-y-4">
          <BarChartCard
            title="Digitadas x Não digitadas"
            data={[
              { label: 'Digitadas', value: o.integration.digitized, color: ACCENT_HEX.green },
              { label: 'Não digitadas', value: o.integration.notDigitized, color: ACCENT_HEX.pink },
            ]}
          />
          <QueryBoundary query={reasons}>
            {(r) => (
              <div className={GRID}>
                <PieChartCard title="Motivos de parada das propostas digitadas" data={toChartData(r.stopReasons)} />
                <PieChartCard title="Propostas não digitadas" data={toChartData(r.nonDigitizedBreakdown)} />
              </div>
            )}
          </QueryBoundary>
        </div>
      )}
    </QueryBoundary>
  )
}

function AccountsDetails() {
  const overview = useOverview()
  const reasons = useAccountReasons()
  return (
    <QueryBoundary query={overview}>
      {(o) => (
        <div className="space-y-4">
          <BarChartCard
            title="Contas criadas x não criadas"
            data={[
              { label: 'Criadas', value: o.accounts.created, color: ACCENT_HEX.green },
              { label: 'Não criadas', value: o.accounts.notCreated, color: ACCENT_HEX.red },
            ]}
          />
          <QueryBoundary query={reasons}>
            {(r) => (
              <div className={GRID}>
                <PieChartCard title="Motivos das contas criadas" data={toChartData(r.created)} />
                <PieChartCard title="Motivos das contas não criadas" data={toChartData(r.notCreated)} />
              </div>
            )}
          </QueryBoundary>
        </div>
      )}
    </QueryBoundary>
  )
}

function CardsDetails() {
  const overview = useOverview()
  return (
    <QueryBoundary query={overview}>
      {(o) => (
        <BarChartCard
          title="Status dos cartões"
          data={[
            { label: 'Enviados', value: o.cards.sent, color: ACCENT_HEX.green },
            { label: 'Não enviados', value: o.cards.notSent, color: ACCENT_HEX.red },
          ]}
        />
      )}
    </QueryBoundary>
  )
}

function InsuranceDetails() {
  const breakdown = useInsuranceBreakdown()
  const overview = useOverview()
  return (
    <QueryBoundary query={breakdown}>
      {(b) => (
        <div className="space-y-4">
          <div className={GRID}>
            <PieChartCard title="Distribuição total de propostas" data={toChartData(b.byCoverage)} />
            <PieChartCard title="Distribuição por valor" data={toChartData(b.byValue)} />
          </div>
          <PieChartCard
            title="Status de cessão"
            data={toChartData(b.byAssignment)}
            footnote="* Referente às propostas maiores que R$ 200"
          />
          <QueryBoundary query={overview}>
            {(o) => (
              <div className="grid grid-cols-2 gap-4">
                <SummaryStat label="Total de propostas" value={formatNumber(o.insurance.total)} tone="blue" />
                <SummaryStat label="Propostas com seguro" value={formatNumber(o.insurance.withInsurance)} tone="green" />
              </div>
            )}
          </QueryBoundary>
        </div>
      )}
    </QueryBoundary>
  )
}

export function DetailsContent({ kpi }: { kpi: WorkflowKpi }) {
  switch (kpi) {
    case 'integration':
      return <IntegrationDetails />
    case 'accounts':
      return <AccountsDetails />
    case 'cards':
      return <CardsDetails />
    case 'insurance':
      return <InsuranceDetails />
  }
}
```

- [ ] **Step 4: Rodar tudo e ver passar**

Run: `npm test && npm run typecheck && npm run lint`
Expected: todos passam. No teste de erro, todas as queries do KPI `cards` falham por causa de `?error=1`; o `QueryBoundary` mostra o alerta.

- [ ] **Step 5: Commit**

```bash
git add src && git commit -m "feat: add KPI details modal content (bars, pies, summaries)

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 11: Modais de workflow com React Flow (TDD)

**Files:**
- Modify: `package.json` (dependência `@xyflow/react`), `src/test/setup.ts`
- Create: `src/features/card-processing/workflow/layout.ts`, `flowUtils.tsx`, `FlowDiagram.tsx`, `OrgChart.tsx`, `DocsList.tsx`, `WorkflowContent.tsx`
- Test: `src/features/card-processing/workflow/layout.test.ts`, `src/features/card-processing/workflow/WorkflowContent.test.tsx`

**Interfaces:**
- Consumes: `useWorkflow` (Task 4), `WorkflowView` (Task 9), `QueryBoundary`/`Skeleton`, `renderWithProviders` (Task 9), tipos `FlowStep`/`OrgNode`/`WorkflowDoc`/`WorkflowKpi`.
- Produces:
  - `layoutFlow(steps: readonly FlowStep[]): Layout` (esquerda→direita, `x = i * 240`, `y = 0`, arestas em cadeia) e `layoutOrg(root: OrgNode): Layout` (folhas com `x` espaçados de 200 em ordem, pai centrado sobre os filhos, `y = profundidade * 140`), com `Layout = { nodes: LaidOutNode[]; edges: LaidOutEdge[] }`, `LaidOutNode = { id; label; role?; x; y }`, `LaidOutEdge = { id; source; target }`
  - `FlowDiagram({ steps: FlowStep[]; label: string })`, `OrgChart({ root: OrgNode; label: string })`, `DocsList({ docs: WorkflowDoc[] })`
  - `WorkflowContent({ kpi: WorkflowKpi; view: WorkflowView })` (export nomeado; a lazy-load fica no Task 12)

- [ ] **Step 1: Instalar React Flow e preparar o ambiente de teste**

```bash
npm i @xyflow/react@latest
```

O React Flow precisa de `ResizeObserver` e `DOMMatrixReadOnly`, ausentes no jsdom. Acrescentar ao **final** de `src/test/setup.ts`:

```ts
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
class DOMMatrixReadOnlyStub {
  m22: number
  constructor(transform?: string) {
    const scale = transform?.match(/scale\(([0-9.]+)\)/)?.[1]
    this.m22 = scale ? Number(scale) : 1
  }
}
vi.stubGlobal('ResizeObserver', ResizeObserverStub)
vi.stubGlobal('DOMMatrixReadOnly', DOMMatrixReadOnlyStub)
```

(`vi` já está importado no setup desde o Task 6.)

- [ ] **Step 2: Escrever os testes que falham**

`src/features/card-processing/workflow/layout.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import type { OrgNode } from '@/data/types/card-processing'
import { layoutFlow, layoutOrg } from './layout'

const leaf = (id: string): OrgNode => ({ id, name: id, role: 'Equipe', children: [] })
const tree: OrgNode = {
  id: 'r', name: 'r', role: 'Gestão',
  children: [{ id: 's', name: 's', role: 'Supervisão', children: [leaf('a1'), leaf('a2'), leaf('a3')] }],
}

describe('layoutFlow', () => {
  it('places steps left to right, chained by edges', () => {
    const { nodes, edges } = layoutFlow([
      { id: 'a', label: 'A' }, { id: 'b', label: 'B' }, { id: 'c', label: 'C' },
    ])
    expect(nodes.map((n) => n.x)).toEqual([0, 240, 480])
    expect(nodes.every((n) => n.y === 0)).toBe(true)
    expect(edges.map((e) => [e.source, e.target])).toEqual([['a', 'b'], ['b', 'c']])
  })
  it('handles an empty list', () => {
    expect(layoutFlow([])).toEqual({ nodes: [], edges: [] })
  })
})

describe('layoutOrg', () => {
  const { nodes, edges } = layoutOrg(tree)
  const at = (id: string) => nodes.find((n) => n.id === id)
  it('creates one node per person and one edge per link, with y by depth', () => {
    expect(nodes).toHaveLength(5)
    expect(edges).toHaveLength(4)
    expect([at('r')?.y, at('s')?.y, at('a1')?.y]).toEqual([0, 140, 280])
  })
  it('spaces leaves and centers parents over their children', () => {
    expect([at('a1')?.x, at('a2')?.x, at('a3')?.x]).toEqual([0, 200, 400])
    expect(at('s')?.x).toBe(200)
    expect(at('r')?.x).toBe(200)
  })
  it('carries name and role', () => {
    expect(at('s')).toMatchObject({ label: 's', role: 'Supervisão' })
  })
})
```

`src/features/card-processing/workflow/WorkflowContent.test.tsx`:

```tsx
import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/renderWithProviders'
import { WorkflowContent } from './WorkflowContent'

const url = '/?delay=0'

describe('WorkflowContent', () => {
  beforeEach(() => window.history.replaceState({}, '', url))

  it('renders the flowchart steps', async () => {
    renderWithProviders(<WorkflowContent kpi="integration" view="flowchart" />, { url })
    expect(await screen.findByText('Proposta recebida')).toBeInTheDocument()
    expect(screen.getByText('Integração concluída')).toBeInTheDocument()
  })

  it('renders the org chart with generic roles', async () => {
    renderWithProviders(<WorkflowContent kpi="integration" view="orgchart" />, { url })
    expect(await screen.findByText('Gestor Geral')).toBeInTheDocument()
    expect(screen.getByText('Supervisor de Operações')).toBeInTheDocument()
    expect(screen.getByText('Analista 3')).toBeInTheDocument()
  })

  it('renders the list of documents', async () => {
    renderWithProviders(<WorkflowContent kpi="integration" view="docs" />, { url })
    expect(await screen.findByText('POP: Digitação de propostas')).toBeInTheDocument()
    expect(screen.getByText('Passo a passo da digitação e conferência.')).toBeInTheDocument()
  })

  it('shows the error state', async () => {
    window.history.replaceState({}, '', '/?delay=0&error=1')
    renderWithProviders(<WorkflowContent kpi="cards" view="docs" />, { url: '/?delay=0&error=1' })
    expect(await screen.findByRole('alert')).toHaveTextContent('Falha simulada')
  })
})
```

- [ ] **Step 3: Rodar e ver falhar**

Run: `npx vitest run src/features/card-processing/workflow`
Expected: FAIL (módulos inexistentes).

- [ ] **Step 4: Implementar o layout e os utilitários de nós**

`src/features/card-processing/workflow/layout.ts`:

```ts
import type { FlowStep, OrgNode } from '@/data/types/card-processing'

export interface LaidOutNode {
  id: string
  label: string
  role?: string
  x: number
  y: number
}
export interface LaidOutEdge {
  id: string
  source: string
  target: string
}
export interface Layout {
  nodes: LaidOutNode[]
  edges: LaidOutEdge[]
}

const FLOW_X_GAP = 240
const ORG_X_GAP = 200
const ORG_Y_GAP = 140

export function layoutFlow(steps: readonly FlowStep[]): Layout {
  return {
    nodes: steps.map((s, i) => ({ id: s.id, label: s.label, x: i * FLOW_X_GAP, y: 0 })),
    edges: steps.flatMap((s, i) => {
      const next = steps[i + 1]
      return next ? [{ id: `${s.id}-${next.id}`, source: s.id, target: next.id }] : []
    }),
  }
}

export function layoutOrg(root: OrgNode): Layout {
  const nodes: LaidOutNode[] = []
  const edges: LaidOutEdge[] = []
  let nextLeaf = 0

  const place = (node: OrgNode, depth: number): number => {
    const childXs = node.children.map((child) => {
      const x = place(child, depth + 1)
      edges.push({ id: `${node.id}-${child.id}`, source: node.id, target: child.id })
      return x
    })
    const x = childXs.length === 0 ? nextLeaf++ * ORG_X_GAP : (Math.min(...childXs) + Math.max(...childXs)) / 2
    nodes.push({ id: node.id, label: node.name, role: node.role, x, y: depth * ORG_Y_GAP })
    return x
  }

  place(root, 0)
  return { nodes, edges }
}
```

`src/features/card-processing/workflow/flowUtils.tsx`:

```tsx
import { MarkerType, Position, type Edge, type Node } from '@xyflow/react'
import type { LaidOutEdge, LaidOutNode } from './layout'

const NODE_WIDTH = 180
const NODE_HEIGHT = 56

export function toNode(n: LaidOutNode, direction: 'horizontal' | 'vertical'): Node {
  return {
    id: n.id,
    position: { x: n.x, y: n.y },
    initialWidth: NODE_WIDTH,
    initialHeight: NODE_HEIGHT,
    sourcePosition: direction === 'horizontal' ? Position.Right : Position.Bottom,
    targetPosition: direction === 'horizontal' ? Position.Left : Position.Top,
    style: { width: NODE_WIDTH },
    data: {
      label: (
        <div>
          <div className="text-sm font-medium">{n.label}</div>
          {n.role && <div className="text-xs opacity-70">{n.role}</div>}
        </div>
      ),
    },
  }
}

export const toEdge = (e: LaidOutEdge): Edge => ({
  ...e,
  type: 'smoothstep',
  markerEnd: { type: MarkerType.ArrowClosed },
})
```

- [ ] **Step 5: Implementar os componentes e o `WorkflowContent`**

`src/features/card-processing/workflow/FlowDiagram.tsx`:

```tsx
import { Background, Controls, ReactFlow } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useMemo } from 'react'
import type { FlowStep } from '@/data/types/card-processing'
import { toEdge, toNode } from './flowUtils'
import { layoutFlow } from './layout'

export function FlowDiagram({ steps, label }: { steps: FlowStep[]; label: string }) {
  const { nodes, edges } = useMemo(() => {
    const layout = layoutFlow(steps)
    return { nodes: layout.nodes.map((n) => toNode(n, 'horizontal')), edges: layout.edges.map(toEdge) }
  }, [steps])
  return (
    <div role="figure" aria-label={label} className="h-80 w-full rounded-lg border border-slate-200 dark:border-slate-700">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        colorMode="system"
      >
        <Background />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  )
}
```

`src/features/card-processing/workflow/OrgChart.tsx`:

```tsx
import { Background, Controls, ReactFlow } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useMemo } from 'react'
import type { OrgNode } from '@/data/types/card-processing'
import { toEdge, toNode } from './flowUtils'
import { layoutOrg } from './layout'

export function OrgChart({ root, label }: { root: OrgNode; label: string }) {
  const { nodes, edges } = useMemo(() => {
    const layout = layoutOrg(root)
    return { nodes: layout.nodes.map((n) => toNode(n, 'vertical')), edges: layout.edges.map(toEdge) }
  }, [root])
  return (
    <div role="figure" aria-label={label} className="h-96 w-full rounded-lg border border-slate-200 dark:border-slate-700">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        colorMode="system"
      >
        <Background />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  )
}
```

`src/features/card-processing/workflow/DocsList.tsx`:

```tsx
import { FileText } from 'lucide-react'
import type { WorkflowDoc } from '@/data/types/card-processing'

export function DocsList({ docs }: { docs: WorkflowDoc[] }) {
  return (
    <ul className="space-y-3">
      {docs.map((doc) => (
        <li key={doc.id} className="flex gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
          <FileText aria-hidden className="mt-0.5 shrink-0 text-slate-400" size={18} />
          <div>
            <p className="font-medium">{doc.title}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{doc.description}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
```

`src/features/card-processing/workflow/WorkflowContent.tsx`:

```tsx
import type { WorkflowKpi } from '@/data/types/card-processing'
import { QueryBoundary } from '@/shared/ui/QueryBoundary'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useWorkflow } from '../api'
import { KPI_META, VIEW_LABEL, type WorkflowView } from '../kpis'
import { DocsList } from './DocsList'
import { FlowDiagram } from './FlowDiagram'
import { OrgChart } from './OrgChart'

interface WorkflowContentProps {
  kpi: WorkflowKpi
  view: WorkflowView
}

export function WorkflowContent({ kpi, view }: WorkflowContentProps) {
  const query = useWorkflow(kpi)
  const label = `${VIEW_LABEL[view]} - ${KPI_META[kpi].area}`
  return (
    <QueryBoundary query={query} skeleton={<Skeleton className="h-80" />}>
      {(info) => {
        if (view === 'flowchart') return <FlowDiagram steps={info.flow} label={label} />
        if (view === 'orgchart') return <OrgChart root={info.org} label={label} />
        return <DocsList docs={info.docs} />
      }}
    </QueryBoundary>
  )
}
```

- [ ] **Step 6: Rodar tudo e ver passar**

Run: `npm test && npm run typecheck && npm run lint && npm run build`
Expected: todos passam sem warnings no console. Se os textos dos nós não aparecerem no DOM em jsdom, conferir `initialWidth`/`initialHeight` nos nós e os stubs do Step 1; registrar o ajuste no relatório. Ajustes de tipagem do `colorMode`/`Node` conforme a versão instalada do `@xyflow/react` são aceitáveis.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json src && git commit -m "feat: add React Flow workflow views (flowchart, org chart, docs)

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 12: Montagem da página e limpeza do exemplar (TDD)

**Files:**
- Modify: `src/features/card-processing/CardProcessingPage.tsx`, `src/features/card-processing/CardProcessingPage.test.tsx`, `src/features/card-processing/api.ts`, `src/data/types/card-processing.ts`, `src/data/repositories/card-processing.ts`, `src/data/repositories/mock/card-processing.ts`, `src/app/layout/AppLayout.test.tsx`, `README.md`
- Delete: `src/data/repositories/mock/card-processing.test.ts` (só testava `getKpis`; a cobertura equivalente está em `overview.test.ts` e `card-processing-sections.test.ts`)

**Interfaces:**
- Consumes: tudo dos Tasks 1 a 11.
- Produces: `CardProcessingPage` (export nomeado, mesma rota `/card-processing` em `routes.tsx`, sem mudanças no roteador). Diálogo único: `details` (título `KPI_META[kpi].detailsTitle`) ou `workflow` (título `"<VIEW_LABEL[view]> - <KPI_META[kpi].area>"`). `WorkflowContent` carrega por `React.lazy` dentro de `Suspense`.
- Remove: `CardProcessingKpis`, `getKpis`, `useCardProcessingKpis` e as tabelas duplicadas de fatores/`hash` do mock.

- [ ] **Step 1: Reescrever o teste da página (falha)**

Substituir `src/features/card-processing/CardProcessingPage.test.tsx`:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/renderWithProviders'
import { CardProcessingPage } from './CardProcessingPage'

const url = '/?delay=0'

describe('CardProcessingPage', () => {
  beforeEach(() => window.history.replaceState({}, '', url))

  it('renders the heading, agreement filters, four KPIs and the trend', async () => {
    renderWithProviders(<CardProcessingPage />, { url })
    expect(screen.getByRole('heading', { level: 1, name: 'Processamento de Cartões' })).toBeInTheDocument()
    expect(await screen.findAllByRole('article')).toHaveLength(4)
    expect(await screen.findByRole('heading', { name: 'Taxa de Integração ao longo do tempo' })).toBeInTheDocument()
    expect(await screen.findByLabelText('Categoria')).toBeInTheDocument()
  })

  it('opens the KPI details in a dialog and closes it with Escape', async () => {
    renderWithProviders(<CardProcessingPage />, { url })
    await userEvent.click(await screen.findByRole('button', { name: /^Cartões Enviados/ }))
    const dialog = await screen.findByRole('dialog', { name: 'Cartões Enviados - Detalhamento' })
    expect(await within(dialog).findByRole('heading', { name: 'Status dos cartões' })).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens a workflow view, loading it lazily', async () => {
    renderWithProviders(<CardProcessingPage />, { url })
    await userEvent.click(await screen.findByRole('button', { name: 'Fluxograma: Taxa de Integração' }))
    const dialog = await screen.findByRole('dialog', { name: 'Fluxograma - Operações' })
    expect(await within(dialog).findByText('Proposta recebida')).toBeInTheDocument()
  })

  it('shows error alerts when the repositories fail', async () => {
    window.history.replaceState({}, '', '/?delay=0&error=1')
    renderWithProviders(<CardProcessingPage />, { url: '/?delay=0&error=1' })
    expect((await screen.findAllByRole('alert')).length).toBeGreaterThan(0)
  })

  it('reacts to ?error=1 added while the page is open (dev flags are part of the query key)', async () => {
    const router = createMemoryRouter([{ path: '/', element: <CardProcessingPage /> }], {
      initialEntries: [url],
    })
    render(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
    )
    expect(await screen.findAllByRole('article')).toHaveLength(4)
    window.history.replaceState({}, '', '/?delay=0&error=1')
    await act(() => router.navigate('/?delay=0&error=1'))
    expect((await screen.findAllByRole('alert')).length).toBeGreaterThan(0)
  })
})
```

Atualizar também `src/app/layout/AppLayout.test.tsx`: no teste que abre `/?period=30d` (redirect da raiz), trocar a espera por `Total de propostas` (rótulo do exemplar antigo) por
`await screen.findByRole('heading', { level: 1, name: 'Processamento de Cartões' })`, mantendo a asserção do `Período`.

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/features/card-processing/CardProcessingPage.test.tsx src/app/layout/AppLayout.test.tsx`
Expected: FAIL (a página exemplar ainda mostra os 4 KPIs antigos, sem `article`, filtros nem diálogos).

- [ ] **Step 3: Implementar a página**

`src/features/card-processing/CardProcessingPage.tsx` (substitui o conteúdo):

```tsx
import { Suspense, lazy, useCallback, useState } from 'react'
import { AgreementFilters } from '@/app/filters/AgreementFilters'
import type { WorkflowKpi } from '@/data/types/card-processing'
import { Modal } from '@/shared/ui/Modal'
import { Skeleton } from '@/shared/ui/Skeleton'
import { IntegrationTrend } from './IntegrationTrend'
import { OverviewCards } from './OverviewCards'
import { DetailsContent } from './details/DetailsContent'
import { KPI_META, VIEW_LABEL, type WorkflowView } from './kpis'

const WorkflowContent = lazy(() =>
  import('./workflow/WorkflowContent').then((m) => ({ default: m.WorkflowContent })),
)

type Dialog =
  | { type: 'details'; kpi: WorkflowKpi }
  | { type: 'workflow'; kpi: WorkflowKpi; view: WorkflowView }

function dialogTitle(dialog: Dialog | null): string {
  if (dialog === null) return ''
  if (dialog.type === 'details') return KPI_META[dialog.kpi].detailsTitle
  return `${VIEW_LABEL[dialog.view]} - ${KPI_META[dialog.kpi].area}`
}

export function CardProcessingPage() {
  const [dialog, setDialog] = useState<Dialog | null>(null)
  const close = useCallback(() => setDialog(null), [])

  return (
    <section className="space-y-6">
      <h1 className="text-xl font-semibold">Processamento de Cartões</h1>
      <AgreementFilters />
      <OverviewCards
        onDetails={(kpi) => setDialog({ type: 'details', kpi })}
        onWorkflow={(kpi, view) => setDialog({ type: 'workflow', kpi, view })}
      />
      <IntegrationTrend />
      <Modal open={dialog !== null} title={dialogTitle(dialog)} onClose={close} wide>
        {dialog?.type === 'details' && <DetailsContent kpi={dialog.kpi} />}
        {dialog?.type === 'workflow' && (
          <Suspense fallback={<Skeleton className="h-80" />}>
            <WorkflowContent kpi={dialog.kpi} view={dialog.view} />
          </Suspense>
        )}
      </Modal>
    </section>
  )
}
```

- [ ] **Step 4: Remover o exemplar do Plano 1**

1. Apagar `src/data/repositories/mock/card-processing.test.ts`.
2. Em `src/data/types/card-processing.ts`, apagar a interface `CardProcessingKpis`.
3. Em `src/data/repositories/card-processing.ts`, apagar `getKpis` da interface e o import de `CardProcessingKpis`.
4. Em `src/data/repositories/mock/card-processing.ts`, apagar `getKpis`, as tabelas `PERIOD_FACTOR`/`REGION_FACTOR`, a função `hash` e imports que ficarem sem uso (o arquivo passa a conter só o objeto com os 6 métodos do Task 2 e do Task 3).
5. Em `src/features/card-processing/api.ts`, apagar `useCardProcessingKpis`.
6. Conferir que nada mais referencia os itens removidos:

```bash
git grep -n "getKpis\|CardProcessingKpis\|useCardProcessingKpis" -- src
```

Expected: nenhuma linha.

- [ ] **Step 5: Atualizar o README**

Em `README.md`, acrescentar antes de "Trocando mock por API real":

```markdown
## Páginas

- `/card-processing`: KPIs com resumo, tendência de integração, detalhamento por KPI (barras e pizzas)
  e workflows (fluxograma e organograma em React Flow, lista de POPs). Filtros de período, região,
  categoria e convênio.
- `/financial`, `/inventory`, `/logistics`, `/gallery`: em migração.
```

- [ ] **Step 6: Rodar a verificação completa**

Run: `npm test && npm run typecheck && npm run lint && npm run build`
Expected: tudo passa, sem warnings no console. No `build`, o `WorkflowContent` (e com ele o `@xyflow/react`) deve sair em um chunk separado (procurar `WorkflowContent-*.js` na listagem do Vite); se estiver no bundle principal, corrigir o `import()` dinâmico.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: assemble Card Processing page with details and workflow dialogs

Removes the Plan 1 KPI exemplar (getKpis) now superseded by the overview repository.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Self-Review

- **Cobertura do legado (`CardProcessing.jsx`):** os 4 KPIs com resumo e ações (Tasks 7 e 9), a tendência (Tasks 2 e 9), os 4 modais de detalhe com barras e pizzas, legenda com percentuais e nota de cessão (Tasks 6 e 10), os 3 tipos de workflow por KPI (Task 11), filtros de convênio (Task 8), estados de loading e erro (via `QueryBoundary`) e a montagem (Task 12). Fora de escopo por decisão: fallback "carregar com dados fictícios" (o app inteiro já é mock), leitor de PDF (a lista de POPs é fictícia), imagem de fluxograma com marca da empresa (substituída por React Flow) e nomes reais no organograma (anonimizados).
- **Placeholders:** nenhum. Os pontos condicionais (mock do `recharts` no setup, tipagem do `Tooltip` e do `colorMode`, render de nós em jsdom) trazem a ação corretiva concreta.
- **Consistência de tipos:** `WorkflowKpi`, `WorkflowView`, `KPI_META`, `VIEW_LABEL`, `CardProcessingOverview`, `ReasonCount`, `ChartDatum`, `toChartData`, `useDomainQuery`, `useDevFlags`, `renderWithProviders` e as assinaturas dos repositórios têm o mesmo formato em todas as tarefas. O plano acrescenta os wrappers de gráfico (que o roteiro do Plano 3 previa) porque o Card Processing precisa deles primeiro; o Plano 3 os reutiliza.
- **Ordem e build verde:** `getKpis`/`CardProcessingKpis` só saem no Task 12; até lá a página do Plano 1 continua compilando. As tarefas 1 a 8 não alteram o que a página exibe.
