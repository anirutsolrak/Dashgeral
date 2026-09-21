import { buildOverview } from '@/data/mock/overview'
import { buildTrend } from '@/data/mock/trend'
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
  getOverview: (filters) => simulate(() => buildOverview(filters)),
  getIntegrationTrend: (filters) => simulate(() => buildTrend(filters)),
}
