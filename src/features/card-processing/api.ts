import { useQuery } from '@tanstack/react-query'
import { useDevFlags, useDomainQuery } from '@/app/data/useDomainQuery'
import { repositories } from '@/data/repositories'
import type { WorkflowKpi } from '@/data/types/card-processing'

const repo = repositories.cardProcessing

export const useOverview = () =>
  useDomainQuery('card-processing', 'overview', (f) => repo.getOverview(f))
export const useIntegrationTrend = () =>
  useDomainQuery('card-processing', 'trend', (f) => repo.getIntegrationTrend(f))
export const useIntegrationReasons = () =>
  useDomainQuery('card-processing', 'integration-reasons', (f) => repo.getIntegrationReasons(f))
export const useAccountReasons = () =>
  useDomainQuery('card-processing', 'account-reasons', (f) => repo.getAccountReasons(f))
export const useInsuranceBreakdown = () =>
  useDomainQuery('card-processing', 'insurance', (f) => repo.getInsuranceBreakdown(f))

export function useWorkflow(kpi: WorkflowKpi) {
  const devFlags = useDevFlags()
  return useQuery({
    queryKey: ['card-processing', 'workflow', kpi, devFlags],
    queryFn: () => repo.getWorkflow(kpi),
    staleTime: Infinity,
  })
}
