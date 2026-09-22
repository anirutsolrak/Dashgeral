import { ACCENT_HEX } from '@/shared/charts/chartTheme'
import { GroupedBarChartCard } from '@/shared/charts/GroupedBarChartCard'
import { formatNumber, formatPercentage } from '@/shared/lib/formatters'
import { RegionMap } from '@/shared/maps/RegionMap'
import { QueryBoundary } from '@/shared/ui/QueryBoundary'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useUnlockByRegion } from './api'

export function UnlockByRegion() {
  const query = useUnlockByRegion()
  return (
    <QueryBoundary query={query} skeleton={<Skeleton className="h-80" />}>
      {(regions) => (
        <div className="grid gap-4 xl:grid-cols-2">
          <RegionMap
            title="Taxa de Desbloqueio de Cartões por Região"
            format={(v) => formatPercentage(v, 1)}
            points={regions.map((r) => {
              const total = r.unlocked + r.locked
              return {
                id: r.region,
                label: r.label,
                lat: r.lat,
                lng: r.lng,
                value: total === 0 ? 0 : (r.unlocked / total) * 100,
                detail: `${formatNumber(r.unlocked)} desbloqueados, ${formatNumber(r.locked)} bloqueados`,
              }
            })}
          />
          <GroupedBarChartCard
            title="Comparativo Desbloqueios vs. Bloqueios por Região"
            series={[
              { key: 'unlocked', label: 'Desbloqueados', color: ACCENT_HEX.green },
              { key: 'locked', label: 'Bloqueados', color: ACCENT_HEX.red },
            ]}
            data={regions.map((r) => ({ label: r.label, unlocked: r.unlocked, locked: r.locked }))}
          />
        </div>
      )}
    </QueryBoundary>
  )
}
