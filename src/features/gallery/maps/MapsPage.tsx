import { CoverageMap } from '@/shared/maps/CoverageMap'
import { RegionMap } from '@/shared/maps/RegionMap'
import { RouteMap } from '@/shared/maps/RouteMap'
import { formatNumber } from '@/shared/lib/formatters'
import { QueryBoundary } from '@/shared/ui/QueryBoundary'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useMapsData } from '../api'
import { ExampleCard } from '../ExampleCard'
import { getLibrary } from '../libraries'
import { LibraryPage } from '../LibraryPage'

const thematicColor = (value: number): string =>
  value >= 90 ? '#0ea5e9' : value >= 80 ? '#6366f1' : '#f43f5e'

export function MapsPage() {
  const query = useMapsData()
  return (
    <LibraryPage library={getLibrary('maps')}>
      <QueryBoundary query={query} skeleton={<Skeleton className="h-96 xl:col-span-2" />}>
        {(d) => (
          <>
            <ExampleCard
              title="Bolhas por região"
              description="Um valor por área, com cor e tamanho pelo valor."
            >
              <RegionMap
                title="Índice de SLA por região"
                points={d.regionScores}
                format={(v) => `${formatNumber(v)}%`}
              />
            </ExampleCard>
            <ExampleCard
              title="Mapa temático por capital"
              description="Mesma base com escala de cor própria (azul, índigo e rosa)."
            >
              <RegionMap
                title="Entregas por capital"
                points={d.branchScores}
                format={(v) => `${formatNumber(v)} pontos`}
                colorFor={thematicColor}
              />
            </ExampleCard>
            <ExampleCard
              title="Rotas entre centros"
              description="Conexões entre pontos, com espessura pelo volume."
            >
              <RouteMap
                title="Rotas de transferência"
                hubs={d.hubs}
                routes={d.routes}
                format={(v) => `${formatNumber(v)} envios`}
              />
            </ExampleCard>
            <ExampleCard
              title="Áreas de cobertura"
              description="Raios em quilômetros ao redor de um ponto."
            >
              <CoverageMap title="Cobertura das agências" areas={d.coverage} />
            </ExampleCard>
          </>
        )}
      </QueryBoundary>
    </LibraryPage>
  )
}
