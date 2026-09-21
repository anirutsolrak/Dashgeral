import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/renderWithProviders'

interface StubProps {
  title: string
  description: string
  option: { series: { type: string }[]; textStyle: { color: string } }
}

vi.mock('@/shared/echarts/EChart', () => ({
  EChart: ({ title, description, option }: StubProps) => (
    <figure aria-label={title} data-type={option.series[0]!.type} data-text={option.textStyle.color}>
      {description}
    </figure>
  ),
}))

import { EchartsPage } from './EchartsPage'

const url = '/gallery/echarts?delay=0'

describe('EchartsPage', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', url)
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('renders the five examples, each with its series type and a text alternative', async () => {
    renderWithProviders(<EchartsPage />, { url })
    expect(screen.getByRole('heading', { level: 1, name: 'Apache ECharts' })).toBeInTheDocument()
    const titles = (await screen.findAllByRole('heading', { level: 2 })).map((h) => h.textContent)
    expect(titles).toEqual(['Mapa de calor', 'Funil', 'Gauge', 'Treemap', 'Sankey'])
    const types = screen.getAllByRole('figure').map((f) => f.getAttribute('data-type'))
    expect(types).toEqual(['heatmap', 'funnel', 'gauge', 'treemap', 'sankey'])
    expect(screen.getByRole('figure', { name: 'SLA de entrega' })).toHaveTextContent(/SLA de entrega \(%\): \d+ de 100/)
  })

  it('uses the light palette by default', async () => {
    renderWithProviders(<EchartsPage />, { url })
    const figures = await screen.findAllByRole('figure')
    expect(figures.every((f) => f.getAttribute('data-text') === '#64748b')).toBe(true)
  })

  it('shows an error alert when the repository fails', async () => {
    window.history.replaceState({}, '', '/gallery/echarts?delay=0&error=1')
    renderWithProviders(<EchartsPage />, { url: '/gallery/echarts?delay=0&error=1' })
    expect(await screen.findByRole('alert')).toHaveTextContent('Falha simulada')
  })
})
