import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export type KPIAccent = 'primary' | 'secondary' | 'warning' | 'critical' | 'neutral'

const ACCENT_CLASSES: Record<KPIAccent, string> = {
  primary: 'bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300',
  secondary: 'bg-accent-50 text-accent-600 dark:bg-accent-950 dark:text-accent-300',
  warning: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300',
  critical: 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-300',
  neutral: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
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

export function KPICard({
  label,
  value,
  hint,
  icon: Icon,
  accent = 'primary',
  onSelect,
  children,
  actions,
}: KPICardProps) {
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
      {children && (
        <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-800">{children}</div>
      )}
      {actions && <div className="mt-3 flex flex-wrap gap-2">{actions}</div>}
    </article>
  )
}
