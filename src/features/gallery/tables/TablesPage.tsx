import { useState } from 'react'
import type { Shipment } from '@/data/types/gallery'
import { formatCurrency } from '@/shared/lib/formatters'
import { DataTable } from '@/shared/ui/DataTable'
import { QueryBoundary } from '@/shared/ui/QueryBoundary'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useTablesData } from '../api'
import { ExampleCard } from '../ExampleCard'
import { getLibrary } from '../libraries'
import { LibraryPage } from '../LibraryPage'
import { BASIC_COLUMNS, RICH_COLUMNS } from './columns'

const CARD =
  'rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900'

function Examples({ shipments }: { shipments: Shipment[] }) {
  const [selected, setSelected] = useState<Shipment[]>([])
  const selectedAmount = selected.reduce((sum, s) => sum + s.amount, 0)
  return (
    <>
      <ExampleCard title="Ordenação" description="Clique no cabeçalho para ordenar por coluna.">
        <div className={CARD}>
          <DataTable
            caption="Envios recentes"
            columns={BASIC_COLUMNS}
            data={shipments.slice(0, 8)}
          />
        </div>
      </ExampleCard>
      <ExampleCard
        title="Busca e paginação"
        description="Filtro de texto e páginas para listas longas."
      >
        <div className={CARD}>
          <DataTable
            caption="Todos os envios"
            columns={BASIC_COLUMNS}
            data={shipments}
            searchable
            pageSize={10}
          />
        </div>
      </ExampleCard>
      <ExampleCard
        title="Seleção de linhas"
        description="Marque linhas para agir sobre um conjunto."
      >
        <div className={CARD}>
          <DataTable
            caption="Envios para seleção"
            columns={BASIC_COLUMNS}
            data={shipments.slice(0, 10)}
            selectable
            onSelectionChange={setSelected}
          />
          <p className="mt-2 text-sm">{`Valor selecionado: ${formatCurrency(selectedAmount)}`}</p>
        </div>
      </ExampleCard>
      <ExampleCard
        title="Células ricas e linhas expansíveis"
        description="Badges, barras de progresso e detalhe por linha."
      >
        <div className={CARD}>
          <DataTable
            caption="Envios com detalhe"
            columns={RICH_COLUMNS}
            data={shipments.slice(0, 8)}
            renderDetail={(s) => (
              <ul className="list-inside list-disc text-sm">
                {s.events.map((event) => (
                  <li key={event}>{event}</li>
                ))}
              </ul>
            )}
          />
        </div>
      </ExampleCard>
    </>
  )
}

export function TablesPage() {
  const query = useTablesData()
  return (
    <LibraryPage library={getLibrary('tables')}>
      <QueryBoundary query={query} skeleton={<Skeleton className="h-80 xl:col-span-2" />}>
        {({ shipments }) => <Examples shipments={shipments} />}
      </QueryBoundary>
    </LibraryPage>
  )
}
