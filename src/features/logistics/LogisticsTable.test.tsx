import { screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { buildLogistics } from '@/data/mock/logistics'
import { DEFAULT_FILTERS } from '@/data/types/filters'
import { formatNumber } from '@/shared/lib/formatters'
import { renderWithProviders } from '@/test/renderWithProviders'
import { LogisticsTable } from './LogisticsTable'

const url = '/?delay=0'

describe('LogisticsTable', () => {
  beforeEach(() => window.history.replaceState({}, '', url))

  it('lists every status group with its quantity', async () => {
    renderWithProviders(<LogisticsTable />, { url })
    const table = await screen.findByRole('table', { name: 'Objetos por status' })
    expect(within(table).getAllByRole('row')).toHaveLength(7)
    const delivered = buildLogistics(DEFAULT_FILTERS).groups[0]!
    expect(within(table).getByText(formatNumber(delivered.count))).toBeInTheDocument()
    expect(within(table).getByText('Sinistrado')).toBeInTheDocument()
  })
})
