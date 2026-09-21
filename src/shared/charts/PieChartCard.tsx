import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { formatNumber, formatPercentage } from '@/shared/lib/formatters'
import { CHART_CARD_CLASS, CHART_COLORS, TOOLTIP_STYLE } from './chartTheme'
import { toPercentages } from './percent'
import type { ChartDatum } from './types'

interface PieChartCardProps {
  title: string
  data: ChartDatum[]
  footnote?: string
}

export function PieChartCard({ title, data, footnote }: PieChartCardProps) {
  const color = (i: number) => CHART_COLORS[i % CHART_COLORS.length]
  return (
    <section className={CHART_CARD_CLASS}>
      <h3 className="mb-2 text-base font-semibold">{title}</h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="label" innerRadius={40} outerRadius={80}>
              {data.map((d, i) => (
                <Cell key={d.label} fill={color(i)} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              formatter={(value) => formatNumber(Number(value))}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul
        aria-label={`Legenda de ${title}`}
        className="mt-2 grid grid-cols-1 gap-1 text-xs sm:grid-cols-2"
      >
        {toPercentages(data).map((d, i) => (
          <li key={d.label} className="flex items-center gap-2">
            <span
              aria-hidden
              className="size-3 shrink-0 rounded-full"
              style={{ backgroundColor: color(i) }}
            />
            {`${d.label}: ${formatPercentage(d.percent, 1)}`}
          </li>
        ))}
      </ul>
      {footnote && <p className="mt-2 text-center text-xs italic text-slate-500">{footnote}</p>}
    </section>
  )
}
