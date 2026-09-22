import type {
  EchartsData,
  FlowData,
  MapsData,
  RechartsData,
  TablesData,
} from '@/data/types/gallery'

export interface GalleryRepository {
  getRecharts(): Promise<RechartsData>
  getEcharts(): Promise<EchartsData>
  getMaps(): Promise<MapsData>
  getTables(): Promise<TablesData>
  getFlow(): Promise<FlowData>
}
