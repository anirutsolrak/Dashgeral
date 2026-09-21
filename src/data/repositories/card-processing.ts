import type { CardProcessingKpis, CardProcessingOverview, TrendPoint } from '@/data/types/card-processing'
import type { GlobalFilters } from '@/data/types/filters'

export interface CardProcessingRepository {
  getKpis(filters: GlobalFilters): Promise<CardProcessingKpis>
  getOverview(filters: GlobalFilters): Promise<CardProcessingOverview>
  getIntegrationTrend(filters: GlobalFilters): Promise<TrendPoint[]>
}
