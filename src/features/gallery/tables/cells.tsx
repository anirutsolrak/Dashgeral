import type { ShipmentStatus } from '@/data/types/gallery'

const TONES: Record<ShipmentStatus, string> = {
  Entregue: 'bg-accent-100 text-accent-700 dark:bg-accent-950 dark:text-accent-300',
  'Em trânsito': 'bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300',
  Devolvido: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  Extraviado: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
}

export function StatusBadge({ status }: { status: ShipmentStatus }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TONES[status]}`}>
      {status}
    </span>
  )
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div
      role="progressbar"
      aria-label="Progresso da entrega"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      className="h-2 w-24 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
    >
      <div className="h-full bg-brand-500" style={{ width: `${value}%` }} />
    </div>
  )
}
