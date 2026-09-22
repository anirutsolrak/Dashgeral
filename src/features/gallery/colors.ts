import type { SeriesInfo } from '@/data/types/gallery'
import { CHART_COLORS } from '@/shared/charts/chartTheme'

export const withColors = (series: SeriesInfo[]) =>
  series.map((s, i) => ({ ...s, color: CHART_COLORS[i % CHART_COLORS.length] ?? CHART_COLORS[0] }))
