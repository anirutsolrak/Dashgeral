import { describe, expect, it } from 'vitest'
import { chartPalette, themeBase } from './palette'

describe('chartPalette', () => {
  it('mirrors the css chart variables for each theme', () => {
    expect(chartPalette('light')).toMatchObject({
      text: '#64748b',
      grid: '#e2e8f0',
      tooltipBg: '#ffffff',
    })
    expect(chartPalette('dark')).toMatchObject({
      text: '#94a3b8',
      grid: '#334155',
      tooltipBg: '#1e293b',
    })
  })
  it('exposes literal hex series colours (ECharts cannot resolve CSS vars)', () => {
    expect(chartPalette('light').series).toHaveLength(5)
    expect(chartPalette('light').series[0]).toBe('#2a78d6')
    expect(chartPalette('dark').series[0]).toBe('#3987e5')
  })
})

describe('themeBase', () => {
  it('sets a transparent background, the text colour and accessible aria', () => {
    const base = themeBase(chartPalette('dark')) as Record<string, unknown>
    expect(base.backgroundColor).toBe('transparent')
    expect(base.textStyle).toEqual({ color: '#94a3b8' })
    expect(base.aria).toEqual({ enabled: true })
  })
})
