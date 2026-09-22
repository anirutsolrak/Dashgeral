const TONES = {
  blue: 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300',
  green: 'bg-accent-50 text-accent-700 dark:bg-accent-950 dark:text-accent-300',
  red: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
} as const

interface SummaryStatProps {
  label: string
  value: string
  tone?: keyof typeof TONES
}

export function SummaryStat({ label, value, tone = 'blue' }: SummaryStatProps) {
  return (
    <div className={`rounded-lg p-2 text-center ${TONES[tone]}`}>
      <p className="text-xs">{label}</p>
      <p className="text-lg font-bold tabular-nums">{value}</p>
    </div>
  )
}
