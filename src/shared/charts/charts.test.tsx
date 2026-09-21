import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { BarChartCard } from './BarChartCard'
import { LineChartCard } from './LineChartCard'
import { PieChartCard } from './PieChartCard'

afterEach(() => vi.restoreAllMocks())

describe('PieChartCard', () => {
  it('renders the title, an svg and a legend with percentages', () => {
    const error = vi.spyOn(console, 'error')
    const warn = vi.spyOn(console, 'warn')
    const { container } = render(
      <PieChartCard
        title="Distribuição"
        footnote="* nota"
        data={[
          { label: 'A', value: 1 },
          { label: 'B', value: 3 },
        ]}
      />,
    )
    expect(screen.getByRole('heading', { name: 'Distribuição' })).toBeInTheDocument()
    expect(container.querySelector('svg')).not.toBeNull()
    const legend = screen.getByRole('list', { name: 'Legenda de Distribuição' })
    expect(legend).toHaveTextContent('A: 25,0%')
    expect(legend).toHaveTextContent('B: 75,0%')
    expect(screen.getByText('* nota')).toBeInTheDocument()
    expect(error).not.toHaveBeenCalled()
    expect(warn).not.toHaveBeenCalled()
  })
})

describe('BarChartCard', () => {
  it('renders an svg and an accessible summary of the values', () => {
    const { container } = render(
      <BarChartCard
        title="Digitadas x Não digitadas"
        data={[
          { label: 'Digitadas', value: 800 },
          { label: 'Não digitadas', value: 200, color: '#ec4899' },
        ]}
      />,
    )
    expect(screen.getByRole('heading', { name: 'Digitadas x Não digitadas' })).toBeInTheDocument()
    expect(container.querySelector('svg')).not.toBeNull()
    expect(screen.getByRole('img')).toHaveAccessibleName(/Digitadas: 800/)
  })
})

describe('LineChartCard', () => {
  it('renders the title and an svg', () => {
    const { container } = render(
      <LineChartCard
        title="Tendência"
        suffix="%"
        data={[
          { label: 'Jan', value: 75 },
          { label: 'Fev', value: 80 },
        ]}
      />,
    )
    expect(screen.getByRole('heading', { name: 'Tendência' })).toBeInTheDocument()
    expect(container.querySelector('svg')).not.toBeNull()
    expect(screen.getByRole('img')).toHaveAccessibleName(/Jan: 75/)
  })
})
