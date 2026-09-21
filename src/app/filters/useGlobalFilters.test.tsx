import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { useGlobalFilters } from './useGlobalFilters'

let search = ''
function LocationReader() {
  search = useLocation().search
  return null
}

const wrapWithReader = (url: string) => ({ children }: { children: ReactNode }) => (
  <MemoryRouter initialEntries={[url]}>
    <LocationReader />
    {children}
  </MemoryRouter>
)

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

  it('preserves unrelated params and omits defaults from the URL', () => {
    const { result } = renderHook(() => useGlobalFilters(), {
      wrapper: wrapWithReader('/?delay=0&error=1&period=30d'),
    })
    act(() => result.current.setFilters({ region: 'sul' }))
    const kept = new URLSearchParams(search)
    expect(kept.get('delay')).toBe('0')
    expect(kept.get('error')).toBe('1')
    expect(kept.get('region')).toBe('sul')
    act(() => result.current.setFilters({ period: 'all' }))
    expect(new URLSearchParams(search).has('period')).toBe(false)
  })
})
