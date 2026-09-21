import type { CardProcessingKpis } from '@/data/types/card-processing'
import type { GlobalFilters } from '@/data/types/filters'

export interface CardProcessingRepository {
  getKpis(filters: GlobalFilters): Promise<CardProcessingKpis>
}
