import { screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { buildLogistics } from '@/data/mock/logistics'
import { DEFAULT_FILTERS } from '@/data/types/filters'
import { formatNumber, formatPercentage } from '@/shared/lib/formatters'
import { renderWithProviders } from '@/test/renderWithProviders'
import { LogisticsDetails } from './LogisticsDetails'

const custody = buildLogistics(DEFAULT_FILTERS).groups[2]!
const url = '/?delay=0'

describe('LogisticsDetails', () => {
  beforeEach(() => window.history.replaceState({}, '', url))

  it('shows the totals, the distribution and the steps of the group', async () => {
    renderWithProviders(<LogisticsDetails kpi="custodia" />, { url })
    const table = await screen.findByRole('table', { name: 'Etapas de Custódia' })
    expect(within(table).getAllByRole('row')).toHaveLength(custody.steps.length + 1)
    expect(within(table).getByText('Aguardando telemarketing')).toBeInTheDocument()
    expect(screen.getByText('Total de objetos')).toBeInTheDocument()
    expect(screen.getByText(formatNumber(custody.count))).toBeInTheDocument()
    expect(screen.getByText(formatPercentage(custody.percent, 1))).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Distribuição de Custódia' })).toBeInTheDocument()
  })

  it('shows the error state', async () => {
    window.history.replaceState({}, '', '/?delay=0&error=1')
    renderWithProviders(<LogisticsDetails kpi="pendente" />, { url: '/?delay=0&error=1' })
    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })
})
