import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Modal } from './Modal'

const setup = (open = true) => {
  const onClose = vi.fn()
  const view = render(
    <Modal open={open} title="Detalhamento" onClose={onClose}>
      <p>Conteúdo</p>
    </Modal>,
  )
  return { onClose, ...view }
}

describe('Modal', () => {
  it('renders nothing when closed', () => {
    setup(false)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
  it('renders an accessible dialog with title and content', () => {
    setup()
    expect(screen.getByRole('dialog', { name: 'Detalhamento' })).toHaveAttribute('aria-modal', 'true')
    expect(screen.getByText('Conteúdo')).toBeInTheDocument()
  })
  it('closes on Escape, on the close button and on backdrop click, but not on inner click', async () => {
    const { onClose } = setup()
    await userEvent.keyboard('{Escape}')
    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(onClose).toHaveBeenCalledTimes(2)
    await userEvent.click(screen.getByText('Conteúdo'))
    expect(onClose).toHaveBeenCalledTimes(2)
    await userEvent.click(screen.getByTestId('modal-backdrop'))
    expect(onClose).toHaveBeenCalledTimes(3)
  })
  it('focuses the close button and locks body scroll while open', () => {
    const { unmount } = setup()
    expect(screen.getByRole('button', { name: 'Fechar' })).toHaveFocus()
    expect(document.body.style.overflow).toBe('hidden')
    unmount()
    expect(document.body.style.overflow).toBe('')
  })
  describe('focus management', () => {
    const renderWithButtons = () =>
      render(
        <Modal open title="Detalhamento" onClose={vi.fn()}>
          <button type="button">Primeiro</button>
          <button type="button">Último</button>
        </Modal>,
      )

    it('wraps Tab from the last focusable element to the first', async () => {
      renderWithButtons()
      screen.getByRole('button', { name: 'Último' }).focus()
      await userEvent.tab()
      expect(screen.getByRole('button', { name: 'Fechar' })).toHaveFocus()
    })
    it('wraps Shift+Tab from the first focusable element to the last', async () => {
      renderWithButtons()
      expect(screen.getByRole('button', { name: 'Fechar' })).toHaveFocus()
      await userEvent.tab({ shift: true })
      expect(screen.getByRole('button', { name: 'Último' })).toHaveFocus()
    })
    it('restores focus to the previously focused element after closing', () => {
      const ui = (open: boolean) => (
        <>
          <button type="button">Abrir</button>
          <Modal open={open} title="Detalhamento" onClose={vi.fn()}>
            <p>Conteúdo</p>
          </Modal>
        </>
      )
      const { rerender } = render(ui(false))
      const trigger = screen.getByRole('button', { name: 'Abrir' })
      trigger.focus()
      rerender(ui(true))
      expect(screen.getByRole('button', { name: 'Fechar' })).toHaveFocus()
      rerender(ui(false))
      expect(trigger).toHaveFocus()
    })
  })
})
