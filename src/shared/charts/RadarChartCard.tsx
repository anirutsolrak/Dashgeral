import {
  Legend, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip,
} from 'recharts'
import { formatNumber } from '@/shared/lib/formatters'
import {
  AXIS_TICK, CHART_CARD_CLASS, GRID_STROKE, LEGEND_LABEL_STYLE, TOOLTIP_STYLE, describeSeries,
} from './chartTheme'
import type { GroupedDatum, GroupedSeries } from './GroupedBarChartCard'

interface RadarChartCardProps {
  title?: string
  series: GroupedSeries[]
  data: GroupedDatum[]
  height?: number
}

export function RadarChartCard({ title, series, data, height = 300 }: RadarChartCardProps) {
  return (
    <section className={CHART_CARD_CLASS}>
      {title && <h3 className="mb-2 text-base font-semibold">{title}</h3>}
      <div role="img" aria-label={describeSeries(series, data)} style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid stroke={GRID_STROKE} />
            <PolarAngleAxis dataKey="label" tick={AXIS_TICK} />
            <PolarRadiusAxis tick={AXIS_TICK} />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => formatNumber(Number(value))} />
            <Legend labelStyle={LEGEND_LABEL_STYLE} />
            {series.map((s) => (
              <Radar key={s.key} dataKey={s.key} name={s.label} stroke={s.color} fill={s.color} fillOpacity={0.25} />
            ))}
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
