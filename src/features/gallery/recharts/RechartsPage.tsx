import { ACCENT_HEX } from '@/shared/charts/chartTheme'
import { AreaChartCard } from '@/shared/charts/AreaChartCard'
import { ComposedChartCard } from '@/shared/charts/ComposedChartCard'
import { GroupedBarChartCard } from '@/shared/charts/GroupedBarChartCard'
import { LineChartCard } from '@/shared/charts/LineChartCard'
import { PieChartCard } from '@/shared/charts/PieChartCard'
import { RadarChartCard } from '@/shared/charts/RadarChartCard'
import { QueryBoundary } from '@/shared/ui/QueryBoundary'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useRechartsData } from '../api'
import { withColors } from '../colors'
import { ExampleCard } from '../ExampleCard'
import { getLibrary } from '../libraries'
import { LibraryPage } from '../LibraryPage'

export function RechartsPage() {
  const query = useRechartsData()
  return (
    <LibraryPage library={getLibrary('recharts')}>
      <QueryBoundary query={query} skeleton={<Skeleton className="h-80 xl:col-span-2" />}>
        {(d) => (
          <>
            <ExampleCard title="Linha" description="Tendência de uma série ao longo do tempo.">
              <LineChartCard title="Entregas por mês" data={d.trend} />
            </ExampleCard>
            <ExampleCard title="Barras agrupadas" description="Comparar categorias lado a lado.">
              <GroupedBarChartCard
                title="Envios por canal (1º trimestre)"
                series={withColors(d.channels)}
                data={d.channelVolume.slice(0, 3)}
              />
            </ExampleCard>
            <ExampleCard
              title="Pizza"
              description="Participação de cada parte no total (poucas fatias)."
            >
              <PieChartCard title="Objetos por status" data={d.statusShare} />
            </ExampleCard>
            <ExampleCard title="Área empilhada" description="Composição do total e sua evolução.">
              <AreaChartCard
                title="Volume por canal em 12 meses"
                series={withColors(d.channels)}
                data={d.channelVolume}
              />
            </ExampleCard>
            <ExampleCard
              title="Composto (barras e linha)"
              description="Realizado contra meta na mesma escala."
            >
              <ComposedChartCard
                title="Volume total contra a meta"
                barSeries={[{ key: 'volume', label: 'Volume', color: ACCENT_HEX.purple }]}
                lineSeries={[{ key: 'meta', label: 'Meta', color: ACCENT_HEX.pink }]}
                data={d.volumeVsTarget}
              />
            </ExampleCard>
            <ExampleCard
              title="Radar"
              description="Perfil de várias dimensões para poucas entidades."
            >
              <RadarChartCard
                title="Desempenho por unidade"
                series={withColors(d.units)}
                data={d.unitPerformance}
              />
            </ExampleCard>
          </>
        )}
      </QueryBoundary>
    </LibraryPage>
  )
}
