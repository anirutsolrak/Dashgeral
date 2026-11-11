import { screen, within } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/renderWithProviders'
import { ContactCenterPage } from './ContactCenterPage'

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TileLayer: () => null,
  CircleMarker: ({ children }: { children: ReactNode }) => (
    <div data-testid="marker">{children}</div>
  ),
  Popup: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

const url = '/?delay=0'

describe('ContactCenterPage', () => {
  beforeEach(() => window.history.replaceState({}, '', url))

  it('mostra os quatro KPIs, os gráficos, o mapa e o ranking de operadores', async () => {
    renderWithProviders(<ContactCenterPage />, { url })
    expect(
      screen.getByRole('heading', { level: 1, name: 'Central de Confirmação' }),
    ).toBeInTheDocument()
    const kpis = await screen.findAllByRole('article')
    expect(kpis).toHaveLength(4)
    expect(within(kpis[3]!).getByText(/^\d+:\d{2}$/)).toBeInTheDocument()
    expect(
      await screen.findByRole('heading', { name: 'Resultado das ligações' }),
    ).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Ligações por hora' })).toBeInTheDocument()
    expect(await screen.findAllByTestId('marker')).toHaveLength(5)
    const table = await screen.findByRole('table', { name: 'Desempenho por operador' })
    expect(within(table).getAllByRole('row')).toHaveLength(9)
  })

  it('com uma região filtrada, o mapa mostra só ela', async () => {
    const filtered = '/?delay=0&region=nordeste'
    window.history.replaceState({}, '', filtered)
    renderWithProviders(<ContactCenterPage />, { url: filtered })
    expect(await screen.findAllByTestId('marker')).toHaveLength(1)
  })

  it('mostra alerta quando o repositório falha', async () => {
    window.history.replaceState({}, '', '/?delay=0&error=1')
    renderWithProviders(<ContactCenterPage />, { url: '/?delay=0&error=1' })
    expect((await screen.findAllByRole('alert')).length).toBeGreaterThan(0)
  })
})
