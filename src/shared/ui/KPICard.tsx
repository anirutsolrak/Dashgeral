import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export type KPIAccent = 'blue' | 'purple' | 'teal' | 'orange' | 'pink'

const ACCENT_CLASSES: Record<KPIAccent, string> = {
  blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300',
  purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-300',
  teal: 'bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-300',
  orange: 'bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-300',
  pink: 'bg-pink-50 text-pink-600 dark:bg-pink-950 dark:text-pink-300',
}

interface KPICardProps {
  label: string
  value: string
  hint?: string
  icon?: LucideIcon
  accent?: KPIAccent
  onSelect?: () => void
  children?: ReactNode
  actions?: ReactNode
}

export function KPICard({ label, value, hint, icon: Icon, accent = 'blue', onSelect, children, actions }: KPICardProps) {
  const head = (
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
        {hint && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
      </div>
      {Icon && (
        <span aria-hidden className={`rounded-lg p-2 ${ACCENT_CLASSES[accent]}`}>
          <Icon size={20} />
        </span>
      )}
    </div>
  )
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {onSelect ? (
        <button type="button" onClick={onSelect} className="block w-full cursor-pointer text-left">
          {head}
        </button>
      ) : (
        head
      )}
      {children && <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-800">{children}</div>}
      {actions && <div className="mt-3 flex flex-wrap gap-2">{actions}</div>}
    </article>
  )
}
