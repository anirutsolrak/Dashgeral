import type { TrendPoint } from '@/data/types/card-processing'
import type { GlobalFilters } from '@/data/types/filters'
import type { FinancialOverview, RegionUnlock } from '@/data/types/financial'

export interface FinancialRepository {
  getOverview(filters: GlobalFilters): Promise<FinancialOverview>
  getUnlockByRegion(filters: GlobalFilters): Promise<RegionUnlock[]>
  getUsageEvolution(filters: GlobalFilters): Promise<TrendPoint[]>
}
