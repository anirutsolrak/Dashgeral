import { useDomainQuery } from '@/app/data/useDomainQuery'
import { repositories } from '@/data/repositories'

const repo = repositories.inventory

export const useInventory = () =>
  useDomainQuery('inventory', 'overview', (f) => repo.getOverview(f))
export const useLossTrend = () =>
  useDomainQuery('inventory', 'loss-trend', (f) => repo.getLossTrend(f))
