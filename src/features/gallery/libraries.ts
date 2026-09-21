import { BarChart3, Map, Network, Table2, Waypoints, type LucideIcon } from 'lucide-react'

export type GallerySlug = 'recharts' | 'echarts' | 'maps' | 'tables' | 'flow'

export interface GalleryLibrary {
  slug: GallerySlug
  name: string
  tagline: string
  whenToUse: string
  examples: number
  icon: LucideIcon
}

export const GALLERY_LIBRARIES: GalleryLibrary[] = [
  {
    slug: 'recharts', name: 'Recharts', icon: BarChart3, examples: 6,
    tagline: 'Gráficos de negócio como componentes React.',
    whenToUse: 'gráficos comuns (linhas, barras, áreas, pizza, radar) quando você quer componentes declarativos, leves e fáceis de tematizar. Passa do limite com muitos milhares de pontos ou tipos estatísticos especiais.',
  },
  {
    slug: 'echarts', name: 'Apache ECharts', icon: Network, examples: 5,
    tagline: 'Visualizações densas e especializadas.',
    whenToUse: 'mapa de calor, funil, gauge, treemap, sankey e grandes volumes de dados. Custa mais no bundle, por isso só carrega nesta rota.',
  },
  {
    slug: 'maps', name: 'Mapas (react-leaflet)', icon: Map, examples: 4,
    tagline: 'Dados com localização.',
    whenToUse: 'quando o lugar faz parte da informação: distribuição por região, rotas e áreas de cobertura. Exige internet para os tiles e só carrega nas páginas com mapa.',
  },
  {
    slug: 'tables', name: 'Tabelas (TanStack Table)', icon: Table2, examples: 4,
    tagline: 'Listagens com ordenação, busca e seleção.',
    whenToUse: 'listagens que precisam de ordenação, busca, paginação, seleção ou detalhe por linha. A biblioteca cuida do estado e você controla toda a marcação.',
  },
  {
    slug: 'flow', name: 'Fluxos (React Flow)', icon: Waypoints, examples: 4,
    tagline: 'Diagramas de nós e conexões.',
    whenToUse: 'fluxogramas, organogramas e pipelines em que nós e conexões são o dado. Suporta arrastar, zoom e mapa de navegação.',
  },
]

export const getLibrary = (slug: GallerySlug): GalleryLibrary =>
  GALLERY_LIBRARIES.find((l) => l.slug === slug) ?? GALLERY_LIBRARIES[0]!
