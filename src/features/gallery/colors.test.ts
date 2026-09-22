import { describe, expect, it } from 'vitest'
import { CHART_COLORS } from '@/shared/charts/chartTheme'
import { withColors } from './colors'

describe('withColors', () => {
  it('assigns the chart palette in order and wraps around', () => {
    const series = Array.from({ length: 10 }, (_, i) => ({ key: `k${i}`, label: `L${i}` }))
    const colored = withColors(series)
    expect(colored[0]).toEqual({ key: 'k0', label: 'L0', color: CHART_COLORS[0] })
    expect(colored[CHART_COLORS.length]!.color).toBe(CHART_COLORS[0])
  })
})
