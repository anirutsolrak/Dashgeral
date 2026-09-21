import { screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/renderWithProviders'

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TileLayer: () => null,
  CircleMarker: ({ children }: { children: ReactNode }) => (
    <div data-testid="marker">{children}</div>
  ),
  Polyline: () => <div data-testid="route" />,
  Circle: ({ children }: { children: ReactNode }) => <div data-testid="area">{children}</div>,
  Popup: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

import { MapsPage } from './MapsPage'

const url = '/gallery/maps?delay=0'

describe('MapsPage', () => {
  beforeEach(() => window.history.replaceState({}, '', url))

  it('renders the four examples with their maps', async () => {
    renderWithProviders(<MapsPage />, { url })
    expect(
      screen.getByRole('heading', { level: 1, name: 'Mapas (react-leaflet)' }),
    ).toBeInTheDocument()
    const titles = (await screen.findAllByRole('heading', { level: 2 })).map((h) => h.textContent)
    expect(titles).toEqual([
      'Bolhas por região',
      'Mapa temático por capital',
      'Rotas entre centros',
      'Áreas de cobertura',
    ])
    expect(screen.getAllByRole('region', { name: /^Mapa:/ })).toHaveLength(4)
    expect(screen.getAllByTestId('route').length).toBeGreaterThan(0)
    expect(screen.getAllByTestId('area')).toHaveLength(5)
  })

  it('lists the values as text for assistive tech', async () => {
    renderWithProviders(<MapsPage />, { url })
    expect(
      await screen.findByRole('list', { name: 'Valores: Índice de SLA por região' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('list', { name: /^Rotas:/ })).toBeInTheDocument()
    expect(screen.getByRole('list', { name: /^Áreas:/ })).toBeInTheDocument()
  })

  it('shows an error alert when the repository fails', async () => {
    window.history.replaceState({}, '', '/gallery/maps?delay=0&error=1')
    renderWithProviders(<MapsPage />, { url: '/gallery/maps?delay=0&error=1' })
    expect(await screen.findByRole('alert')).toHaveTextContent('Falha simulada')
  })
})
