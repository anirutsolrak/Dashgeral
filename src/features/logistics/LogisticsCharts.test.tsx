import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/renderWithProviders'
import { LogisticsCharts } from './LogisticsCharts'

const url = '/?delay=0'

describe('LogisticsCharts', () => {
  beforeEach(() => window.history.replaceState({}, '', url))

  it('renders the trend, the distribution and the type comparison', async () => {
    renderWithProviders(<LogisticsCharts />, { url })
    expect(await screen.findByRole('heading', { name: 'Evolução de pendências logísticas' })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Distribuição por status' })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Flash vs. Terceiros por status' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /Entregue: Flash .*Terceiros/ })).toBeInTheDocument()
  })

  it('shows one error alert per failing chart', async () => {
    window.history.replaceState({}, '', '/?delay=0&error=1')
    renderWithProviders(<LogisticsCharts />, { url: '/?delay=0&error=1' })
    expect(await screen.findAllByRole('alert')).toHaveLength(3)
  })
})
