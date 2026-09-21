import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { buildOverview } from '@/data/mock/overview'
import { DEFAULT_FILTERS } from '@/data/types/filters'
import { formatNumber } from '@/shared/lib/formatters'
import { renderWithProviders } from '@/test/renderWithProviders'
import { DetailsContent } from './DetailsContent'

const o = buildOverview(DEFAULT_FILTERS)
const heading = (name: string) => screen.findByRole('heading', { name })

describe('DetailsContent', () => {
  beforeEach(() => window.history.replaceState({}, '', '/?delay=0'))

  it('shows integration bar and reason pies', async () => {
    renderWithProviders(<DetailsContent kpi="integration" />, { url: '/?delay=0' })
    expect(await heading('Digitadas x Não digitadas')).toBeInTheDocument()
    expect(await heading('Motivos de parada das propostas digitadas')).toBeInTheDocument()
    expect(await heading('Propostas não digitadas')).toBeInTheDocument()
    expect(
      await screen.findByRole('img', { name: new RegExp(`Digitadas: ${formatNumber(o.integration.digitized)}`) }),
    ).toBeInTheDocument()
  })

  it('shows accounts bar and reason pies', async () => {
    renderWithProviders(<DetailsContent kpi="accounts" />, { url: '/?delay=0' })
    expect(await heading('Contas criadas x não criadas')).toBeInTheDocument()
    expect(await heading('Motivos das contas criadas')).toBeInTheDocument()
    expect(await heading('Motivos das contas não criadas')).toBeInTheDocument()
  })

  it('shows the cards status bar', async () => {
    renderWithProviders(<DetailsContent kpi="cards" />, { url: '/?delay=0' })
    expect(await heading('Status dos cartões')).toBeInTheDocument()
    expect(
      await screen.findByRole('img', { name: new RegExp(`Enviados: ${formatNumber(o.cards.sent)}`) }),
    ).toBeInTheDocument()
  })

  it('shows the insurance pies, the assignment footnote and the summary', async () => {
    renderWithProviders(<DetailsContent kpi="insurance" />, { url: '/?delay=0' })
    expect(await heading('Distribuição total de propostas')).toBeInTheDocument()
    expect(await heading('Distribuição por valor')).toBeInTheDocument()
    expect(await heading('Status de cessão')).toBeInTheDocument()
    expect(screen.getByText('* Referente às propostas maiores que R$ 200')).toBeInTheDocument()
    expect(await screen.findByText('Total de propostas')).toBeInTheDocument()
    expect(await screen.findByText('Propostas com seguro')).toBeInTheDocument()
  })

  it('shows the error state when a query fails', async () => {
    window.history.replaceState({}, '', '/?delay=0&error=1')
    renderWithProviders(<DetailsContent kpi="cards" />, { url: '/?delay=0&error=1' })
    expect((await screen.findAllByRole('alert')).length).toBeGreaterThan(0)
  })
})
