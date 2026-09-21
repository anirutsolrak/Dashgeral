import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreditCard } from 'lucide-react'
import { describe, expect, it, vi } from 'vitest'
import { KPICard } from './KPICard'

describe('KPICard', () => {
  it('renders label, value and optional hint', () => {
    render(<KPICard label="Taxa de integração" value="80,00%" hint="vs. mês anterior" />)
    expect(screen.getByText('Taxa de integração')).toBeInTheDocument()
    expect(screen.getByText('80,00%')).toBeInTheDocument()
    expect(screen.getByText('vs. mês anterior')).toBeInTheDocument()
  })

  it('is not interactive without onSelect', () => {
    render(<KPICard label="Contas" value="10" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('calls onSelect when the value area is clicked', async () => {
    const onSelect = vi.fn()
    render(<KPICard label="Contas" value="10" onSelect={onSelect} />)
    await userEvent.click(screen.getByRole('button', { name: /Contas/ }))
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('renders the icon, the summary children and the actions outside the select button', async () => {
    const onSelect = vi.fn()
    const onAction = vi.fn()
    const { container } = render(
      <KPICard label="Contas" value="10" icon={CreditCard} accent="teal" onSelect={onSelect} actions={<button type="button" onClick={onAction}>Fluxograma</button>}>
        <p>Resumo</p>
      </KPICard>,
    )
    expect(container.querySelector('svg')).not.toBeNull()
    expect(screen.getByText('Resumo')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Fluxograma' }))
    expect(onAction).toHaveBeenCalledTimes(1)
    expect(onSelect).not.toHaveBeenCalled()
  })
})
