import { useQuery } from '@tanstack/react-query'
import { useDevFlags, useDomainQuery } from '@/app/data/useDomainQuery'
import { repositories } from '@/data/repositories'

const repo = repositories.logistics

export const useLogistics = () => useDomainQuery('logistics', 'overview', (f) => repo.getOverview(f))
export const useLogisticsTrend = () => useDomainQuery('logistics', 'trend', (f) => repo.getTrend(f))
export const useTypeComparison = () => useDomainQuery('logistics', 'by-type', (f) => repo.getTypeComparison(f))

export function useLogisticsCatalog() {
  const devFlags = useDevFlags()
  return useQuery({
    queryKey: ['logistics', 'catalog', devFlags],
    queryFn: () => repo.getCatalog(),
    staleTime: Infinity,
  })
}
