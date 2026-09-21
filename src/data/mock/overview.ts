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
