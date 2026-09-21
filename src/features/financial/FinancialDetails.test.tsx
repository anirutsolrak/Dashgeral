import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { buildFinancialOverview } from '@/data/mock/financial'
import { DEFAULT_FILTERS } from '@/data/types/filters'
import { formatCurrency, formatNumber } from '@/shared/lib/formatters'
import { renderWithProviders } from '@/test/renderWithProviders'
import { FinancialDetails } from './FinancialDetails'

const norm = (text: string) => text.replace(/\u00a0/g, ' ')
const o = buildFinancialOverview(DEFAULT_FILTERS)
const url = '/?delay=0'
const heading = (name: string) => screen.findByRole('heading', { name })

describe('FinancialDetails', () => {
  beforeEach(() => window.history.replaceState({}, '', url))

  it('usage: pie of the credit limit distribution and the limit summary', async () => {
    renderWithProviders(<FinancialDetails kpi="usage" />, { url })
    expect(await heading('Distribuição do Limite de Crédito')).toBeInTheDocument()
    expect(screen.getByText('Limite utilizado')).toBeInTheDocument()
    expect(screen.getByText(norm(formatCurrency(o.limitUsage.usedAmount)))).toBeInTheDocument()
    const available = o.limitUsage.totalAmount - o.limitUsage.usedAmount
    expect(screen.getByText(norm(formatCurrency(available)))).toBeInTheDocument()
    expect(screen.getByText('Limite total')).toBeInTheDocument()
  })

  it('total: bar of customers per range', async () => {
    renderWithProviders(<FinancialDetails kpi="total" />, { url })
    expect(await heading('Clientes por faixa de utilização')).toBeInTheDocument()
    const first = o.usageByRange[0]!
    expect(screen.getByRole('img', { name: new RegExp(`${first.range}: ${formatNumber(first.customers)}`) })).toBeInTheDocument()
  })

  it('average: grouped bars of average and available usage', async () => {
    renderWithProviders(<FinancialDetails kpi="average" />, { url })
    expect(await heading('Uso médio por faixa')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /Uso médio .*Disponível médio/ })).toBeInTheDocument()
  })

  it('logistics: cost composition and a sortable costs-by-status table', async () => {
    renderWithProviders(<FinancialDetails kpi="logistics" />, { url })
    expect(await heading('Composição do custo por cartão')).toBeInTheDocument()
    const table = await screen.findByRole('table', { name: 'Custos por status' })
    expect(within(table).getAllByRole('columnheader')).toHaveLength(6)
    expect(within(table).getAllByRole('row')).toHaveLength(1 + o.logistics.byStatus.length)
    expect(within(table).getByText('Entregue')).toBeInTheDocument()
    const biggest = [...o.logistics.byStatus].sort((a, b) => b.count - a.count)[0]!
    await userEvent.click(within(table).getByRole('button', { name: /Cartões/ }))
    await userEvent.click(within(table).getByRole('button', { name: /Cartões/ }))
    const firstRow = within(table).getAllByRole('row')[1]!
    expect(within(firstRow).getByText(biggest.status)).toBeInTheDocument()
  })

  it('shows the error state', async () => {
    window.history.replaceState({}, '', '/?delay=0&error=1')
    renderWithProviders(<FinancialDetails kpi="usage" />, { url: '/?delay=0&error=1' })
    expect(await screen.findByRole('alert')).toHaveTextContent('Falha simulada')
  })
})
