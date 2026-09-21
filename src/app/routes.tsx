import { type RouteObject } from 'react-router-dom'
import { IndexRedirect } from './IndexRedirect'
import { AppLayout } from './layout/AppLayout'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <IndexRedirect /> },
      {
        path: 'card-processing',
        lazy: async () => ({
          Component: (await import('@/features/card-processing/CardProcessingPage'))
            .CardProcessingPage,
        }),
      },
      {
        path: 'financial',
        lazy: async () => ({
          Component: (await import('@/features/financial/FinancialPage')).FinancialPage,
        }),
      },
      {
        path: 'inventory',
        lazy: async () => ({
          Component: (await import('@/features/inventory/InventoryPage')).InventoryPage,
        }),
      },
      {
        path: 'logistics',
        lazy: async () => ({
          Component: (await import('@/features/logistics/LogisticsPage')).LogisticsPage,
        }),
      },
      {
        path: 'gallery',
        children: [
          {
            index: true,
            lazy: async () => ({
              Component: (await import('@/features/gallery/GalleryIndexPage')).GalleryIndexPage,
            }),
          },
          {
            path: 'recharts',
            lazy: async () => ({
              Component: (await import('@/features/gallery/recharts/RechartsPage')).RechartsPage,
            }),
          },
          {
            path: 'echarts',
            lazy: async () => ({
              Component: (await import('@/features/gallery/echarts/EchartsPage')).EchartsPage,
            }),
          },
          {
            path: 'maps',
            lazy: async () => ({
              Component: (await import('@/features/gallery/maps/MapsPage')).MapsPage,
            }),
          },
        ],
      },
    ],
  },
]
