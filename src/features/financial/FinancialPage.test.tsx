import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/renderWithProviders'
import { FinancialPage } from './FinancialPage'

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TileLayer: () => null,
  CircleMarker: ({ children }: { children: ReactNode }) => (
    <div data-testid="marker">{children}</div>
  ),
  Popup: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

const url = '/?delay=0'

describe('FinancialPage', () => {
  beforeEach(() => window.history.replaceState({}, '', url))

  it('renders the heading, filters, KPIs, regional section and evolution', async () => {
    renderWithProviders(<FinancialPage />, { url })
    expect(
      screen.getByRole('heading', { level: 1, name: 'Desempenho Financeiro' }),
    ).toBeInTheDocument()
    expect(await screen.findAllByRole('article')).toHaveLength(4)
    expect(await screen.findByLabelText('Categoria')).toBeInTheDocument()
    expect(await screen.findAllByTestId('marker')).toHaveLength(5)
    expect(
      await screen.findByRole('heading', { name: 'Evolução da Utilização Média (em R$ mil)' }),
    ).toBeInTheDocument()
  })

  it('opens the details of a KPI in a dialog and closes it with Escape', async () => {
    renderWithProviders(<FinancialPage />, { url })
    await userEvent.click(await screen.findByRole('button', { name: /^Custos Logísticos/ }))
    const dialog = await screen.findByRole('dialog', { name: 'Detalhamento - Custos Logísticos' })
    expect(
      await within(dialog).findByRole('table', { name: 'Custos por status' }),
    ).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows error alerts when the repository fails', async () => {
    window.history.replaceState({}, '', '/?delay=0&error=1')
    renderWithProviders(<FinancialPage />, { url: '/?delay=0&error=1' })
    expect((await screen.findAllByRole('alert')).length).toBeGreaterThan(0)
  })
})
