import { describe, expect, it } from 'vitest'
import {
  describeFunnel,
  describeGauge,
  describeHeatmap,
  describeSankey,
  describeTreemap,
} from './descriptions'

describe('ECharts text alternatives', () => {
  it('summarises the heatmap by its peak and its quietest slot', () => {
    const text = describeHeatmap({
      days: ['Seg', 'Ter'],
      hours: ['08h', '09h'],
      cells: [
        [0, 0, 5],
        [1, 0, 50],
        [0, 1, 7],
        [1, 1, 20],
      ],
    })
    expect(text).toBe('Maior volume: Seg às 09h (50). Menor volume: Seg às 08h (5).')
  })
  it('lists funnel stages, the gauge value, treemap groups and sankey links', () => {
    expect(
      describeFunnel([
        { label: 'A', value: 1000 },
        { label: 'B', value: 800 },
      ]),
    ).toBe('A: 1.000; B: 800')
    expect(describeGauge({ label: 'SLA', value: 94, max: 100 })).toBe('SLA: 94 de 100')
    expect(
      describeTreemap([
        {
          name: 'X',
          children: [
            { name: 'a', value: 10 },
            { name: 'b', value: 5 },
          ],
        },
      ]),
    ).toBe('X: 15')
    expect(
      describeSankey({
        nodes: [{ name: 'P' }, { name: 'Q' }],
        links: [{ source: 'P', target: 'Q', value: 3 }],
      }),
    ).toBe('P para Q: 3')
  })
})
