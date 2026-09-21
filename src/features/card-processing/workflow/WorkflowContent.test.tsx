import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/renderWithProviders'
import { WorkflowContent } from './WorkflowContent'

const url = '/?delay=0'

describe('WorkflowContent', () => {
  beforeEach(() => window.history.replaceState({}, '', url))

  it('renders the flowchart steps', async () => {
    renderWithProviders(<WorkflowContent kpi="integration" view="flowchart" />, { url })
    expect(await screen.findByText('Proposta recebida')).toBeInTheDocument()
    expect(screen.getByText('Integração concluída')).toBeInTheDocument()
  })

  it('renders the org chart with generic roles', async () => {
    renderWithProviders(<WorkflowContent kpi="integration" view="orgchart" />, { url })
    expect(await screen.findByText('Gestor Geral')).toBeInTheDocument()
    expect(screen.getByText('Supervisor de Operações')).toBeInTheDocument()
    expect(screen.getByText('Analista 3')).toBeInTheDocument()
  })

  it('renders the list of documents', async () => {
    renderWithProviders(<WorkflowContent kpi="integration" view="docs" />, { url })
    expect(await screen.findByText('POP: Digitação de propostas')).toBeInTheDocument()
    expect(screen.getByText('Passo a passo da digitação e conferência.')).toBeInTheDocument()
  })

  it('shows the error state', async () => {
    window.history.replaceState({}, '', '/?delay=0&error=1')
    renderWithProviders(<WorkflowContent kpi="cards" view="docs" />, { url: '/?delay=0&error=1' })
    expect(await screen.findByRole('alert')).toHaveTextContent('Falha simulada')
  })
})
