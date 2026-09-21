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
