import { useQuery } from '@tanstack/react-query'
import { useDevFlags } from '@/app/data/useDomainQuery'
import { repositories } from '@/data/repositories'

const repo = repositories.gallery

// A Galeria ignora os filtros globais: a chave leva só o nome do conjunto e as dev flags.
function useGalleryQuery<T>(name: string, fetcher: () => Promise<T>) {
  const devFlags = useDevFlags()
  return useQuery({ queryKey: ['gallery', name, devFlags], queryFn: fetcher, staleTime: Infinity })
}

export const useRechartsData = () => useGalleryQuery('recharts', () => repo.getRecharts())
export const useEchartsData = () => useGalleryQuery('echarts', () => repo.getEcharts())
export const useMapsData = () => useGalleryQuery('maps', () => repo.getMaps())
export const useTablesData = () => useGalleryQuery('tables', () => repo.getTables())
export const useFlowData = () => useGalleryQuery('flow', () => repo.getFlow())
