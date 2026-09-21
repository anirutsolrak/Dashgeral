import { useCallback, useState } from 'react'
import { Modal } from '@/shared/ui/Modal'
import { LogisticsCharts } from './LogisticsCharts'
import { LogisticsDetails } from './LogisticsDetails'
import { LogisticsFilters } from './LogisticsFilters'
import { LogisticsKpis } from './LogisticsKpis'
import { LogisticsTable } from './LogisticsTable'
import { LOG_KPI_META, type LogisticsKpi } from './kpis'

export function LogisticsPage() {
  const [selected, setSelected] = useState<LogisticsKpi | null>(null)
  const close = useCallback(() => setSelected(null), [])
  return (
    <section className="space-y-6">
      <h1 className="text-xl font-semibold">Logística</h1>
      <LogisticsFilters />
      <LogisticsKpis onSelect={setSelected} />
      <LogisticsCharts />
      <LogisticsTable />
      <Modal open={selected !== null} title={selected ? LOG_KPI_META[selected].detailsTitle : ''} onClose={close} wide>
        {selected && <LogisticsDetails kpi={selected} />}
      </Modal>
    </section>
  )
}
