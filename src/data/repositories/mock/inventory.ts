import { buildInventory, buildLossTrend } from '@/data/mock/inventory'
import { simulate } from '@/data/mock/simulate'
import type { InventoryRepository } from '@/data/repositories/inventory'

export const mockInventoryRepository: InventoryRepository = {
  getOverview: (filters) => simulate(() => buildInventory(filters)),
  getLossTrend: (filters) => simulate(() => buildLossTrend(filters)),
}
