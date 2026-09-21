export type FlowTheme = 'light' | 'dark'

export interface FlowStepInput {
  id: string
  label: string
}

export interface OrgNodeInput {
  id: string
  name: string
  role: string
  children: OrgNodeInput[]
}
