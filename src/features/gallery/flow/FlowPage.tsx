import { useAppTheme } from '@/app/layout/ThemeContext'
import type { FlowData } from '@/data/types/gallery'
import { FlowDiagram } from '@/shared/flow/FlowDiagram'
import { OrgChart } from '@/shared/flow/OrgChart'
import { QueryBoundary } from '@/shared/ui/QueryBoundary'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useFlowData } from '../api'
import { ExampleCard } from '../ExampleCard'
import { getLibrary } from '../libraries'
import { LibraryPage } from '../LibraryPage'
import { GraphDiagram } from './GraphDiagram'

function Examples({ data }: { data: FlowData }) {
  const { theme } = useAppTheme()
  return (
    <>
      <ExampleCard
        title="Fluxograma"
        description="Etapas em sequência, da esquerda para a direita."
      >
        <FlowDiagram steps={data.steps} label="Fluxo de uma entrega" theme={theme} />
      </ExampleCard>
      <ExampleCard title="Organograma" description="Hierarquia em árvore, com cargos genéricos.">
        <OrgChart root={data.org} label="Organograma da logística" theme={theme} />
      </ExampleCard>
      <ExampleCard
        title="Pipeline com status"
        description="Nós arrastáveis, cor e texto por status e mapa de navegação."
      >
        <GraphDiagram
          graph={data.pipeline}
          label="Pipeline de entrega"
          theme={theme}
          interactive
          minimap
        />
      </ExampleCard>
      <ExampleCard title="Árvore de decisão" description="Ramificações com rótulos nas conexões.">
        <GraphDiagram graph={data.decision} label="Decisão de entrega" theme={theme} />
      </ExampleCard>
    </>
  )
}

export function FlowPage() {
  const query = useFlowData()
  return (
    <LibraryPage library={getLibrary('flow')}>
      <QueryBoundary query={query} skeleton={<Skeleton className="h-80 xl:col-span-2" />}>
        {(data) => <Examples data={data} />}
      </QueryBoundary>
    </LibraryPage>
  )
}
