import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildFinancialOverview } from '@/data/mock/financial'
import { DEFAULT_FILTERS } from '@/data/types/filters'
import { formatCurrency, formatNumber, formatPercentage } from '@/shared/lib/formatters'
import { renderWithProviders } from '@/test/renderWithProviders'
import { FinancialKpis } from './FinancialKpis'
import { FIN_KPI_META } from './kpis'

// Intl uses non-breaking space; Testing Library normalizes DOM text to regular space
const norm = (text: string) => text.replace(/\u00A0/g, ' ')
const o = buildFinancialOverview(DEFAULT_FILTERS)
const url = '/?delay=0'

describe('FinancialKpis', () => {
  beforeEach(() => window.history.replaceState({}, '', url))

  it('shows the four KPIs with formatted values and hints', async () => {
    renderWithProviders(<FinancialKpis onSelect={vi.fn()} />, { url })
    const cards = await screen.findAllByRole('article')
    expect(cards).toHaveLength(4)
    expect(within(cards[0]!).getByText(FIN_KPI_META.usage.title)).toBeInTheDocument()
    expect(
      within(cards[0]!).getByText(norm(formatPercentage(o.limitUsage.ratePercent))),
    ).toBeInTheDocument()
    expect(
      within(cards[0]!).getByText(norm(formatCurrency(o.limitUsage.usedAmount))),
    ).toBeInTheDocument()
    expect(within(cards[1]!).getByText(FIN_KPI_META.total.title)).toBeInTheDocument()
    const top = o.usageByRange.at(-1)!.customers
    expect(
      within(cards[1]!).getByText(`${formatNumber(top)} clientes acima de 75%`),
    ).toBeInTheDocument()
    expect(
      within(cards[2]!).getByText(norm(formatCurrency(o.limitUsage.averageUsage))),
    ).toBeInTheDocument()
    expect(within(cards[2]!).getByText('Por cliente')).toBeInTheDocument()
    expect(
      within(cards[3]!).getByText(norm(formatCurrency(o.logistics.totalAmount))),
    ).toBeInTheDocument()
    expect(
      within(cards[3]!).getByText(norm(`${formatCurrency(o.logistics.unitTotal)} por cartão`)),
    ).toBeInTheDocument()
  })

  it('reports which KPI was selected', async () => {
    const onSelect = vi.fn()
    renderWithProviders(<FinancialKpis onSelect={onSelect} />, { url })
    await screen.findAllByRole('article')
    const avgButton = screen.getByRole('button', {
      name: new RegExp(`^${FIN_KPI_META.average.title}`),
    })
    await userEvent.click(avgButton)
    expect(onSelect).toHaveBeenCalledWith('average')
    const logButton = screen.getByRole('button', {
      name: new RegExp(`^${FIN_KPI_META.logistics.title}`),
    })
    await userEvent.click(logButton)
    expect(onSelect).toHaveBeenCalledWith('logistics')
  })

  it('shows the error state', async () => {
    window.history.replaceState({}, '', '/?delay=0&error=1')
    renderWithProviders(<FinancialKpis onSelect={vi.fn()} />, { url: '/?delay=0&error=1' })
    expect(await screen.findByRole('alert')).toHaveTextContent('Falha simulada')
  })
})
