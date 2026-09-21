export function Skeleton({ className = 'h-24' }: { className?: string }) {
  return <div aria-hidden className={`animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800 ${className}`} />
}
