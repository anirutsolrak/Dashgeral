import { CreditCard, Mail, PackageX, ScrollText, type LucideIcon } from 'lucide-react'
import type { StockItemKey } from '@/data/types/inventory'
import { formatNumber } from '@/shared/lib/formatters'
import { KPICard, type KPIAccent } from '@/shared/ui/KPICard'
import { QueryBoundary } from '@/shared/ui/QueryBoundary'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useInventory } from './api'
import { INV_KPI_META, type InventoryKpi } from './kpis'

const GRID = 'grid gap-4 sm:grid-cols-2 xl:grid-cols-4'

const ITEMS: { key: StockItemKey; icon: LucideIcon; accent: KPIAccent }[] = [
  { key: 'cards', icon: CreditCard, accent: 'blue' },
  { key: 'envelopes', icon: Mail, accent: 'teal' },
  { key: 'letters', icon: ScrollText, accent: 'purple' },
]

export function InventoryKpis({ onSelect }: { onSelect: (kpi: InventoryKpi) => void }) {
  const query = useInventory()
  return (
    <QueryBoundary
      query={query}
      skeleton={
        <div className={GRID}>
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      }
    >
      {({ items, totalLost }) => (
        <div className={GRID}>
          {ITEMS.map(({ key, icon, accent }) => {
            const item = items.find((i) => i.key === key)
            return (
              <KPICard
                key={key}
                label={INV_KPI_META[key].title}
                value={formatNumber(item?.total ?? 0)}
                hint={`${formatNumber(item?.available ?? 0)} disponíveis`}
                icon={icon}
                accent={accent}
                onSelect={() => onSelect(key)}
              />
            )
          })}
          <KPICard
            label={INV_KPI_META.losses.title}
            value={formatNumber(totalLost)}
            hint="Total de itens extraviados"
            icon={PackageX}
            accent="orange"
            onSelect={() => onSelect('losses')}
          />
        </div>
      )}
    </QueryBoundary>
  )
}
