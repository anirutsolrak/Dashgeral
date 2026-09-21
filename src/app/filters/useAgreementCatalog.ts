import { useQuery } from '@tanstack/react-query'
import { useDevFlags } from '@/app/data/useDomainQuery'
import { repositories } from '@/data/repositories'

export function useAgreementCatalog() {
  const devFlags = useDevFlags()
  return useQuery({
    queryKey: ['catalog', devFlags],
    queryFn: () => repositories.catalog.getAgreementCatalog(),
    staleTime: Infinity,
  })
}
