import { screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/renderWithProviders'
import { UnlockByRegion } from './UnlockByRegion'

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TileLayer: () => null,
  CircleMarker: ({ children }: { children: ReactNode }) => (
    <div data-testid="marker">{children}</div>
  ),
  Popup: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

describe('UnlockByRegion', () => {
  beforeEach(() => window.history.replaceState({}, '', '/?delay=0'))

  it('shows the map and the grouped comparison for the five regions', async () => {
    renderWithProviders(<UnlockByRegion />, { url: '/?delay=0' })
    expect(
      await screen.findByRole('heading', { name: 'Taxa de Desbloqueio de Cartões por Região' }),
    ).toBeInTheDocument()
    expect(await screen.findAllByTestId('marker')).toHaveLength(5)
    expect(
      screen.getByRole('heading', { name: 'Comparativo Desbloqueios vs. Bloqueios por Região' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: /Norte: Desbloqueados .*Bloqueados/ }),
    ).toBeInTheDocument()
    expect(screen.getByRole('list', { name: /Valores: Taxa de Desbloqueio/ })).toHaveTextContent(
      /Sudeste: \d+,\d%/,
    )
  })

  it('follows the region filter', async () => {
    renderWithProviders(<UnlockByRegion />, { url: '/?delay=0&region=sul' })
    expect(await screen.findAllByTestId('marker')).toHaveLength(1)
  })

  it('shows the error state', async () => {
    window.history.replaceState({}, '', '/?delay=0&error=1')
    renderWithProviders(<UnlockByRegion />, { url: '/?delay=0&error=1' })
    expect((await screen.findAllByRole('alert')).length).toBeGreaterThan(0)
  })
})
