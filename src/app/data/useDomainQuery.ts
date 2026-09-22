import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useGlobalFilters } from '@/app/filters/useGlobalFilters'
import { readDevFlags, type DevFlags } from '@/data/mock/simulate'
import type { GlobalFilters } from '@/data/types/filters'

export function useDevFlags(): DevFlags {
  const { search } = useLocation()
  return useMemo(() => readDevFlags(search), [search])
}

export function useDomainQuery<T>(
  domain: string,
  name: string,
  fetcher: (filters: GlobalFilters) => Promise<T>,
) {
  const { filters } = useGlobalFilters()
  const devFlags = useDevFlags()
  return useQuery({
    queryKey: [domain, name, filters, devFlags],
    queryFn: () => fetcher(filters),
  })
}
