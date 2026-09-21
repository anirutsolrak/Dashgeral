import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { CoverageMap } from './CoverageMap'

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TileLayer: () => null,
  Circle: ({ radius, children }: { radius: number; children: ReactNode }) => (
    <div data-testid="area" data-radius={radius}>
      {children}
    </div>
  ),
  Popup: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

describe('CoverageMap', () => {
  it('draws a circle per area with the radius in metres', () => {
    render(
      <CoverageMap
        title="Cobertura"
        areas={[
          {
            id: 'a',
            label: 'Capital',
            lat: -23.5,
            lng: -46.6,
            radiusKm: 120,
            detail: '32 agências',
          },
        ]}
      />,
    )
    expect(screen.getByRole('region', { name: 'Mapa: Cobertura' })).toBeInTheDocument()
    expect(screen.getByTestId('area')).toHaveAttribute('data-radius', '120000')
    expect(screen.getByRole('list', { name: 'Áreas: Cobertura' })).toHaveTextContent(
      'Capital: raio de 120 km, 32 agências',
    )
  })
})
