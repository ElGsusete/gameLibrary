import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AddGameForm } from './AddGameForm'
import type { AddGameSubmitValues } from './AddGameForm'

function renderForm(onSubmit = vi.fn()) {
  render(<AddGameForm onSubmit={onSubmit} />)
  return { onSubmit }
}

function getField(label: RegExp | string) {
  return screen.getByLabelText(label)
}

describe('AddGameForm', () => {
  it('renderiza todos los campos y el botón de submit', () => {
    renderForm()
    expect(screen.getByLabelText(/título/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/año/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/portada/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/plataformas/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /añadir juego/i })).toBeInTheDocument()
  })

  it('muestra error si se envía sin título', async () => {
    renderForm()
    fireEvent.submit(screen.getByRole('button', { name: /añadir juego/i }).closest('form')!)
    await waitFor(() => {
      expect(screen.getByText(/título es obligatorio/i)).toBeInTheDocument()
    })
  })

  it('llama a onSubmit con los valores correctos en un envío válido', async () => {
    const { onSubmit } = renderForm()

    fireEvent.change(getField(/título/i), { target: { value: 'Elden Ring' } })
    fireEvent.change(getField(/año/i), { target: { value: '2022' } })
    fireEvent.change(getField(/plataformas/i), { target: { value: 'PC, PlayStation' } })

    fireEvent.submit(screen.getByRole('button', { name: /añadir juego/i }).closest('form')!)

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledOnce()
    })

    const args: AddGameSubmitValues = onSubmit.mock.calls[0][0]
    expect(args.title).toBe('Elden Ring')
    expect(args.year).toBe(2022)
    expect(args.platform).toEqual(['PC', 'PlayStation'])
  })

  it('split de plataformas por coma y elimina espacios', async () => {
    const { onSubmit } = renderForm()

    fireEvent.change(getField(/título/i), { target: { value: 'Test' } })
    fireEvent.change(getField(/plataformas/i), { target: { value: ' PC ,  Xbox , Nintendo Switch ' } })

    fireEvent.submit(screen.getByRole('button', { name: /añadir juego/i }).closest('form')!)

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce())
    expect(onSubmit.mock.calls[0][0].platform).toEqual(['PC', 'Xbox', 'Nintendo Switch'])
  })

  it('muestra error para URL de portada inválida', async () => {
    renderForm()
    fireEvent.change(getField(/título/i), { target: { value: 'Juego' } })
    fireEvent.change(getField(/portada/i), { target: { value: 'no-es-url' } })

    fireEvent.submit(screen.getByRole('button', { name: /añadir juego/i }).closest('form')!)

    await waitFor(() => {
      expect(screen.getByText(/url inválida/i)).toBeInTheDocument()
    })
  })

  it('acepta un título sin campos opcionales', async () => {
    const { onSubmit } = renderForm()
    fireEvent.change(getField(/título/i), { target: { value: 'Solo título' } })
    fireEvent.submit(screen.getByRole('button', { name: /añadir juego/i }).closest('form')!)

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce())
    expect(onSubmit.mock.calls[0][0].title).toBe('Solo título')
  })
})
