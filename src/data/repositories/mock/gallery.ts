import { buildEchartsData } from '@/data/mock/gallery/echarts'
import { buildFlowData } from '@/data/mock/gallery/flow'
import { buildMapsData } from '@/data/mock/gallery/maps'
import { buildRechartsData } from '@/data/mock/gallery/recharts'
import { buildTablesData } from '@/data/mock/gallery/tables'
import { simulate } from '@/data/mock/simulate'
import type { GalleryRepository } from '@/data/repositories/gallery'

export const mockGalleryRepository: GalleryRepository = {
  getRecharts: () => simulate(buildRechartsData),
  getEcharts: () => simulate(buildEchartsData),
  getMaps: () => simulate(buildMapsData),
  getTables: () => simulate(buildTablesData),
  getFlow: () => simulate(buildFlowData),
}
