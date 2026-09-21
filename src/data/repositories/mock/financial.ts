import { buildFinancialOverview, buildUnlockByRegion, buildUsageEvolution } from '@/data/mock/financial'
import { simulate } from '@/data/mock/simulate'
import type { FinancialRepository } from '@/data/repositories/financial'

export const mockFinancialRepository: FinancialRepository = {
  getOverview: (filters) => simulate(() => buildFinancialOverview(filters)),
  getUnlockByRegion: (filters) => simulate(() => buildUnlockByRegion(filters)),
  getUsageEvolution: (filters) => simulate(() => buildUsageEvolution(filters)),
}
