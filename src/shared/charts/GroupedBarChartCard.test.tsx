import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { GroupedBarChartCard } from './GroupedBarChartCard'

afterEach(() => vi.restoreAllMocks())

const series = [
  { key: 'unlocked', label: 'Desbloqueados', color: '#10b981' },
  { key: 'locked', label: 'Bloqueados', color: '#ef4444' },
]
const data = [
  { label: 'Norte', unlocked: 1500, locked: 300 },
  { label: 'Sul', unlocked: 3000, locked: 400 },
]

describe('GroupedBarChartCard', () => {
  it('renders the title, an svg and an accessible summary of every series', () => {
    const error = vi.spyOn(console, 'error')
    const warn = vi.spyOn(console, 'warn')
    const { container } = render(<GroupedBarChartCard title="Por região" series={series} data={data} />)
    expect(screen.getByRole('heading', { name: 'Por região' })).toBeInTheDocument()
    expect(container.querySelector('svg')).not.toBeNull()
    const summary = screen.getByRole('img')
    expect(summary).toHaveAccessibleName(/Norte: Desbloqueados 1\.500, Bloqueados 300/)
    expect(summary).toHaveAccessibleName(/Sul: Desbloqueados 3\.000, Bloqueados 400/)
    expect(error).not.toHaveBeenCalled()
    expect(warn).not.toHaveBeenCalled()
  })

  it('works without a title', () => {
    render(<GroupedBarChartCard series={series} data={data} />)
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  it('renders legend labels for every series in the theme text colour, not the series colour', () => {
    const { container } = render(<GroupedBarChartCard series={series} data={data} />)
    const labels = Array.from(container.querySelectorAll<HTMLElement>('.recharts-legend-item-text'))
    expect(labels.map((l) => l.textContent).sort()).toEqual(['Bloqueados', 'Desbloqueados'])
    for (const label of labels) {
      expect(label.getAttribute('style')).toContain('var(--chart-text)')
    }
  })
})
