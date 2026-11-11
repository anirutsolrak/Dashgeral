import type {
  ContactCenterOverview,
  HourlyCalls,
  OperatorStat,
  RegionCalls,
  TabulationCount,
} from '@/data/types/contact-center'
import type { GlobalFilters } from '@/data/types/filters'
import { createRng } from './random'
import { seedFor, splitByWeights, volumeFactor } from './scale'

const NOT_EFFECTIVE = [
  'Cliente ausente',
  'Cliente desligou',
  'Ligação caiu',
  'Ligação muda',
  'Caixa postal',
]
const OTHER_OUTCOMES = ['Endereço divergente', 'Recusou confirmar', 'Pediu retorno']
const OPERATORS = [
  'Ana Ribeiro',
  'Bruno Tavares',
  'Camila Freitas',
  'Diego Nogueira',
  'Elisa Moura',
  'Fábio Antunes',
  'Gisele Prado',
  'Hugo Matos',
]
// Mais ligações no fim da manhã e no meio da tarde, como no relatório original.
const HOUR_SHAPE = [0.6, 0.9, 1.1, 1.0, 0.7, 0.8, 1.0, 1.1, 0.9, 0.7, 0.4]
const REGIONS = [
  { region: 'norte', label: 'Norte', lat: -3.4, lng: -60, share: 0.09 },
  { region: 'nordeste', label: 'Nordeste', lat: -9, lng: -40, share: 0.27 },
  { region: 'centro-oeste', label: 'Centro-Oeste', lat: -15.5, lng: -54, share: 0.07 },
  { region: 'sudeste', label: 'Sudeste', lat: -20, lng: -45, share: 0.42 },
  { region: 'sul', label: 'Sul', lat: -27, lng: -51.5, share: 0.15 },
] as const

/** Divide `total` proporcionalmente aos pesos; a sobra do arredondamento vai para o maior peso. */
function splitExact(total: number, weights: readonly number[]): number[] {
  const sum = weights.reduce((a, b) => a + b, 0)
  const parts = weights.map((w) => (sum === 0 ? 0 : Math.floor((total * w) / sum)))
  const biggest = weights.indexOf(Math.max(...weights))
  parts[biggest] = (parts[biggest] ?? 0) + total - parts.reduce((a, b) => a + b, 0)
  return parts
}

export function buildContactCenter(f: GlobalFilters): ContactCenterOverview {
  const rng = createRng(seedFor(f, 'contact-center'))
  const total = Math.round(12000 * (0.9 + rng.next() * 0.2) * volumeFactor(f))
  const abandoned = Math.round(total * (0.18 + rng.next() * 0.08))
  const attended = total - abandoned
  const confirmed = Math.round(attended * (0.45 + rng.next() * 0.1))
  const notEffective = Math.round(attended * (0.2 + rng.next() * 0.08))
  return {
    total,
    attended,
    abandoned,
    confirmed,
    notEffective,
    avgHandleSeconds: Math.round(150 + rng.next() * 90),
    lostSeconds: Math.round(notEffective * (25 + rng.next() * 20)),
  }
}

export function buildTabulations(f: GlobalFilters): TabulationCount[] {
  const o = buildContactCenter(f)
  const rng = createRng(seedFor(f, 'contact-center-tabulations'))
  const toData = (rows: { reason: string; count: number }[]) =>
    rows.map((r) => ({ label: r.reason, value: r.count }))
  return [
    { label: 'Endereço confirmado', value: o.confirmed },
    ...toData(splitByWeights(o.notEffective, NOT_EFFECTIVE, rng)),
    ...toData(splitByWeights(o.attended - o.confirmed - o.notEffective, OTHER_OUTCOMES, rng)),
  ]
}

export function buildHourly(f: GlobalFilters): HourlyCalls[] {
  const o = buildContactCenter(f)
  const rng = createRng(seedFor(f, 'contact-center-hourly'))
  const shape = HOUR_SHAPE.map((w) => w * (0.9 + rng.next() * 0.2))
  const attended = splitExact(o.attended, shape)
  const abandoned = splitExact(o.abandoned, shape)
  return shape.map((_, i) => ({
    label: `${String(8 + i).padStart(2, '0')}h`,
    attended: attended[i] ?? 0,
    abandoned: abandoned[i] ?? 0,
  }))
}

export function buildOperators(f: GlobalFilters): OperatorStat[] {
  const o = buildContactCenter(f)
  const rng = createRng(seedFor(f, 'contact-center-operators'))
  return splitByWeights(o.total, OPERATORS, rng)
    .map(({ reason: name, count: calls }) => ({
      name,
      calls,
      confirmed: Math.round(calls * (0.3 + rng.next() * 0.3)),
      avgHandleSeconds: Math.round(120 + rng.next() * 120),
    }))
    .sort((a, b) => b.calls - a.calls)
}

export function buildRegionCalls(f: GlobalFilters): RegionCalls[] {
  const o = buildContactCenter(f)
  const rng = createRng(seedFor(f, 'contact-center-regions'))
  const weights = REGIONS.map((r) => (f.region === 'all' || f.region === r.region ? r.share : 0))
  const calls = splitExact(o.total, weights)
  return REGIONS.map(({ region, label, lat, lng }, i) => ({
    region,
    label,
    lat,
    lng,
    calls: calls[i] ?? 0,
    confirmed: Math.round((calls[i] ?? 0) * (0.4 + rng.next() * 0.2)),
  }))
}
