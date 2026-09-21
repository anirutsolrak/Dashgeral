import { FileText } from 'lucide-react'
import type { WorkflowDoc } from '@/data/types/card-processing'

export function DocsList({ docs }: { docs: WorkflowDoc[] }) {
  return (
    <ul className="space-y-3">
      {docs.map((doc) => (
        <li key={doc.id} className="flex gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
          <FileText aria-hidden className="mt-0.5 shrink-0 text-slate-400" size={18} />
          <div>
            <p className="font-medium">{doc.title}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{doc.description}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
