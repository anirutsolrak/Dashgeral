import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const chart = vi.hoisted(() => ({ setOption: vi.fn(), resize: vi.fn(), dispose: vi.fn() }))
const init = vi.hoisted(() => vi.fn())

vi.mock('./core', () => ({ echarts: { init } }))

import { EChart } from './EChart'

describe('EChart', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    init.mockReturnValue(chart)
  })

  it('renders a titled figure with an accessible description', () => {
    render(<EChart title="Funil" description="Propostas: 100, Contas: 60" option={{}} />)
    expect(screen.getByRole('heading', { name: 'Funil' })).toBeInTheDocument()
    expect(screen.getByRole('img')).toHaveAccessibleName('Funil. Propostas: 100, Contas: 60')
  })

  it('initialises once with the SVG renderer and applies every new option', () => {
    const first = { series: [] }
    const second = { series: [{ type: 'funnel' }] }
    const { rerender } = render(<EChart title="T" description="d" option={first} />)
    expect(init).toHaveBeenCalledTimes(1)
    expect(init.mock.calls[0]![2]).toEqual({ renderer: 'svg' })
    expect(chart.setOption).toHaveBeenLastCalledWith(first, true)
    rerender(<EChart title="T" description="d" option={second} />)
    expect(init).toHaveBeenCalledTimes(1)
    expect(chart.setOption).toHaveBeenLastCalledWith(second, true)
  })

  it('disposes the chart on unmount', () => {
    const { unmount } = render(<EChart title="T" description="d" option={{}} />)
    unmount()
    expect(chart.dispose).toHaveBeenCalledTimes(1)
  })
})
