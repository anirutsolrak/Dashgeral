import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { buildLogistics } from '@/data/mock/logistics'
import { DEFAULT_FILTERS } from '@/data/types/filters'
import { formatNumber, formatPercentage } from '@/shared/lib/formatters'
import { renderWithProviders } from '@/test/renderWithProviders'
import { LogisticsPage } from './LogisticsPage'

const url = '/?delay=0'

describe('LogisticsPage', () => {
  beforeEach(() => window.history.replaceState({}, '', url))

  it('renders the heading, filters, KPIs, charts and table', async () => {
    renderWithProviders(<LogisticsPage />, { url })
    expect(screen.getByRole('heading', { level: 1, name: 'Logística' })).toBeInTheDocument()
    expect(await screen.findByLabelText('Tipo')).toBeInTheDocument()
    expect(await screen.findAllByRole('article')).toHaveLength(4)
    expect(
      await screen.findByRole('heading', { name: 'Evolução de pendências logísticas' }),
    ).toBeInTheDocument()
    expect(await screen.findByRole('table', { name: 'Objetos por status' })).toBeInTheDocument()
  })

  it('opens the details of a KPI in a dialog and closes it with Escape', async () => {
    renderWithProviders(<LogisticsPage />, { url })
    await userEvent.click(await screen.findByRole('button', { name: /^Custódia/ }))
    const dialog = await screen.findByRole('dialog', { name: 'Custódia - Detalhamento' })
    expect(
      await within(dialog).findByRole('table', { name: 'Etapas de Custódia' }),
    ).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('applies the type filter to the KPI counts', async () => {
    renderWithProviders(<LogisticsPage />, { url })
    const all = buildLogistics(DEFAULT_FILTERS).groups[0]!.count
    const flash = buildLogistics({ ...DEFAULT_FILTERS, logisticsType: 'flash' }).groups[0]!.count
    expect(await screen.findByText(`${formatNumber(all)} objetos`)).toBeInTheDocument()
    await userEvent.selectOptions(await screen.findByLabelText('Tipo'), 'flash')
    expect(await screen.findByText(`${formatNumber(flash)} objetos`)).toBeInTheDocument()
  })

  it('applies the step filter to the KPIs', async () => {
    renderWithProviders(<LogisticsPage />, { url })
    await waitFor(() => expect(screen.getByLabelText('Etapa')).toBeEnabled())
    await userEvent.selectOptions(screen.getByLabelText('Etapa'), 'custodia-devolvido')
    const kpi = await screen.findByRole('button', { name: /^Custódia/ })
    await waitFor(() => expect(kpi).toHaveTextContent(formatPercentage(100, 1)))
  })

  it('shows error alerts when the repository fails', async () => {
    window.history.replaceState({}, '', '/?delay=0&error=1')
    renderWithProviders(<LogisticsPage />, { url: '/?delay=0&error=1' })
    expect((await screen.findAllByRole('alert')).length).toBeGreaterThan(0)
  })
})
