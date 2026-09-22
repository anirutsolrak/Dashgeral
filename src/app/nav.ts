import { CreditCard, LayoutGrid, Package, TrendingUp, Truck, type LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/card-processing', label: 'Processamento de Cartões', icon: CreditCard },
  { to: '/financial', label: 'Desempenho Financeiro', icon: TrendingUp },
  { to: '/inventory', label: 'Gestão de Estoque', icon: Package },
  { to: '/logistics', label: 'Logística', icon: Truck },
  { to: '/gallery', label: 'Galeria de Componentes', icon: LayoutGrid },
]
