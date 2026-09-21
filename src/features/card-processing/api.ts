import { useQuery } from '@tanstack/react-query'
import { useGlobalFilters } from '@/app/filters/useGlobalFilters'
import { repositories } from '@/data/repositories'

export function useCardProcessingKpis() {
  const { filters } = useGlobalFilters()
  return useQuery({
    queryKey: ['card-processing', 'kpis', filters],
    queryFn: () => repositories.cardProcessing.getKpis(filters),
  })
}
