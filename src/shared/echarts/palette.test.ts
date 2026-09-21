import { describe, expect, it } from 'vitest'
import { chartPalette, themeBase } from './palette'

describe('chartPalette', () => {
  it('mirrors the css chart variables for each theme', () => {
    expect(chartPalette('light')).toMatchObject({ text: '#64748b', grid: '#e2e8f0', tooltipBg: '#ffffff' })
    expect(chartPalette('dark')).toMatchObject({ text: '#94a3b8', grid: '#334155', tooltipBg: '#1e293b' })
  })
  it('exposes the same series colours as the Recharts wrappers', () => {
    expect(chartPalette('light').series).toHaveLength(8)
    expect(chartPalette('light').series[0]).toBe('#3b82f6')
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
