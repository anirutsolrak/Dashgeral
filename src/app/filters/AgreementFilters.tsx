import { useAgreementCatalog } from './useAgreementCatalog'
import { useGlobalFilters } from './useGlobalFilters'

const selectClass =
  'rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900'

export function AgreementFilters() {
  const { filters, setFilters } = useGlobalFilters()
  const catalog = useAgreementCatalog()

  if (catalog.isError) {
    return <p role="status" className="text-sm text-slate-500">Filtros de convênio indisponíveis</p>
  }

  const categories = catalog.data?.categories ?? []
  const visible = filters.agreementCategory === 'all'
    ? categories
    : categories.filter((c) => c.id === filters.agreementCategory)
  const agreements = visible.flatMap((c) => c.agreements)

  return (
    <div className="flex flex-wrap gap-4">
      <label className="flex items-center gap-2 text-sm">
        Categoria
        <select
          className={selectClass}
          disabled={catalog.isPending}
          value={filters.agreementCategory}
          onChange={(e) => setFilters({ agreementCategory: e.target.value })}
        >
          <option value="all">Todas</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm">
        Convênio
        <select
          className={selectClass}
          disabled={catalog.isPending}
          value={filters.agreement}
          onChange={(e) => setFilters({ agreement: e.target.value })}
        >
          <option value="all">Todos</option>
          {agreements.map((a) => (
            <option key={a.id} value={a.id}>{a.label}</option>
          ))}
        </select>
      </label>
    </div>
  )
}
