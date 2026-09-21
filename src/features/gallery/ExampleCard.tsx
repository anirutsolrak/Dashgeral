import { useId, type ReactNode } from 'react'

interface ExampleCardProps {
  title: string
  description: string
  children: ReactNode
  wide?: boolean
}

export function ExampleCard({ title, description, children, wide = false }: ExampleCardProps) {
  const id = useId()
  return (
    <section aria-labelledby={id} className={`space-y-2 ${wide ? 'xl:col-span-2' : ''}`}>
      <div>
        <h2 id={id} className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      {children}
    </section>
  )
}
