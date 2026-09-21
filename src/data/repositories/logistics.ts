import type { TrendPoint } from '@/data/types/card-processing'
import type { GlobalFilters } from '@/data/types/filters'
import type { LogisticsCatalog, LogisticsOverview, TypeComparisonRow } from '@/data/types/logistics'

export interface LogisticsRepository {
  getOverview(filters: GlobalFilters): Promise<LogisticsOverview>
  getTrend(filters: GlobalFilters): Promise<TrendPoint[]>
  getTypeComparison(filters: GlobalFilters): Promise<TypeComparisonRow[]>
  getCatalog(): Promise<LogisticsCatalog>
}
