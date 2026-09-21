import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AreaChartCard } from './AreaChartCard'
import { ComposedChartCard } from './ComposedChartCard'
import { RadarChartCard } from './RadarChartCard'

afterEach(() => vi.restoreAllMocks())

const series = [
  { key: 'a', label: 'Canal A', color: '#3b82f6' },
  { key: 'b', label: 'Canal B', color: '#10b981' },
]
const data = [
  { label: 'Jan', a: 1500, b: 300 },
  { label: 'Fev', a: 3000, b: 400 },
]

describe.each([
  ['AreaChartCard', () => <AreaChartCard title="Volume" series={series} data={data} />],
  ['ComposedChartCard', () => <ComposedChartCard title="Volume" barSeries={[series[0]!]} lineSeries={[series[1]!]} data={data} />],
  ['RadarChartCard', () => <RadarChartCard title="Volume" series={series} data={data} />],
])('%s', (_name, ui) => {
  it('renders a titled svg with an accessible summary and clean console', () => {
    const error = vi.spyOn(console, 'error')
    const warn = vi.spyOn(console, 'warn')
    const { container } = render(ui())
    expect(screen.getByRole('heading', { name: 'Volume' })).toBeInTheDocument()
    expect(container.querySelector('svg.recharts-surface')).not.toBeNull()
    expect(screen.getByRole('img')).toHaveAccessibleName(/Jan: /)
    expect(screen.getByRole('img')).toHaveAccessibleName(/Fev: /)
    expect(error).not.toHaveBeenCalled()
    expect(warn).not.toHaveBeenCalled()
  })

  it('renders legend labels in the theme text colour', () => {
    const { container } = render(ui())
    const labels = Array.from(container.querySelectorAll<HTMLElement>('.recharts-legend-item-text'))
    expect(labels.length).toBeGreaterThan(0)
    for (const label of labels) expect(label.getAttribute('style')).toContain('var(--chart-text)')
  })
})

describe('AreaChartCard', () => {
  it('stacks series by default and can be unstacked', () => {
    const stacked = render(<AreaChartCard series={series} data={data} />).container
    expect(stacked.querySelectorAll('.recharts-area')).toHaveLength(2)
    const plain = render(<AreaChartCard series={series} data={data} stacked={false} />).container
    expect(plain.querySelectorAll('.recharts-area')).toHaveLength(2)
  })
})
