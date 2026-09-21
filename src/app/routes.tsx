import { type RouteObject } from 'react-router-dom'
import { ComingSoon } from '@/shared/ui/ComingSoon'
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
      { path: 'inventory', element: <ComingSoon title="Gestão de Estoque" /> },
      { path: 'logistics', element: <ComingSoon title="Logística" /> },
      { path: 'gallery', element: <ComingSoon title="Galeria de Componentes" /> },
    ],
  },
]
