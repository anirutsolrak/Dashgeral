import { useDomainQuery } from '@/app/data/useDomainQuery'
import { repositories } from '@/data/repositories'

const repo = repositories.financial

export const useFinancialOverview = () =>
  useDomainQuery('financial', 'overview', (f) => repo.getOverview(f))
export const useUnlockByRegion = () =>
  useDomainQuery('financial', 'unlock', (f) => repo.getUnlockByRegion(f))
export const useUsageEvolution = () =>
  useDomainQuery('financial', 'evolution', (f) => repo.getUsageEvolution(f))
