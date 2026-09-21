import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ACCENT_HEX, CHART_CARD_CLASS, describeData } from './chartTheme'
import type { ChartDatum } from './types'

interface LineChartCardProps {
  title: string
  data: ChartDatum[]
  suffix?: string
  color?: string
  height?: number
}

export function LineChartCard({ title, data, suffix = '', color = ACCENT_HEX.purple, height = 260 }: LineChartCardProps) {
  return (
    <section className={CHART_CARD_CLASS}>
      <h3 className="mb-2 text-base font-semibold">{title}</h3>
      <div role="img" aria-label={`${title}. ${describeData(data, suffix)}`} style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" />
            <YAxis tickFormatter={(v) => `${v}${suffix}`} />
            <Tooltip formatter={(value) => `${value}${suffix}`} />
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
