export type StockItemKey = 'cards' | 'envelopes' | 'letters'

export interface StockItem {
  key: StockItemKey
  label: string
  total: number
  available: number
  inTransit: number
  lost: number
}

export interface InventoryOverview {
  items: StockItem[]
  totalLost: number
}
