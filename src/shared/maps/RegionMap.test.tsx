import { render, screen, within } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { RegionMap, defaultColorFor, type MapPoint } from './RegionMap'

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: ReactNode }) => <div data-testid="map">{children}</div>,
  TileLayer: () => null,
  CircleMarker: ({ children, center, radius }: { children: ReactNode; center: [number, number]; radius: number }) => (
    <div data-testid="marker" data-center={center.join(',')} data-radius={radius}>
      {children}
    </div>
  ),
  Popup: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

const points: MapPoint[] = [
  { id: 'norte', label: 'Norte', lat: -3.4, lng: -60, value: 83.3, detail: '1.500 desbloqueados' },
  { id: 'sul', label: 'Sul', lat: -27, lng: -51.5, value: 88.2, detail: '3.000 desbloqueados' },
]
const format = (v: number) => `${v.toFixed(1)}%`

describe('RegionMap', () => {
  it('renders an accessible region with a title and one marker per point', () => {
    render(<RegionMap title="Taxa de desbloqueio" points={points} format={format} />)
    expect(screen.getByRole('heading', { name: 'Taxa de desbloqueio' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Mapa: Taxa de desbloqueio' })).toBeInTheDocument()
    const markers = screen.getAllByTestId('marker')
    expect(markers).toHaveLength(2)
    expect(markers[0]).toHaveAttribute('data-center', '-3.4,-60')
    expect(markers[1]).toHaveTextContent('3.000 desbloqueados')
  })

  it('scales the marker radius with the value', () => {
    render(<RegionMap title="Mapa" points={points} format={format} />)
    const [norte, sul] = screen.getAllByTestId('marker')
    expect(Number(sul?.getAttribute('data-radius'))).toBeGreaterThan(Number(norte?.getAttribute('data-radius')))
  })

  it('offers a textual alternative with formatted values', () => {
    render(<RegionMap title="Mapa" points={points} format={format} />)
    const list = screen.getByRole('list', { name: 'Valores: Mapa' })
    expect(within(list).getByText('Norte: 83.3%')).toBeInTheDocument()
    expect(within(list).getByText('Sul: 88.2%')).toBeInTheDocument()
  })
})

describe('defaultColorFor', () => {
  it('maps value bands to colors', () => {
    expect(defaultColorFor(90)).toBe('#10b981')
    expect(defaultColorFor(80)).toBe('#f59e0b')
    expect(defaultColorFor(50)).toBe('#ef4444')
  })
})
