import { Link, useLocation } from 'react-router-dom'
import { GALLERY_LIBRARIES } from './libraries'

export function GalleryIndexPage() {
  const { search } = useLocation()
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Galeria de Componentes</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Um exemplo de cada tipo de visualização que dá para integrar a um dashboard. Os filtros
          globais não se aplicam à Galeria: os dados são exemplos fixos.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {GALLERY_LIBRARIES.map(({ slug, name, tagline, examples, icon: Icon }) => (
          <Link
            key={slug}
            to={{ pathname: `/gallery/${slug}`, search }}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand-400 dark:border-slate-800 dark:bg-slate-900"
          >
            <Icon size={22} aria-hidden className="text-brand-600 dark:text-brand-400" />
            <p className="mt-3 text-base font-semibold">{name}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{tagline}</p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{`${examples} exemplos`}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
