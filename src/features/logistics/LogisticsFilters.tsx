import { useGlobalFilters } from '@/app/filters/useGlobalFilters'
import { useLogisticsCatalog } from './api'

const selectClass =
  'rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900'

export function LogisticsFilters() {
  const { filters, setFilters } = useGlobalFilters()
  const catalog = useLogisticsCatalog()

  if (catalog.isError) {
    return <p role="status" className="text-sm text-slate-500">Filtros de logística indisponíveis</p>
  }

  const types = catalog.data?.types ?? []
  const groups = catalog.data?.groups ?? []

  return (
    <div className="flex flex-wrap gap-4">
      <label className="flex items-center gap-2 text-sm">
        Tipo
        <select
          className={selectClass}
          disabled={catalog.isPending}
          value={filters.logisticsType}
          onChange={(e) => setFilters({ logisticsType: e.target.value })}
        >
          <option value="all">Todos</option>
          {types.map((t) => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm">
        Etapa
        <select
          className={selectClass}
          disabled={catalog.isPending}
          value={filters.logisticsStep}
          onChange={(e) => setFilters({ logisticsStep: e.target.value })}
        >
          <option value="all">Todas</option>
          {groups.map((g) => (
            <optgroup key={g.key} label={g.label}>
              {g.steps.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>
    </div>
  )
}
