import { FunnelChart, GaugeChart, HeatmapChart, SankeyChart, TreemapChart } from 'echarts/charts'
import {
  AriaComponent,
  LegendComponent,
  GridComponent,
  TooltipComponent,
  VisualMapComponent,
} from 'echarts/components'
import * as echarts from 'echarts/core'
import type { EChartsCoreOption } from 'echarts/core'
import { SVGRenderer } from 'echarts/renderers'

// Registro manual: só o que a Galeria usa entra no chunk. Nunca importe de 'echarts' (bundle inteiro).
echarts.use([
  FunnelChart,
  GaugeChart,
  HeatmapChart,
  SankeyChart,
  TreemapChart,
  AriaComponent,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  VisualMapComponent,
  SVGRenderer,
])

export { echarts }
export type EChartsOption = EChartsCoreOption
