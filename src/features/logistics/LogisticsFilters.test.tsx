import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/renderWithProviders'
import { LogisticsFilters } from './LogisticsFilters'

const url = '/?delay=0'

describe('LogisticsFilters', () => {
  beforeEach(() => window.history.replaceState({}, '', url))

  it('lists the types and the steps grouped by status', async () => {
    renderWithProviders(<LogisticsFilters />, { url })
    expect(await screen.findByRole('option', { name: 'Flash' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Terceiros' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Custódia' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Sinistrado pelo terceiro' })).toBeInTheDocument()
  })

  it('reflects the selection made by the user', async () => {
    renderWithProviders(<LogisticsFilters />, { url })
    await screen.findByRole('option', { name: 'Flash' })
    const type = screen.getByLabelText('Tipo')
    await userEvent.selectOptions(type, 'flash')
    expect(type).toHaveValue('flash')
    const step = screen.getByLabelText('Etapa')
    await userEvent.selectOptions(step, 'custodia-devolvido')
    expect(step).toHaveValue('custodia-devolvido')
  })

  it('reads the initial selection from the URL', async () => {
    renderWithProviders(<LogisticsFilters />, { url: '/?delay=0&logisticsType=terceiros' })
    await screen.findByRole('option', { name: 'Terceiros' })
    expect(screen.getByLabelText('Tipo')).toHaveValue('terceiros')
  })

  it('shows a message when the catalog fails', async () => {
    window.history.replaceState({}, '', '/?delay=0&error=1')
    renderWithProviders(<LogisticsFilters />, { url: '/?delay=0&error=1' })
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Filtros de logística indisponíveis',
    )
  })
})
