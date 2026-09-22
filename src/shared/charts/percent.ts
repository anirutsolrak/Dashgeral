import type { ChartDatum } from './types'

export function toPercentages(items: readonly ChartDatum[]): (ChartDatum & { percent: number })[] {
  const total = items.reduce((sum, item) => sum + item.value, 0)
  return items.map((item) => ({ ...item, percent: total === 0 ? 0 : (item.value / total) * 100 }))
}
