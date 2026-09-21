import { PERIODS, REGIONS, type GlobalFilters } from '@/data/types/filters'
import { useGlobalFilters } from './useGlobalFilters'

const PERIOD_LABELS: Record<GlobalFilters['period'], string> = {
  all: 'Todo o período', '7d': 'Últimos 7 dias', '30d': 'Últimos 30 dias',
  '90d': 'Últimos 90 dias', '12m': 'Últimos 12 meses',
}
const REGION_LABELS: Record<GlobalFilters['region'], string> = {
  all: 'Todas as regiões', norte: 'Norte', nordeste: 'Nordeste',
  'centro-oeste': 'Centro-Oeste', sudeste: 'Sudeste', sul: 'Sul',
}

const selectClass =
  'rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900'

export function GlobalFiltersBar() {
  const { filters, setFilters } = useGlobalFilters()
  return (
    <div className="flex flex-wrap gap-4">
      <label className="flex items-center gap-2 text-sm">
        Período
        <select
          className={selectClass}
          value={filters.period}
          onChange={(e) => setFilters({ period: e.target.value as GlobalFilters['period'] })}
        >
          {PERIODS.map((p) => <option key={p} value={p}>{PERIOD_LABELS[p]}</option>)}
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm">
        Região
        <select
          className={selectClass}
          value={filters.region}
          onChange={(e) => setFilters({ region: e.target.value as GlobalFilters['region'] })}
        >
          {REGIONS.map((r) => <option key={r} value={r}>{REGION_LABELS[r]}</option>)}
        </select>
      </label>
    </div>
  )
}
