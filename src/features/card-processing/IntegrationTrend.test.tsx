import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/renderWithProviders'
import { IntegrationTrend } from './IntegrationTrend'

describe('IntegrationTrend', () => {
  beforeEach(() => window.history.replaceState({}, '', '/?delay=0'))

  it('renders a titled line chart with one point per month', async () => {
    renderWithProviders(<IntegrationTrend />, { url: '/?delay=0' })
    expect(
      await screen.findByRole('heading', { name: 'Taxa de Integração ao longo do tempo' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('img')).toHaveAccessibleName(/Jan: .*%.*Dez: /)
  })

  it('follows the period filter', async () => {
    renderWithProviders(<IntegrationTrend />, { url: '/?delay=0&period=7d' })
    await screen.findByRole('heading', { name: 'Taxa de Integração ao longo do tempo' })
    expect(screen.getByRole('img')).toHaveAccessibleName(/Seg: .*Dom: /)
  })
})
