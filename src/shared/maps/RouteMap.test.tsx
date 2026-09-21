import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { RouteMap } from './RouteMap'

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TileLayer: () => null,
  Polyline: ({ positions }: { positions: unknown }) => (
    <div data-testid="route" data-positions={JSON.stringify(positions)} />
  ),
  CircleMarker: ({ children }: { children: ReactNode }) => <div data-testid="hub">{children}</div>,
  Popup: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

const hubs = [
  { id: 'sp', label: 'São Paulo', lat: -23.55, lng: -46.63 },
  { id: 'rj', label: 'Rio de Janeiro', lat: -22.9, lng: -43.17 },
]

describe('RouteMap', () => {
  it('draws one line per valid route and one marker per hub', () => {
    render(
      <RouteMap
        title="Rotas"
        hubs={hubs}
        routes={[
          { id: 'a', from: 'sp', to: 'rj', volume: 1200 },
          { id: 'b', from: 'sp', to: 'xx', volume: 5 },
        ]}
      />,
    )
    expect(screen.getByRole('region', { name: 'Mapa: Rotas' })).toBeInTheDocument()
    expect(screen.getAllByTestId('route')).toHaveLength(1)
    expect(screen.getAllByTestId('hub')).toHaveLength(2)
    expect(screen.getByTestId('route')).toHaveAttribute(
      'data-positions',
      '[[-23.55,-46.63],[-22.9,-43.17]]',
    )
  })

  it('lists the routes as text for assistive tech', () => {
    render(
      <RouteMap
        title="Rotas"
        hubs={hubs}
        routes={[{ id: 'a', from: 'sp', to: 'rj', volume: 1200 }]}
        format={(v) => `${v} envios`}
      />,
    )
    const list = screen.getByRole('list', { name: 'Rotas: Rotas' })
    expect(list).toHaveTextContent('São Paulo → Rio de Janeiro: 1200 envios')
  })
})
