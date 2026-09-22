import type { ReasonCount } from '@/data/types/card-processing'
import type { ChartDatum } from '@/shared/charts/types'

export const toChartData = (items: ReasonCount[]): ChartDatum[] =>
  items.map((i) => ({ label: i.reason, value: i.count }))
