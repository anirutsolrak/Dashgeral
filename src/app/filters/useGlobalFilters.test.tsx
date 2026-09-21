import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { useGlobalFilters } from './useGlobalFilters'

const wrap = (url: string) => ({ children }: { children: ReactNode }) => (
  <MemoryRouter initialEntries={[url]}>{children}</MemoryRouter>
)

describe('useGlobalFilters', () => {
  it('reads valid filters from the URL', () => {
    const { result } = renderHook(() => useGlobalFilters(), {
      wrapper: wrap('/?period=30d&region=sul'),
    })
    expect(result.current.filters.period).toBe('30d')
    expect(result.current.filters.region).toBe('sul')
  })

  it('falls back to defaults on invalid values', () => {
    const { result } = renderHook(() => useGlobalFilters(), {
      wrapper: wrap('/?period=banana&region=marte'),
    })
    expect(result.current.filters.period).toBe('all')
    expect(result.current.filters.region).toBe('all')
  })

  it('updates filters with a partial patch', () => {
    const { result } = renderHook(() => useGlobalFilters(), { wrapper: wrap('/') })
    act(() => result.current.setFilters({ period: '90d' }))
    expect(result.current.filters.period).toBe('90d')
    act(() => result.current.setFilters({ period: 'all' }))
    expect(result.current.filters.period).toBe('all')
  })

  it('resets agreement when the category changes', () => {
    const { result } = renderHook(() => useGlobalFilters(), {
      wrapper: wrap('/?agreementCategory=inss&agreement=x'),
    })
    act(() => result.current.setFilters({ agreementCategory: 'governo' }))
    expect(result.current.filters.agreement).toBe('all')
  })
})
