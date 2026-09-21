import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatNumber } from '@/shared/lib/formatters'
import {
  AXIS_TICK, CHART_CARD_CLASS, GRID_STROKE, LEGEND_LABEL_STYLE, TOOLTIP_STYLE, describeSeries,
} from './chartTheme'
import type { GroupedDatum, GroupedSeries } from './GroupedBarChartCard'

interface AreaChartCardProps {
  title?: string
  series: GroupedSeries[]
  data: GroupedDatum[]
  stacked?: boolean
  height?: number
}

export function AreaChartCard({ title, series, data, stacked = true, height = 280 }: AreaChartCardProps) {
  return (
    <section className={CHART_CARD_CLASS}>
      {title && <h3 className="mb-2 text-base font-semibold">{title}</h3>}
      <div role="img" aria-label={describeSeries(series, data)} style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={AXIS_TICK} />
            <YAxis tick={AXIS_TICK} tickFormatter={(v) => formatNumber(Number(v))} />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => formatNumber(Number(value))} />
            <Legend labelStyle={LEGEND_LABEL_STYLE} />
            {series.map((s) => (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                fill={s.color}
                fillOpacity={0.35}
                stackId={stacked ? 'stack' : undefined}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
