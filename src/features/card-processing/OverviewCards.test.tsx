import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildOverview } from '@/data/mock/overview'
import { DEFAULT_FILTERS } from '@/data/types/filters'
import { formatNumber, formatPercentage } from '@/shared/lib/formatters'
import { renderWithProviders } from '@/test/renderWithProviders'
import { OverviewCards } from './OverviewCards'

describe('OverviewCards', () => {
  beforeEach(() => window.history.replaceState({}, '', '/?delay=0'))
  const o = buildOverview(DEFAULT_FILTERS)

  it('shows the four KPIs with their formatted values and summaries', async () => {
    renderWithProviders(<OverviewCards onDetails={vi.fn()} onWorkflow={vi.fn()} />, { url: '/?delay=0' })
    const cards = await screen.findAllByRole('article')
    expect(cards).toHaveLength(4)
    expect(within(cards[0]!).getByText('Taxa de Integração')).toBeInTheDocument()
    expect(within(cards[0]!).getByText(formatPercentage(o.integration.ratePercent))).toBeInTheDocument()
    expect(within(cards[0]!).getByText(formatNumber(o.integration.notDigitized))).toBeInTheDocument()
    expect(within(cards[1]!).getByText(formatPercentage(o.accounts.ratePercent))).toBeInTheDocument()
    expect(within(cards[2]!).getByText('Cartões Enviados')).toBeInTheDocument()
    expect(within(cards[3]!).getByText('Propostas com Seguro')).toBeInTheDocument()
  })

  it('reports details and workflow clicks with the right kpi and view', async () => {
    const onDetails = vi.fn()
    const onWorkflow = vi.fn()
    renderWithProviders(<OverviewCards onDetails={onDetails} onWorkflow={onWorkflow} />, { url: '/?delay=0' })
    await screen.findAllByRole('article')
    await userEvent.click(screen.getByRole('button', { name: /^Contas Criadas/ }))
    expect(onDetails).toHaveBeenCalledWith('accounts')
    await userEvent.click(screen.getByRole('button', { name: 'Organograma: Cartões Enviados' }))
    expect(onWorkflow).toHaveBeenCalledWith('cards', 'orgchart')
    await userEvent.click(screen.getByRole('button', { name: 'POPs: Propostas com Seguro' }))
    expect(onWorkflow).toHaveBeenCalledWith('insurance', 'docs')
  })

  it('shows the error state with a retry button', async () => {
    window.history.replaceState({}, '', '/?delay=0&error=1')
    renderWithProviders(<OverviewCards onDetails={vi.fn()} onWorkflow={vi.fn()} />, { url: '/?delay=0&error=1' })
    expect(await screen.findByRole('alert')).toHaveTextContent('Falha simulada')
  })
})
