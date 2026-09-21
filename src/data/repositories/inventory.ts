import type { TrendPoint } from '@/data/types/card-processing'
import type { GlobalFilters } from '@/data/types/filters'
import type { InventoryOverview } from '@/data/types/inventory'

export interface InventoryRepository {
  getOverview(filters: GlobalFilters): Promise<InventoryOverview>
  getLossTrend(filters: GlobalFilters): Promise<TrendPoint[]>
}
