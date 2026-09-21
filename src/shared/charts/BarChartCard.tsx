import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatNumber } from '@/shared/lib/formatters'
import { CHART_CARD_CLASS, CHART_COLORS, describeData } from './chartTheme'
import type { ChartDatum } from './types'

interface BarChartCardProps {
  title?: string
  data: (ChartDatum & { color?: string })[]
  height?: number
}

export function BarChartCard({ title, data, height = 240 }: BarChartCardProps) {
  return (
    <section className={CHART_CARD_CLASS}>
      {title && <h3 className="mb-2 text-base font-semibold">{title}</h3>}
      <div role="img" aria-label={describeData(data)} style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" />
            <YAxis tickFormatter={(v) => formatNumber(Number(v))} />
            <Tooltip formatter={(value) => formatNumber(Number(value))} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((d, i) => (
                <Cell key={d.label} fill={d.color ?? CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
