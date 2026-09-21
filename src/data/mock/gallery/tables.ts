import type { Shipment, ShipmentStatus, TablesData } from '@/data/types/gallery'
import { createRng } from '../random'

const CITIES = [
  'São Paulo',
  'Rio de Janeiro',
  'Belo Horizonte',
  'Brasília',
  'Salvador',
  'Recife',
  'Porto Alegre',
  'Curitiba',
]
const CARRIERS = ['Flash', 'Terceiros A', 'Terceiros B']
const STATUSES: ShipmentStatus[] = [
  'Entregue',
  'Entregue',
  'Entregue',
  'Em trânsito',
  'Em trânsito',
  'Devolvido',
  'Extraviado',
]
const EVENTS = [
  'Objeto postado',
  'Em transferência',
  'Saiu para entrega',
  'Entrega não efetuada',
  'Entregue ao destinatário',
]

export function buildTablesData(): TablesData {
  const rng = createRng(5004)
  const shipments = Array.from({ length: 60 }, (_, i): Shipment => {
    const status = rng.pick(STATUSES)
    const progress =
      status === 'Entregue' ? 100 : status === 'Em trânsito' ? rng.int(20, 90) : rng.int(0, 60)
    return {
      id: `ENV-${String(i + 1).padStart(4, '0')}`,
      recipient: `Cliente ${String(i + 1).padStart(3, '0')}`,
      city: rng.pick(CITIES),
      carrier: rng.pick(CARRIERS),
      status,
      amount: Math.round((15 + rng.next() * 85) * 100) / 100,
      weightKg: Math.round((0.1 + rng.next() * 2.4) * 100) / 100,
      progress,
      events: EVENTS.slice(0, Math.max(1, Math.ceil((progress / 100) * EVENTS.length))),
    }
  })
  return { shipments }
}
