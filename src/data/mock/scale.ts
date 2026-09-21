import type { ReasonCount } from '@/data/types/card-processing'
import type { GlobalFilters } from '@/data/types/filters'
import type { Rng } from './random'

const PERIOD_FACTOR: Record<GlobalFilters['period'], number> = {
  all: 1,
  '12m': 0.8,
  '90d': 0.3,
  '30d': 0.1,
  '7d': 0.03,
}
const REGION_FACTOR: Record<GlobalFilters['region'], number> = {
  all: 1,
  sudeste: 0.42,
  nordeste: 0.27,
  sul: 0.15,
  norte: 0.09,
  'centro-oeste': 0.07,
}

export const periodFactor = (f: GlobalFilters): number => PERIOD_FACTOR[f.period]

export const volumeFactor = (f: GlobalFilters): number => periodFactor(f) * REGION_FACTOR[f.region]

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
