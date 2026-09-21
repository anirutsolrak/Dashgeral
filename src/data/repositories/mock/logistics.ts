import { buildLogistics, buildLogisticsTrend, buildTypeComparison } from '@/data/mock/logistics'
import { LOGISTICS_CATALOG } from '@/data/mock/logistics-catalog'
import { simulate } from '@/data/mock/simulate'
import type { LogisticsRepository } from '@/data/repositories/logistics'

export const mockLogisticsRepository: LogisticsRepository = {
  getOverview: (filters) => simulate(() => buildLogistics(filters)),
  getTrend: (filters) => simulate(() => buildLogisticsTrend(filters)),
  getTypeComparison: (filters) => simulate(() => buildTypeComparison(filters)),
  getCatalog: () => simulate(() => structuredClone(LOGISTICS_CATALOG)),
}
