import type { UseQueryResult } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { Skeleton } from './Skeleton'

interface QueryBoundaryProps<T> {
  query: UseQueryResult<T>
  skeleton?: ReactNode
  children: (data: T) => ReactNode
}

export function QueryBoundary<T>({ query, skeleton, children }: QueryBoundaryProps<T>) {
  if (query.isPending) return <>{skeleton ?? <Skeleton />}</>
  if (query.isError) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
      >
        <p className="font-medium">Não foi possível carregar os dados.</p>
        <p className="text-sm">{query.error.message}</p>
        <button
          type="button"
          onClick={() => void query.refetch()}
          className="mt-2 rounded-md bg-red-600 px-3 py-1 text-sm text-white"
        >
          Tentar novamente
        </button>
      </div>
    )
  }
  return <>{children(query.data)}</>
}
