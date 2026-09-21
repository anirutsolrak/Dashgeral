import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DEFAULT_FILTERS, globalFiltersSchema, type GlobalFilters } from '@/data/types/filters'

const parse = (params: URLSearchParams): GlobalFilters =>
  globalFiltersSchema.parse(Object.fromEntries(params))

export function useGlobalFilters() {
  const [params, setParams] = useSearchParams()
  const filters = useMemo(() => parse(params), [params])

  const setFilters = useCallback(
    (patch: Partial<GlobalFilters>) => {
      setParams((prev) => {
        const current = parse(prev)
        const next: GlobalFilters = { ...current, ...patch }
        const categoryChanged =
          patch.agreementCategory !== undefined &&
          patch.agreementCategory !== current.agreementCategory
        if (categoryChanged && patch.agreement === undefined) next.agreement = 'all'

        const out = new URLSearchParams(prev)
        for (const key of Object.keys(DEFAULT_FILTERS) as (keyof GlobalFilters)[]) {
          if (next[key] === DEFAULT_FILTERS[key]) out.delete(key)
          else out.set(key, next[key])
        }
        return out
      })
    },
    [setParams],
  )

  return { filters, setFilters }
}
