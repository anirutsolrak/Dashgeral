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
})
