import { useCallback, useState } from 'react'
import { AgreementFilters } from '@/app/filters/AgreementFilters'
import { Modal } from '@/shared/ui/Modal'
import { FinancialDetails } from './FinancialDetails'
import { FinancialKpis } from './FinancialKpis'
import { UnlockByRegion } from './UnlockByRegion'
import { UsageEvolution } from './UsageEvolution'
import { FIN_KPI_META, type FinancialKpi } from './kpis'

export function FinancialPage() {
  const [selected, setSelected] = useState<FinancialKpi | null>(null)
  const close = useCallback(() => setSelected(null), [])
  return (
    <section className="space-y-6">
      <h1 className="text-xl font-semibold">Desempenho Financeiro</h1>
      <AgreementFilters />
      <FinancialKpis onSelect={setSelected} />
      <UnlockByRegion />
      <UsageEvolution />
      <Modal open={selected !== null} title={selected ? FIN_KPI_META[selected].detailsTitle : ''} onClose={close} wide>
        {selected && <FinancialDetails kpi={selected} />}
      </Modal>
    </section>
  )
}
