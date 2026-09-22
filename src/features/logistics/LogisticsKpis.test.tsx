import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildLogistics } from '@/data/mock/logistics'
import { DEFAULT_FILTERS } from '@/data/types/filters'
import { formatNumber, formatPercentage } from '@/shared/lib/formatters'
import { renderWithProviders } from '@/test/renderWithProviders'
import { LogisticsKpis } from './LogisticsKpis'

const overview = buildLogistics(DEFAULT_FILTERS)
const url = '/?delay=0'

describe('LogisticsKpis', () => {
  beforeEach(() => window.history.replaceState({}, '', url))

  it('shows the four status groups with percent and object count', async () => {
    renderWithProviders(<LogisticsKpis onSelect={vi.fn()} />, { url })
    const cards = await screen.findAllByRole('article')
    expect(cards).toHaveLength(4)
    const delivered = overview.groups[0]!
    expect(within(cards[0]!).getByText('Entregues')).toBeInTheDocument()
    expect(within(cards[0]!).getByText(formatPercentage(delivered.percent, 1))).toBeInTheDocument()
    expect(
      within(cards[0]!).getByText(`${formatNumber(delivered.count)} objetos`),
    ).toBeInTheDocument()
    expect(within(cards[1]!).getByText('Em Trânsito')).toBeInTheDocument()
    expect(within(cards[2]!).getByText('Custódia')).toBeInTheDocument()
    expect(within(cards[3]!).getByText('Em Processo de Devolução')).toBeInTheDocument()
  })

  it('reports which KPI was selected', async () => {
    const onSelect = vi.fn()
    renderWithProviders(<LogisticsKpis onSelect={onSelect} />, { url })
    await screen.findAllByRole('article')
    await userEvent.click(screen.getByRole('button', { name: /^Custódia/ }))
    expect(onSelect).toHaveBeenCalledWith('custodia')
    await userEvent.click(screen.getByRole('button', { name: /^Em Trânsito/ }))
    expect(onSelect).toHaveBeenCalledWith('pendente')
  })

  it('shows the error state', async () => {
    window.history.replaceState({}, '', '/?delay=0&error=1')
    renderWithProviders(<LogisticsKpis onSelect={vi.fn()} />, { url: '/?delay=0&error=1' })
    expect(await screen.findByRole('alert')).toHaveTextContent('Falha simulada')
  })
})
