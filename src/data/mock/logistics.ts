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
