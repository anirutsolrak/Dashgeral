import { render } from '@testing-library/react'
import { Line, LineChart, ResponsiveContainer } from 'recharts'
import { describe, expect, it, vi } from 'vitest'

// Restaura o ResponsiveContainer de verdade neste arquivo (o mock global vem de src/test/setup.ts).
vi.unmock('recharts')

describe('ResponsiveContainer real no jsdom', () => {
  it('monta o container, mas sem layout ele não dá dimensões ao gráfico', () => {
    const { container } = render(
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={[{ a: 1 }, { a: 2 }]}>
          <Line dataKey="a" />
        </LineChart>
      </ResponsiveContainer>,
    )
    expect(container.querySelector('.recharts-responsive-container')).not.toBeNull()
    expect(container.querySelector('svg[width="400"]')).toBeNull()
  })
})
