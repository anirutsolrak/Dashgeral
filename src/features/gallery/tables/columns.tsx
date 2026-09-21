import type { Shipment } from '@/data/types/gallery'
import { formatCurrency } from '@/shared/lib/formatters'
import type { DataColumn } from '@/shared/ui/DataTable'
import { ProgressBar, StatusBadge } from './cells'

const ID: DataColumn<Shipment> = {
  id: 'id',
  header: 'Envio',
  cell: (s) => s.id,
  sortValue: (s) => s.id,
}
const RECIPIENT: DataColumn<Shipment> = {
  id: 'recipient',
  header: 'Destinatário',
  cell: (s) => s.recipient,
  sortValue: (s) => s.recipient,
}
const CITY: DataColumn<Shipment> = {
  id: 'city',
  header: 'Cidade',
  cell: (s) => s.city,
  sortValue: (s) => s.city,
}
const AMOUNT: DataColumn<Shipment> = {
  id: 'amount',
  header: 'Valor',
  cell: (s) => formatCurrency(s.amount),
  sortValue: (s) => s.amount,
  align: 'right',
}

// Constantes de módulo: o DataTable memoiza pelas colunas, então a identidade precisa ser estável.
export const BASIC_COLUMNS: DataColumn<Shipment>[] = [ID, RECIPIENT, CITY, AMOUNT]

export const RICH_COLUMNS: DataColumn<Shipment>[] = [
  ID,
  RECIPIENT,
  {
    id: 'status',
    header: 'Status',
    cell: (s) => <StatusBadge status={s.status} />,
    sortValue: (s) => s.status,
  },
  {
    id: 'progress',
    header: 'Progresso',
    cell: (s) => <ProgressBar value={s.progress} />,
    sortValue: (s) => s.progress,
  },
  AMOUNT,
]
