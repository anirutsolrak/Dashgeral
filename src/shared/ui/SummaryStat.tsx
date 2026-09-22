const TONES = {
  blue: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  green: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300',
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
