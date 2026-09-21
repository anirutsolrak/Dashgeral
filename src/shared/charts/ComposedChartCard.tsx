import {
  Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { formatNumber } from '@/shared/lib/formatters'
import {
  AXIS_TICK, CHART_CARD_CLASS, GRID_STROKE, LEGEND_LABEL_STYLE, TOOLTIP_STYLE, describeSeries,
} from './chartTheme'
import type { GroupedDatum, GroupedSeries } from './GroupedBarChartCard'

interface ComposedChartCardProps {
  title?: string
  barSeries: GroupedSeries[]
  lineSeries: GroupedSeries[]
  data: GroupedDatum[]
  height?: number
}

export function ComposedChartCard({ title, barSeries, lineSeries, data, height = 280 }: ComposedChartCardProps) {
  return (
    <section className={CHART_CARD_CLASS}>
      {title && <h3 className="mb-2 text-base font-semibold">{title}</h3>}
      <div role="img" aria-label={describeSeries([...barSeries, ...lineSeries], data)} style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={AXIS_TICK} />
            <YAxis tick={AXIS_TICK} tickFormatter={(v) => formatNumber(Number(v))} />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => formatNumber(Number(value))} />
            <Legend labelStyle={LEGEND_LABEL_STYLE} />
            {barSeries.map((s) => (
              <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} radius={[4, 4, 0, 0]} />
            ))}
            {lineSeries.map((s) => (
              <Line key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color} strokeWidth={2} dot={false} />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
