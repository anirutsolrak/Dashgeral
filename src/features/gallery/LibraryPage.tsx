import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { GalleryLibrary } from './libraries'

export function LibraryPage({
  library,
  children,
}: {
  library: GalleryLibrary
  children: ReactNode
}) {
  const { search } = useLocation()
  return (
    <div className="space-y-6">
      <Link
        to={{ pathname: '/gallery', search }}
        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline dark:text-blue-400"
      >
        <ArrowLeft size={14} aria-hidden />
        Galeria
      </Link>
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">{library.name}</h1>
        <p className="rounded-lg bg-slate-100 p-3 text-sm dark:bg-slate-800">
          <strong>Quando usar:</strong> {library.whenToUse}
        </p>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">{children}</div>
    </div>
  )
}
