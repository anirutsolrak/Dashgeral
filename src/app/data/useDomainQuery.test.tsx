import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter, useNavigate } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import type { GlobalFilters } from '@/data/types/filters'
import { useDevFlags, useDomainQuery } from './useDomainQuery'

const wrap = (url: string) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[url]}>{children}</MemoryRouter>
    </QueryClientProvider>
  )
}

describe('useDomainQuery', () => {
  it('passes validated filters to the fetcher and returns its data', async () => {
    const fetcher = vi.fn(async (f: GlobalFilters) => ({ period: f.period }))
    const { result } = renderHook(() => useDomainQuery('t', 'x', fetcher), {
      wrapper: wrap('/?period=30d'),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ period: '30d' })
    expect(fetcher).toHaveBeenCalledWith(expect.objectContaining({ period: '30d' }))
  })

  it('refetches when a dev flag changes in the URL', async () => {
    const fetcher = vi.fn(async () => 1)
    const { result } = renderHook(
      () => ({ q: useDomainQuery('t', 'y', fetcher), navigate: useNavigate() }),
      { wrapper: wrap('/?delay=0') },
    )
    await waitFor(() => expect(result.current.q.isSuccess).toBe(true))
    act(() => result.current.navigate('/?delay=0&error=1'))
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2))
  })
})

describe('useDevFlags', () => {
  it('reads the flags from the URL', () => {
    const { result } = renderHook(() => useDevFlags(), { wrapper: wrap('/?delay=0&error=1') })
    expect(result.current).toEqual({ delayMs: 0, forceError: true })
  })
})
