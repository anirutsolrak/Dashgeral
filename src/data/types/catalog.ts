export interface Agreement {
  id: string
  label: string
}
export interface AgreementCategory {
  id: string
  label: string
  agreements: Agreement[]
}
export interface AgreementCatalog {
  categories: AgreementCategory[]
}
