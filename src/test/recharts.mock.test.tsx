import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import {
  Area, AreaChart, Bar, ComposedChart, Line, LineChart, PolarAngleAxis, PolarGrid, Radar,
  RadarChart, ResponsiveContainer, XAxis,
} from 'recharts'
import { describe, expect, it } from 'vitest'

const data = [{ name: 'A', a: 1, b: 2 }, { name: 'B', a: 3, b: 1 }]

const charts: [string, ReactElement][] = [
  ['LineChart', <LineChart data={data}><XAxis dataKey="name" /><Line dataKey="a" /></LineChart>],
  ['AreaChart', <AreaChart data={data}><Area dataKey="a" stackId="1" /><Area dataKey="b" stackId="1" /></AreaChart>],
  ['ComposedChart', <ComposedChart data={data}><Bar dataKey="a" /><Line dataKey="b" /></ComposedChart>],
  ['RadarChart', <RadarChart data={data}><PolarGrid /><PolarAngleAxis dataKey="name" /><Radar dataKey="a" /></RadarChart>],
]

describe('mock global do ResponsiveContainer', () => {
  it.each(charts)('deixa o %s renderizar um svg com as dimensões do mock', (_name, chart) => {
    const { container } = render(<ResponsiveContainer width="100%" height="100%">{chart}</ResponsiveContainer>)
    const svg = container.querySelector('svg.recharts-surface')
    expect(svg).not.toBeNull()
    expect(svg).toHaveAttribute('width', '400')
    expect(svg).toHaveAttribute('height', '300')
  })
})
