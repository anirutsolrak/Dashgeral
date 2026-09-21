import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useGlobalFilters } from '@/app/filters/useGlobalFilters'
import { readDevFlags } from '@/data/mock/simulate'
import { repositories } from '@/data/repositories'

export function useCardProcessingKpis() {
  const { filters } = useGlobalFilters()
  const { search } = useLocation()
  const devFlags = useMemo(() => readDevFlags(search), [search])
  return useQuery({
    queryKey: ['card-processing', 'kpis', filters, devFlags],
    queryFn: () => repositories.cardProcessing.getKpis(filters),
  })
}
