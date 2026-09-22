# Plano 1: Fundação Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir o scaffold antigo por uma base moderna (Vite 7, React 19, TS estrito, Tailwind 4) com layout, roteamento, filtros globais na URL e camada de dados mock, provada por uma página exemplar.

**Architecture:** Feature-based. `data/repositories` expõe interfaces; `data/repositories/mock` as implementa com geradores de seed fixa e latência simulada. TanStack Query consome os repositórios. Filtros vivem nos search params, validados com Zod. O código antigo vai para `legacy/` (fora de lint e typecheck) e é consultado pelos planos seguintes.

**Tech Stack:** Vite 7, React 19, TypeScript strict, Tailwind 4, React Router 7, TanStack Query, Zod, Vitest, Testing Library, ESLint 9, Prettier, lucide-react.

**Spec:** `docs/superpowers/specs/2026-09-21-dashboard-showcase-template-design.md`

**Planos seguintes (fora deste):** 2 Card Processing, 3 Financial + Inventory, 4 Logistics, 5 Galeria, 6 Limpeza de `legacy/` e README final.

## Global Constraints

- TypeScript `strict: true`, sem `any` explícito.
- Datas e moedas em pt-BR via `Intl` (moeda BRL).
- Dados mock determinísticos (seed fixa); nenhum acesso a rede, banco ou Supabase.
- `.env` não é versionado; só `.env.example`.
- Ícones com `lucide-react`; sem Font Awesome.
- Alias de import `@/` aponta para `src/`.
- Commits com o trailer `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`.

---

### Task 1: Scaffold moderno e tooling

**Files:**
- Move: `src/` → `legacy/src/`
- Delete: `.env`, `.vite/`, `eslint.config.js`, `tailwind.config.js`, `postcss.config.js`, `vite.config.js`, `package-lock.json`
- Create: `package.json` (reescrito), `tsconfig.json`, `vite.config.ts`, `eslint.config.js`, `.prettierrc`, `.env.example`, `index.html`, `src/main.tsx`, `src/index.css`, `src/app/App.tsx`, `src/test/setup.ts`
- Modify: `.gitignore`

**Interfaces:**
- Produces: alias `@/` → `src/`; scripts `dev`, `build`, `lint`, `typecheck`, `test`, `format`.

- [ ] **Step 1: Mover o código antigo e remover arquivos obsoletos**

```bash
cd "C:/Users/Oem/Desktop/Projetos/Dashgeral"
mkdir legacy && git mv src legacy/src
git rm -q --cached .env && rm -f .env
git rm -rq .vite eslint.config.js tailwind.config.js postcss.config.js vite.config.js package-lock.json
mkdir -p src/app src/test
```

- [ ] **Step 2: Reescrever `package.json` e instalar dependências**

```bash
cat > package.json <<'EOF'
{
  "name": "dashgeral",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "format": "prettier --write ."
  }
}
EOF
npm i react@^19 react-dom@^19 react-router-dom@latest @tanstack/react-query@latest zod@latest lucide-react@latest
npm i -D vite@^7 @vitejs/plugin-react@latest typescript@latest @types/react@^19 @types/react-dom@^19 tailwindcss@latest @tailwindcss/vite@latest vitest@latest jsdom@latest @testing-library/react@latest @testing-library/jest-dom@latest @testing-library/user-event@latest eslint@^9 @eslint/js@^9 typescript-eslint@latest eslint-plugin-react-hooks@latest eslint-plugin-react-refresh@latest globals@latest prettier@latest
```

Expected: instalação sem erro de peer dependency bloqueante. Se `@vitejs/plugin-react@latest` exigir outra faixa do Vite, ajustar a versão do Vite para a faixa pedida e registrar no commit.

- [ ] **Step 3: Criar configs (`tsconfig.json`, `vite.config.ts`, `.prettierrc`, `.env.example`)**

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "noEmit": true,
    "types": ["vite/client", "vitest/globals", "@testing-library/jest-dom"],
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src", "vite.config.ts"]
}
```

`vite.config.ts`:

```ts
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
})
```

`.prettierrc`:

```json
{ "semi": false, "singleQuote": true, "printWidth": 100, "trailingComma": "all" }
```

`.env.example`:

```
# Este template roda 100% com dados mock. Nenhuma variável é obrigatória.
# VITE_API_URL=https://exemplo.com/api   # usado se você implementar um repositório real
```

- [ ] **Step 4: Criar `eslint.config.js`, `.gitignore`, `index.html` e a casca da aplicação**

`eslint.config.js`:

```js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'legacy', 'docs'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: { globals: globals.browser },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
)
```

Acrescentar ao `.gitignore` as linhas `.env`, `.env.local`, `.vite`, `coverage`.

`index.html`:

```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Dashgeral · Template de Dashboards</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`src/index.css`: `@import 'tailwindcss';`

`src/test/setup.ts`: `import '@testing-library/jest-dom/vitest'`

`src/app/App.tsx`:

```tsx
export function App() {
  return <h1 className="p-6 text-2xl font-semibold">Dashgeral</h1>
}
```

`src/main.tsx`:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app/App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 5: Verificar lint, typecheck e build**

Run: `npm run lint && npm run typecheck && npm run build`
Expected: os três passam sem erros e `dist/` é gerado. Se o lint reclamar de `react-hooks.configs.recommended`, usar `reactHooks.configs['recommended-latest']` conforme a versão instalada.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "chore: replace scaffold with Vite 7 + React 19 + TS + Tailwind 4 tooling

Legacy sources moved to legacy/src (excluded from lint/typecheck).

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 2: Formatters pt-BR (TDD)

**Files:**
- Create: `src/shared/lib/formatters.ts`
- Test: `src/shared/lib/formatters.test.ts`

**Interfaces:**
- Produces:
  - `formatCurrency(value: number): string`
  - `formatNumber(value: number): string`
  - `formatCompact(value: number): string`
  - `formatPercentage(value: number | null | undefined, fractionDigits?: number): string` (recebe o valor já em pontos percentuais, ex.: `80` → `80,00%`; não numérico → `N/A`)

- [ ] **Step 1: Escrever o teste que falha**

```ts
import { describe, expect, it } from 'vitest'
import { formatCompact, formatCurrency, formatNumber, formatPercentage } from './formatters'

const nbsp = (s: string) => s.replace(/\u00a0/g, ' ')

describe('formatters', () => {
  it('formats BRL currency', () => {
    expect(nbsp(formatCurrency(1234.5))).toBe('R$ 1.234,50')
  })
  it('formats integers with pt-BR grouping', () => {
    expect(formatNumber(1234567)).toBe('1.234.567')
  })
  it('formats compact numbers', () => {
    expect(nbsp(formatCompact(1500))).toBe('1,5 mil')
  })
  it('formats percentage given in percentage points', () => {
    expect(formatPercentage(80)).toBe('80,00%')
    expect(formatPercentage(92.456, 1)).toBe('92,5%')
  })
  it('returns N/A for non numeric input', () => {
    expect(formatPercentage(undefined)).toBe('N/A')
    expect(formatPercentage(null)).toBe('N/A')
    expect(formatPercentage(Number.NaN)).toBe('N/A')
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/shared/lib/formatters.test.ts`
Expected: FAIL (módulo `./formatters` não existe).

- [ ] **Step 3: Implementar**

```ts
const locale = 'pt-BR'

const currency = new Intl.NumberFormat(locale, { style: 'currency', currency: 'BRL' })
const integer = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 })
const compact = new Intl.NumberFormat(locale, { notation: 'compact', compactDisplay: 'long' })

export const formatCurrency = (value: number): string => currency.format(value)
export const formatNumber = (value: number): string => integer.format(value)
export const formatCompact = (value: number): string => compact.format(value)

export function formatPercentage(value: number | null | undefined, fractionDigits = 2): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 'N/A'
  return `${new Intl.NumberFormat(locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value)}%`
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/shared/lib/formatters.test.ts`
Expected: PASS (5 testes). Se `formatCompact(1500)` sair `1,5 mil` com outro espaço ou `1,5 mi`, ajustar apenas a expectativa do teste ao valor real do Intl do Node instalado.

- [ ] **Step 5: Commit**

```bash
git add src/shared/lib && git commit -m "feat: add pt-BR formatters

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 3: PRNG com seed fixa (TDD)

**Files:**
- Create: `src/data/mock/random.ts`
- Test: `src/data/mock/random.test.ts`

**Interfaces:**
- Produces: `createRng(seed: number): Rng` com
  - `next(): number` (float em `[0, 1)`)
  - `int(min: number, max: number): number` (inclusivo nos dois extremos)
  - `pick<T>(items: readonly T[]): T`

- [ ] **Step 1: Escrever o teste que falha**

```ts
import { describe, expect, it } from 'vitest'
import { createRng } from './random'

describe('createRng', () => {
  it('is deterministic for the same seed', () => {
    const a = createRng(42)
    const b = createRng(42)
    expect([a.next(), a.next(), a.next()]).toEqual([b.next(), b.next(), b.next()])
  })
  it('differs across seeds', () => {
    expect(createRng(1).next()).not.toBe(createRng(2).next())
  })
  it('int stays inside the inclusive range', () => {
    const rng = createRng(7)
    for (let i = 0; i < 500; i++) {
      const n = rng.int(3, 6)
      expect(n).toBeGreaterThanOrEqual(3)
      expect(n).toBeLessThanOrEqual(6)
    }
  })
  it('pick returns an element of the list', () => {
    const items = ['a', 'b', 'c'] as const
    expect(items).toContain(createRng(9).pick(items))
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/data/mock/random.test.ts`
Expected: FAIL (módulo `./random` não existe).

- [ ] **Step 3: Implementar (mulberry32)**

```ts
export interface Rng {
  next(): number
  int(min: number, max: number): number
  pick<T>(items: readonly T[]): T
}

export function createRng(seed: number): Rng {
  let state = seed >>> 0
  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  return {
    next,
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    pick: (items) => items[Math.floor(next() * items.length)] as (typeof items)[number],
  }
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/data/mock/random.test.ts`
Expected: PASS (4 testes).

- [ ] **Step 5: Commit**

```bash
git add src/data/mock && git commit -m "feat: add seeded PRNG for deterministic mock data

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 4: Filtros globais na URL (TDD)

**Files:**
- Create: `src/data/types/filters.ts`, `src/app/filters/useGlobalFilters.ts`
- Test: `src/app/filters/useGlobalFilters.test.tsx`

**Interfaces:**
- Produces:
  - `globalFiltersSchema` (Zod), `type GlobalFilters`, `DEFAULT_FILTERS: GlobalFilters`
  - Campos: `period` (`'all'|'7d'|'30d'|'90d'|'12m'`), `region` (`'all'|'norte'|'nordeste'|'centro-oeste'|'sudeste'|'sul'`), `agreementCategory`, `agreement`, `logisticsType`, `logisticsStep` (strings, padrão `'all'`)
  - `useGlobalFilters(): { filters: GlobalFilters; setFilters(patch: Partial<GlobalFilters>): void }`
  - Regras: valor inválido na URL cai para o padrão; valores padrão não aparecem na URL; trocar `agreementCategory` sem informar `agreement` reseta `agreement` para `'all'`.

- [ ] **Step 1: Criar o schema**

`src/data/types/filters.ts`:

```ts
import { z } from 'zod'

export const PERIODS = ['all', '7d', '30d', '90d', '12m'] as const
export const REGIONS = ['all', 'norte', 'nordeste', 'centro-oeste', 'sudeste', 'sul'] as const

export const globalFiltersSchema = z.object({
  period: z.enum(PERIODS).catch('all'),
  region: z.enum(REGIONS).catch('all'),
  agreementCategory: z.string().catch('all'),
  agreement: z.string().catch('all'),
  logisticsType: z.string().catch('all'),
  logisticsStep: z.string().catch('all'),
})

export type GlobalFilters = z.infer<typeof globalFiltersSchema>

export const DEFAULT_FILTERS: GlobalFilters = globalFiltersSchema.parse({})
```

- [ ] **Step 2: Escrever o teste do hook que falha**

`src/app/filters/useGlobalFilters.test.tsx`:

```tsx
import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { useGlobalFilters } from './useGlobalFilters'

const wrap = (url: string) => ({ children }: { children: ReactNode }) => (
  <MemoryRouter initialEntries={[url]}>{children}</MemoryRouter>
)

describe('useGlobalFilters', () => {
  it('reads valid filters from the URL', () => {
    const { result } = renderHook(() => useGlobalFilters(), {
      wrapper: wrap('/?period=30d&region=sul'),
    })
    expect(result.current.filters.period).toBe('30d')
    expect(result.current.filters.region).toBe('sul')
  })

  it('falls back to defaults on invalid values', () => {
    const { result } = renderHook(() => useGlobalFilters(), {
      wrapper: wrap('/?period=banana&region=marte'),
    })
    expect(result.current.filters.period).toBe('all')
    expect(result.current.filters.region).toBe('all')
  })

  it('updates filters with a partial patch', () => {
    const { result } = renderHook(() => useGlobalFilters(), { wrapper: wrap('/') })
    act(() => result.current.setFilters({ period: '90d' }))
    expect(result.current.filters.period).toBe('90d')
    act(() => result.current.setFilters({ period: 'all' }))
    expect(result.current.filters.period).toBe('all')
  })

  it('resets agreement when the category changes', () => {
    const { result } = renderHook(() => useGlobalFilters(), {
      wrapper: wrap('/?agreementCategory=inss&agreement=x'),
    })
    act(() => result.current.setFilters({ agreementCategory: 'governo' }))
    expect(result.current.filters.agreement).toBe('all')
  })
})
```

- [ ] **Step 3: Rodar e ver falhar**

Run: `npx vitest run src/app/filters`
Expected: FAIL (módulo `./useGlobalFilters` não existe).

- [ ] **Step 4: Implementar o hook**

`src/app/filters/useGlobalFilters.ts`:

```ts
import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DEFAULT_FILTERS, globalFiltersSchema, type GlobalFilters } from '@/data/types/filters'

const parse = (params: URLSearchParams): GlobalFilters =>
  globalFiltersSchema.parse(Object.fromEntries(params))

export function useGlobalFilters() {
  const [params, setParams] = useSearchParams()
  const filters = useMemo(() => parse(params), [params])

  const setFilters = useCallback(
    (patch: Partial<GlobalFilters>) => {
      setParams((prev) => {
        const current = parse(prev)
        const next: GlobalFilters = { ...current, ...patch }
        const categoryChanged =
          patch.agreementCategory !== undefined &&
          patch.agreementCategory !== current.agreementCategory
        if (categoryChanged && patch.agreement === undefined) next.agreement = 'all'

        const out = new URLSearchParams(prev)
        for (const key of Object.keys(DEFAULT_FILTERS) as (keyof GlobalFilters)[]) {
          if (next[key] === DEFAULT_FILTERS[key]) out.delete(key)
          else out.set(key, next[key])
        }
        return out
      })
    },
    [setParams],
  )

  return { filters, setFilters }
}
```

- [ ] **Step 5: Rodar e ver passar**

Run: `npx vitest run src/app/filters`
Expected: PASS (4 testes). Se `.catch('all')` no `z.string()` não tratar `undefined` na versão do Zod instalada, trocar por `z.string().default('all').catch('all')`.

- [ ] **Step 6: Commit**

```bash
git add src/data/types src/app/filters && git commit -m "feat: add URL-backed global filters with Zod validation

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 5: Infra de repositório mock e exemplar Card Processing (TDD)

**Files:**
- Create: `src/data/mock/simulate.ts`, `src/data/types/card-processing.ts`, `src/data/repositories/card-processing.ts`, `src/data/repositories/mock/card-processing.ts`, `src/data/repositories/index.ts`
- Test: `src/data/mock/simulate.test.ts`, `src/data/repositories/mock/card-processing.test.ts`

**Interfaces:**
- Consumes: `createRng` (Task 3), `GlobalFilters`/`DEFAULT_FILTERS` (Task 4).
- Produces:
  - `readDevFlags(search: string): { delayMs: number | null; forceError: boolean }` (`?delay=N`, `?error=1`)
  - `simulate<T>(produce: () => T): Promise<T>` (latência 200 a 600 ms, salvo `?delay=`; rejeita com `Error('Falha simulada')` se `?error=1`)
  - `CardProcessingKpis = { integrationRate: number; accountsCreated: number; cardsSent: number; totalProposals: number }`
  - `interface CardProcessingRepository { getKpis(filters: GlobalFilters): Promise<CardProcessingKpis> }`
  - `repositories.cardProcessing: CardProcessingRepository` em `@/data/repositories`

- [ ] **Step 1: Escrever o teste de `readDevFlags` que falha**

`src/data/mock/simulate.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { readDevFlags } from './simulate'

describe('readDevFlags', () => {
  it('returns defaults with no params', () => {
    expect(readDevFlags('')).toEqual({ delayMs: null, forceError: false })
  })
  it('parses delay and error flags', () => {
    expect(readDevFlags('?delay=0&error=1')).toEqual({ delayMs: 0, forceError: true })
  })
  it('ignores a non numeric delay', () => {
    expect(readDevFlags('?delay=abc').delayMs).toBeNull()
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/data/mock/simulate.test.ts`
Expected: FAIL (módulo `./simulate` não existe).

- [ ] **Step 3: Implementar `simulate.ts`**

```ts
export interface DevFlags {
  delayMs: number | null
  forceError: boolean
}

export function readDevFlags(search: string): DevFlags {
  const params = new URLSearchParams(search)
  const raw = params.get('delay')
  const parsed = raw === null ? Number.NaN : Number(raw)
  return {
    delayMs: Number.isFinite(parsed) && parsed >= 0 ? parsed : null,
    forceError: params.get('error') === '1',
  }
}

export async function simulate<T>(produce: () => T): Promise<T> {
  const search = typeof window === 'undefined' ? '' : window.location.search
  const { delayMs, forceError } = readDevFlags(search)
  const wait = delayMs ?? 200 + Math.floor(Math.random() * 400)
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait))
  if (forceError) throw new Error('Falha simulada')
  return produce()
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/data/mock/simulate.test.ts`
Expected: PASS (3 testes).

- [ ] **Step 5: Escrever o teste do repositório mock que falha**

`src/data/repositories/mock/card-processing.test.ts`:

```ts
import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_FILTERS } from '@/data/types/filters'
import { mockCardProcessingRepository } from './card-processing'

describe('mockCardProcessingRepository', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/?delay=0')
  })

  it('is deterministic for identical filters', async () => {
    const a = await mockCardProcessingRepository.getKpis(DEFAULT_FILTERS)
    const b = await mockCardProcessingRepository.getKpis(DEFAULT_FILTERS)
    expect(a).toEqual(b)
  })

  it('applies the period filter to volumes', async () => {
    const all = await mockCardProcessingRepository.getKpis(DEFAULT_FILTERS)
    const week = await mockCardProcessingRepository.getKpis({ ...DEFAULT_FILTERS, period: '7d' })
    expect(week.totalProposals).toBeLessThan(all.totalProposals)
  })

  it('applies the region filter to volumes', async () => {
    const all = await mockCardProcessingRepository.getKpis(DEFAULT_FILTERS)
    const sul = await mockCardProcessingRepository.getKpis({ ...DEFAULT_FILTERS, region: 'sul' })
    expect(sul.totalProposals).toBeLessThan(all.totalProposals)
  })

  it('keeps the integration rate between 0 and 100', async () => {
    const { integrationRate } = await mockCardProcessingRepository.getKpis(DEFAULT_FILTERS)
    expect(integrationRate).toBeGreaterThanOrEqual(0)
    expect(integrationRate).toBeLessThanOrEqual(100)
  })
})
```

- [ ] **Step 6: Rodar e ver falhar**

Run: `npx vitest run src/data/repositories`
Expected: FAIL (módulos do repositório não existem).

- [ ] **Step 7: Implementar tipos, interface, mock e índice**

`src/data/types/card-processing.ts`:

```ts
export interface CardProcessingKpis {
  integrationRate: number
  accountsCreated: number
  cardsSent: number
  totalProposals: number
}
```

`src/data/repositories/card-processing.ts`:

```ts
import type { CardProcessingKpis } from '@/data/types/card-processing'
import type { GlobalFilters } from '@/data/types/filters'

export interface CardProcessingRepository {
  getKpis(filters: GlobalFilters): Promise<CardProcessingKpis>
}
```

`src/data/repositories/mock/card-processing.ts`:

```ts
import { createRng } from '@/data/mock/random'
import { simulate } from '@/data/mock/simulate'
import type { CardProcessingRepository } from '@/data/repositories/card-processing'
import type { GlobalFilters } from '@/data/types/filters'

const PERIOD_FACTOR: Record<GlobalFilters['period'], number> = {
  all: 1, '12m': 0.8, '90d': 0.3, '30d': 0.1, '7d': 0.03,
}
const REGION_FACTOR: Record<GlobalFilters['region'], number> = {
  all: 1, sudeste: 0.42, nordeste: 0.27, sul: 0.15, norte: 0.09, 'centro-oeste': 0.07,
}

const hash = (text: string): number =>
  [...text].reduce((acc, ch) => (Math.imul(acc, 31) + ch.charCodeAt(0)) >>> 0, 7)

export const mockCardProcessingRepository: CardProcessingRepository = {
  getKpis: (filters) =>
    simulate(() => {
      const rng = createRng(hash(`${filters.agreementCategory}|${filters.agreement}`))
      const factor = PERIOD_FACTOR[filters.period] * REGION_FACTOR[filters.region]
      const totalProposals = Math.round(rng.int(9000, 11000) * factor)
      const digitized = Math.round(totalProposals * (0.75 + rng.next() * 0.1))
      return {
        totalProposals,
        integrationRate: totalProposals === 0 ? 0 : (digitized / totalProposals) * 100,
        accountsCreated: Math.round(digitized * (0.9 + rng.next() * 0.08)),
        cardsSent: Math.round(digitized * (0.8 + rng.next() * 0.1)),
      }
    }),
}
```

`src/data/repositories/index.ts`:

```ts
import type { CardProcessingRepository } from './card-processing'
import { mockCardProcessingRepository } from './mock/card-processing'

export interface Repositories {
  cardProcessing: CardProcessingRepository
}

// Único ponto de troca: para usar uma API real, substitua as implementações aqui.
export const repositories: Repositories = {
  cardProcessing: mockCardProcessingRepository,
}
```

- [ ] **Step 8: Rodar e ver passar**

Run: `npx vitest run src/data`
Expected: PASS (7 testes no total). O `window.location.search` é lido a cada chamada, então `?delay=0` no `beforeEach` zera a latência.

- [ ] **Step 9: Commit**

```bash
git add src/data && git commit -m "feat: add mock repository infra with card-processing KPI exemplar

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 6: UI compartilhada e página exemplar Card Processing (TDD)

**Files:**
- Create: `src/shared/ui/KPICard.tsx`, `src/shared/ui/Skeleton.tsx`, `src/shared/ui/QueryBoundary.tsx`, `src/features/card-processing/api.ts`, `src/features/card-processing/CardProcessingPage.tsx`
- Test: `src/shared/ui/KPICard.test.tsx`, `src/features/card-processing/CardProcessingPage.test.tsx`

**Interfaces:**
- Consumes: `repositories` (Task 5), `useGlobalFilters` (Task 4), formatters (Task 2).
- Produces:
  - `KPICard({ label: string; value: string; hint?: string })`
  - `Skeleton({ className?: string })`
  - `QueryBoundary<T>({ query: UseQueryResult<T>; skeleton?: ReactNode; children: (data: T) => ReactNode })` (mostra skeleton ao carregar; `role="alert"` com botão "Tentar novamente" em erro)
  - `useCardProcessingKpis(): UseQueryResult<CardProcessingKpis>` (lê os filtros da URL)
  - `CardProcessingPage` (export nomeado)

- [ ] **Step 1: Escrever o teste do KPICard que falha**

`src/shared/ui/KPICard.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { KPICard } from './KPICard'

describe('KPICard', () => {
  it('renders label, value and optional hint', () => {
    render(<KPICard label="Taxa de integração" value="80,00%" hint="vs. mês anterior" />)
    expect(screen.getByText('Taxa de integração')).toBeInTheDocument()
    expect(screen.getByText('80,00%')).toBeInTheDocument()
    expect(screen.getByText('vs. mês anterior')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/shared/ui`
Expected: FAIL (módulo `./KPICard` não existe).

- [ ] **Step 3: Implementar os componentes**

`src/shared/ui/KPICard.tsx`:

```tsx
interface KPICardProps {
  label: string
  value: string
  hint?: string
}

export function KPICard({ label, value, hint }: KPICardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  )
}
```

`src/shared/ui/Skeleton.tsx`:

```tsx
export function Skeleton({ className = 'h-24' }: { className?: string }) {
  return <div aria-hidden className={`animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800 ${className}`} />
}
```

`src/shared/ui/QueryBoundary.tsx`:

```tsx
import type { UseQueryResult } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { Skeleton } from './Skeleton'

interface QueryBoundaryProps<T> {
  query: UseQueryResult<T>
  skeleton?: ReactNode
  children: (data: T) => ReactNode
}

export function QueryBoundary<T>({ query, skeleton, children }: QueryBoundaryProps<T>) {
  if (query.isPending) return <>{skeleton ?? <Skeleton />}</>
  if (query.isError) {
    return (
      <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
        <p className="font-medium">Não foi possível carregar os dados.</p>
        <p className="text-sm">{query.error.message}</p>
        <button type="button" onClick={() => void query.refetch()} className="mt-2 rounded-md bg-red-600 px-3 py-1 text-sm text-white">
          Tentar novamente
        </button>
      </div>
    )
  }
  return <>{children(query.data)}</>
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/shared/ui`
Expected: PASS (1 teste).

- [ ] **Step 5: Escrever o teste da página que falha**

`src/features/card-processing/CardProcessingPage.test.tsx`:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { CardProcessingPage } from './CardProcessingPage'

const renderPage = () =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter>
        <CardProcessingPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )

describe('CardProcessingPage', () => {
  beforeEach(() => window.history.replaceState({}, '', '/?delay=0'))

  it('shows the KPI cards once data loads', async () => {
    renderPage()
    expect(await screen.findByText('Total de propostas')).toBeInTheDocument()
    expect(screen.getByText('Taxa de integração')).toBeInTheDocument()
    expect(screen.getByText('Contas criadas')).toBeInTheDocument()
    expect(screen.getByText('Cartões enviados')).toBeInTheDocument()
  })

  it('shows an error state when the repository fails', async () => {
    window.history.replaceState({}, '', '/?delay=0&error=1')
    renderPage()
    expect(await screen.findByRole('alert')).toHaveTextContent('Falha simulada')
  })
})
```

- [ ] **Step 6: Rodar e ver falhar**

Run: `npx vitest run src/features/card-processing`
Expected: FAIL (página não existe).

- [ ] **Step 7: Implementar hook e página**

`src/features/card-processing/api.ts`:

```ts
import { useQuery } from '@tanstack/react-query'
import { useGlobalFilters } from '@/app/filters/useGlobalFilters'
import { repositories } from '@/data/repositories'

export function useCardProcessingKpis() {
  const { filters } = useGlobalFilters()
  return useQuery({
    queryKey: ['card-processing', 'kpis', filters],
    queryFn: () => repositories.cardProcessing.getKpis(filters),
  })
}
```

`src/features/card-processing/CardProcessingPage.tsx`:

```tsx
import { formatNumber, formatPercentage } from '@/shared/lib/formatters'
import { KPICard } from '@/shared/ui/KPICard'
import { QueryBoundary } from '@/shared/ui/QueryBoundary'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useCardProcessingKpis } from './api'

export function CardProcessingPage() {
  const query = useCardProcessingKpis()
  return (
    <section>
      <h1 className="mb-4 text-xl font-semibold">Processamento de Cartões</h1>
      <QueryBoundary
        query={query}
        skeleton={
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} />)}
          </div>
        }
      >
        {(k) => (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KPICard label="Total de propostas" value={formatNumber(k.totalProposals)} />
            <KPICard label="Taxa de integração" value={formatPercentage(k.integrationRate)} />
            <KPICard label="Contas criadas" value={formatNumber(k.accountsCreated)} />
            <KPICard label="Cartões enviados" value={formatNumber(k.cardsSent)} />
          </div>
        )}
      </QueryBoundary>
    </section>
  )
}
```

- [ ] **Step 8: Rodar tudo e ver passar**

Run: `npm test && npm run typecheck && npm run lint`
Expected: todos os testes PASS; typecheck e lint sem erros.

- [ ] **Step 9: Commit**

```bash
git add src && git commit -m "feat: add shared UI and exemplar Card Processing KPI page

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 7: Layout, rotas, tema e barra de filtros (TDD)

**Files:**
- Create: `src/app/nav.ts`, `src/app/layout/useTheme.ts`, `src/app/layout/AppLayout.tsx`, `src/app/filters/GlobalFiltersBar.tsx`, `src/shared/ui/ComingSoon.tsx`, `src/app/routes.tsx`
- Modify: `src/app/App.tsx`, `src/index.css`
- Test: `src/app/layout/AppLayout.test.tsx`

**Interfaces:**
- Consumes: `useGlobalFilters`, `PERIODS`, `REGIONS` (Task 4), `CardProcessingPage` (Task 6).
- Produces:
  - `NAV_ITEMS: { to: string; label: string; icon: LucideIcon }[]` (rotas `/card-processing`, `/financial`, `/inventory`, `/logistics`, `/gallery`)
  - `useTheme(): { theme: 'light' | 'dark'; toggle(): void }` (classe `dark` em `<html>`, persiste em `localStorage` com try/catch)
  - `routes: RouteObject[]` (usado por `createBrowserRouter` e pelos testes com `createMemoryRouter`)
  - `ComingSoon({ title: string })`

- [ ] **Step 1: Escrever o teste do layout que falha**

`src/app/layout/AppLayout.test.tsx`:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { routes } from '@/app/routes'

const renderAt = (url: string) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RouterProvider router={createMemoryRouter(routes, { initialEntries: [url] })} />
    </QueryClientProvider>,
  )

describe('AppLayout', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/?delay=0')
    document.documentElement.classList.remove('dark')
  })

  it('keeps active filters in navigation links', async () => {
    renderAt('/financial?period=30d')
    const link = await screen.findByRole('link', { name: /Processamento de Cartões/ })
    expect(link).toHaveAttribute('href', expect.stringContaining('period=30d'))
  })

  it('shows the placeholder for routes not built yet', async () => {
    renderAt('/financial')
    expect(await screen.findByRole('heading', { name: 'Desempenho Financeiro' })).toBeInTheDocument()
  })

  it('toggles the dark theme class', async () => {
    renderAt('/financial')
    await userEvent.click(await screen.findByRole('button', { name: /tema/i }))
    expect(document.documentElement).toHaveClass('dark')
  })

  it('lets the user change the period filter', async () => {
    renderAt('/financial')
    await userEvent.selectOptions(await screen.findByLabelText('Período'), '30d')
    expect(screen.getByLabelText('Período')).toHaveValue('30d')
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/app/layout`
Expected: FAIL (`@/app/routes` não existe).

- [ ] **Step 3: Implementar navegação, tema e placeholder**

`src/app/nav.ts`:

```ts
import { CreditCard, LayoutGrid, Package, TrendingUp, Truck, type LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/card-processing', label: 'Processamento de Cartões', icon: CreditCard },
  { to: '/financial', label: 'Desempenho Financeiro', icon: TrendingUp },
  { to: '/inventory', label: 'Gestão de Estoque', icon: Package },
  { to: '/logistics', label: 'Logística', icon: Truck },
  { to: '/gallery', label: 'Galeria de Componentes', icon: LayoutGrid },
]
```

`src/app/layout/useTheme.ts`:

```ts
import { useCallback, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'
const KEY = 'dashgeral-theme'

function initialTheme(): Theme {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    // storage indisponível: segue a preferência do sistema
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(initialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    try {
      localStorage.setItem(KEY, theme)
    } catch {
      // ignorar
    }
  }, [theme])

  const toggle = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [])
  return { theme, toggle }
}
```

`src/shared/ui/ComingSoon.tsx`:

```tsx
export function ComingSoon({ title }: { title: string }) {
  return (
    <section>
      <h1 className="mb-2 text-xl font-semibold">{title}</h1>
      <p className="text-slate-500">Esta página será migrada nos próximos planos.</p>
    </section>
  )
}
```

`src/index.css`:

```css
@import 'tailwindcss';
@custom-variant dark (&:where(.dark, .dark *));

body {
  @apply bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100;
}
```

- [ ] **Step 4: Implementar barra de filtros, layout e rotas**

`src/app/filters/GlobalFiltersBar.tsx`:

```tsx
import { PERIODS, REGIONS, type GlobalFilters } from '@/data/types/filters'
import { useGlobalFilters } from './useGlobalFilters'

const PERIOD_LABELS: Record<GlobalFilters['period'], string> = {
  all: 'Todo o período', '7d': 'Últimos 7 dias', '30d': 'Últimos 30 dias',
  '90d': 'Últimos 90 dias', '12m': 'Últimos 12 meses',
}
const REGION_LABELS: Record<GlobalFilters['region'], string> = {
  all: 'Todas as regiões', norte: 'Norte', nordeste: 'Nordeste',
  'centro-oeste': 'Centro-Oeste', sudeste: 'Sudeste', sul: 'Sul',
}

const selectClass =
  'rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900'

export function GlobalFiltersBar() {
  const { filters, setFilters } = useGlobalFilters()
  return (
    <div className="flex flex-wrap gap-4">
      <label className="flex items-center gap-2 text-sm">
        Período
        <select
          className={selectClass}
          value={filters.period}
          onChange={(e) => setFilters({ period: e.target.value as GlobalFilters['period'] })}
        >
          {PERIODS.map((p) => <option key={p} value={p}>{PERIOD_LABELS[p]}</option>)}
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm">
        Região
        <select
          className={selectClass}
          value={filters.region}
          onChange={(e) => setFilters({ region: e.target.value as GlobalFilters['region'] })}
        >
          {REGIONS.map((r) => <option key={r} value={r}>{REGION_LABELS[r]}</option>)}
        </select>
      </label>
    </div>
  )
}
```

`src/app/layout/AppLayout.tsx`:

```tsx
import { Moon, Sun } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { GlobalFiltersBar } from '@/app/filters/GlobalFiltersBar'
import { NAV_ITEMS } from '@/app/nav'
import { useTheme } from './useTheme'

export function AppLayout() {
  const { search } = useLocation()
  const { theme, toggle } = useTheme()
  return (
    <div className="min-h-screen md:grid md:grid-cols-[16rem_1fr]">
      <nav aria-label="Principal" className="flex gap-1 overflow-x-auto border-b border-slate-200 p-3 md:flex-col md:border-r md:border-b-0 dark:border-slate-800">
        <span className="hidden px-3 py-2 text-lg font-bold md:block">Dashgeral</span>
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={{ pathname: to, search }}
            className={({ isActive }) =>
              `flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`
            }
          >
            <Icon size={16} aria-hidden />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="min-w-0 p-4 md:p-6">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <GlobalFiltersBar />
          <button
            type="button"
            onClick={toggle}
            aria-label="Alternar tema"
            className="rounded-md border border-slate-300 p-2 dark:border-slate-700"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </header>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
```

`src/app/routes.tsx`:

```tsx
import { Navigate, type RouteObject } from 'react-router-dom'
import { ComingSoon } from '@/shared/ui/ComingSoon'
import { AppLayout } from './layout/AppLayout'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/card-processing" replace /> },
      {
        path: 'card-processing',
        lazy: async () => ({
          Component: (await import('@/features/card-processing/CardProcessingPage')).CardProcessingPage,
        }),
      },
      { path: 'financial', element: <ComingSoon title="Desempenho Financeiro" /> },
      { path: 'inventory', element: <ComingSoon title="Gestão de Estoque" /> },
      { path: 'logistics', element: <ComingSoon title="Logística" /> },
      { path: 'gallery', element: <ComingSoon title="Galeria de Componentes" /> },
    ],
  },
]
```

`src/app/App.tsx` (substitui o placeholder):

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { routes } from './routes'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, refetchOnWindowFocus: false } },
})
const router = createBrowserRouter(routes)

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
```

- [ ] **Step 5: Rodar e ver passar**

Run: `npm test && npm run typecheck && npm run lint && npm run build`
Expected: todos os testes PASS (4 novos no layout); typecheck, lint e build sem erros. Se o `lazy` reclamar de tipagem, garantir `react-router-dom` 7 ou superior. Se o `matchMedia` não existir no jsdom, o `?.` em `useTheme` já cobre esse caso.

- [ ] **Step 6: Verificar no navegador**

Run: `npm run dev` e abrir a URL exibida. Conferir: `/` redireciona para `/card-processing`, o skeleton aparece e depois os 4 KPIs, trocar o período muda os números, o filtro persiste ao navegar entre abas e a URL recebe `?period=...`. Testar também `?error=1` (alerta com "Tentar novamente") e o botão de tema.

- [ ] **Step 7: Commit**

```bash
git add src && git commit -m "feat: add app layout, routes, theme toggle and global filters bar

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 8: CI, README e verificação final da fundação

**Files:**
- Create: `.github/workflows/ci.yml`
- Modify: `README.md` (reescrever)

- [ ] **Step 1: Criar o workflow de CI**

`.github/workflows/ci.yml`:

```yaml
name: CI
on:
  push:
    branches: [main, 'modernize/**']
  pull_request:
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test
      - run: npm run build
```

- [ ] **Step 2: Reescrever o README**

`README.md`:

```markdown
# Dashgeral

Template de apresentação de dashboards com dados mock. Mostra os tipos de visualização
que dá para integrar a um painel (gráficos, mapas, tabelas, fluxos), sem depender de banco.

## Rodando

    npm install
    npm run dev

Flags de demonstração na URL: `?delay=0` remove a latência simulada; `?error=1` força erro.

## Estrutura

- `src/app`: providers, rotas, layout e filtros globais (na URL).
- `src/features`: uma pasta por domínio.
- `src/data`: tipos, interfaces de repositório e implementações mock (seed fixa).
- `src/shared`: UI, formatters e utilitários.
- `legacy/`: código antigo (JS + Supabase), mantido só como referência até o Plano 6.

## Trocando mock por API real

Implemente as interfaces de `src/data/repositories/*.ts` e troque as implementações em
`src/data/repositories/index.ts`. Nenhuma página precisa mudar.
```

- [ ] **Step 3: Verificação final**

Run: `npm ci && npm run lint && npm run typecheck && npm test && npm run build`
Expected: tudo passa a partir de uma instalação limpa.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "ci: add GitHub Actions workflow and rewrite README

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Self-Review

- **Cobertura da spec (escopo deste plano):** stack e tooling (T1), formatters pt-BR (T2), seed fixa (T3), filtros na URL com Zod (T4), latência e erro simulados por `?delay` e `?error`, repositórios com interface e mock e ponto único de troca (T5), skeleton, erro e KPI (T6), layout, tema, rotas lazy e navegação que preserva filtros (T7), CI, `.env.example`, README e remoção do `.env` (T1, T8). Ficam para os planos seguintes: as 4 páginas de domínio, a Galeria, as libs Recharts, ECharts, Leaflet, TanStack Table e React Flow, e a remoção de `legacy/`.
- **Placeholders:** nenhum. Os pontos condicionais (peer deps, `recommended-latest`, expectativa do `formatCompact`, `.catch` do Zod) trazem a ação corretiva concreta.
- **Consistência de tipos:** `GlobalFilters`, `DEFAULT_FILTERS`, `PERIODS`, `REGIONS`, `useGlobalFilters`, `createRng`, `simulate`, `readDevFlags`, `CardProcessingKpis`, `CardProcessingRepository`, `repositories`, `KPICard`, `QueryBoundary`, `Skeleton`, `routes` e `NAV_ITEMS` têm a mesma assinatura em todas as tarefas.
