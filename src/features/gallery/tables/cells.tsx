import type { ShipmentStatus } from '@/data/types/gallery'

const TONES: Record<ShipmentStatus, string> = {
  Entregue: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
  'Em trânsito': 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
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
      <div className="h-full bg-blue-500" style={{ width: `${value}%` }} />
    </div>
  )
}
