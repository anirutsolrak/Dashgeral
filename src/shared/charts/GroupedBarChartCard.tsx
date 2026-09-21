import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatNumber } from '@/shared/lib/formatters'
import { AXIS_TICK, CHART_CARD_CLASS, GRID_STROKE, TOOLTIP_STYLE } from './chartTheme'

export interface GroupedSeries {
  key: string
  label: string
  color: string
}

export interface GroupedDatum {
  label: string
  [seriesKey: string]: string | number
}

interface GroupedBarChartCardProps {
  title?: string
  series: GroupedSeries[]
  data: GroupedDatum[]
  height?: number
}

const describe = (series: GroupedSeries[], data: GroupedDatum[]): string =>
  data
    .map((row) => {
      const values = series.map((s) => `${s.label} ${formatNumber(Number(row[s.key] ?? 0))}`)
      return `${row.label}: ${values.join(', ')}`
    })
    .join('; ')

export function GroupedBarChartCard({ title, series, data, height = 280 }: GroupedBarChartCardProps) {
  return (
    <section className={CHART_CARD_CLASS}>
      {title && <h3 className="mb-2 text-base font-semibold">{title}</h3>}
      <div role="img" aria-label={describe(series, data)} style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={AXIS_TICK} />
            <YAxis tick={AXIS_TICK} tickFormatter={(v) => formatNumber(Number(v))} />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => formatNumber(Number(value))} />
            <Legend />
            {series.map((s) => (
              <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
