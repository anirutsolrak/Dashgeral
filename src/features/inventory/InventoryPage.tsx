import { useCallback, useState } from 'react'
import { Modal } from '@/shared/ui/Modal'
import { InventoryCharts } from './InventoryCharts'
import { InventoryDetails } from './InventoryDetails'
import { InventoryKpis } from './InventoryKpis'
import { INV_KPI_META, type InventoryKpi } from './kpis'

export function InventoryPage() {
  const [selected, setSelected] = useState<InventoryKpi | null>(null)
  const close = useCallback(() => setSelected(null), [])
  return (
    <section className="space-y-6">
      <h1 className="text-xl font-semibold">Gestão de Estoque</h1>
      <InventoryKpis onSelect={setSelected} />
      <InventoryCharts />
      <Modal open={selected !== null} title={selected ? INV_KPI_META[selected].detailsTitle : ''} onClose={close} wide>
        {selected && <InventoryDetails kpi={selected} />}
      </Modal>
    </section>
  )
}
