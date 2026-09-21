import { useMemo } from 'react'
import { useAppTheme } from '@/app/layout/ThemeContext'
import type { EchartsData } from '@/data/types/gallery'
import { EChart } from '@/shared/echarts/EChart'
import { chartPalette } from '@/shared/echarts/palette'
import { QueryBoundary } from '@/shared/ui/QueryBoundary'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useEchartsData } from '../api'
import { ExampleCard } from '../ExampleCard'
import { getLibrary } from '../libraries'
import { LibraryPage } from '../LibraryPage'
import {
  describeFunnel,
  describeGauge,
  describeHeatmap,
  describeSankey,
  describeTreemap,
} from './descriptions'
import { funnelOption, gaugeOption, heatmapOption, sankeyOption, treemapOption } from './options'

function Examples({ data }: { data: EchartsData }) {
  const { theme } = useAppTheme()
  const options = useMemo(() => {
    const p = chartPalette(theme)
    return {
      heatmap: heatmapOption(data.heatmap, p),
      funnel: funnelOption(data.funnel, p),
      gauge: gaugeOption(data.gauge, p),
      treemap: treemapOption(data.treemap, p),
      sankey: sankeyOption(data.sankey, p),
    }
  }, [data, theme])
  return (
    <>
      <ExampleCard
        title="Mapa de calor"
        description="Intensidade em duas dimensões, como hora do dia contra dia da semana."
        wide
      >
        <EChart
          title="Entregas por dia e hora"
          description={describeHeatmap(data.heatmap)}
          option={options.heatmap}
          height={360}
        />
      </ExampleCard>
      <ExampleCard
        title="Funil"
        description="Perda de volume entre etapas sequenciais de um processo."
      >
        <EChart
          title="Do pedido à entrega"
          description={describeFunnel(data.funnel)}
          option={options.funnel}
        />
      </ExampleCard>
      <ExampleCard title="Gauge" description="Um indicador único contra sua meta ou limite.">
        <EChart
          title="SLA de entrega"
          description={describeGauge(data.gauge)}
          option={options.gauge}
        />
      </ExampleCard>
      <ExampleCard
        title="Treemap"
        description="Composição hierárquica em que a área representa o valor."
      >
        <EChart
          title="Custo por categoria (R$ mil)"
          description={describeTreemap(data.treemap)}
          option={options.treemap}
        />
      </ExampleCard>
      <ExampleCard
        title="Sankey"
        description="Fluxo entre estados, com a espessura proporcional ao volume."
      >
        <EChart
          title="Caminho dos objetos"
          description={describeSankey(data.sankey)}
          option={options.sankey}
        />
      </ExampleCard>
    </>
  )
}

export function EchartsPage() {
  const query = useEchartsData()
  return (
    <LibraryPage library={getLibrary('echarts')}>
      <QueryBoundary query={query} skeleton={<Skeleton className="h-80 xl:col-span-2" />}>
        {(data) => <Examples data={data} />}
      </QueryBoundary>
    </LibraryPage>
  )
}
