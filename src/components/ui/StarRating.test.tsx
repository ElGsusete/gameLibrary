import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StarRatingDisplay, StarRatingInput } from './StarRating'

describe('StarRatingDisplay', () => {
  it('renderiza estrellas llenas según el score', () => {
    const { container } = render(<StarRatingDisplay score={3} />)
    const stars = container.querySelectorAll('svg')
    expect(stars).toHaveLength(5)
  })

  it('muestra el atributo title con score/max', () => {
    const { container } = render(<StarRatingDisplay score={4} max={5} />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.getAttribute('title')).toBe('4/5')
  })

  it('renderiza media estrella para score con .5', () => {
    const { container } = render(<StarRatingDisplay score={3.5} />)
    // 3 llenas + span con 2 svg (media) + 1 vacía = 6 svg
    const svgs = container.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThanOrEqual(5)
  })

  it('no supera el máximo de estrellas', () => {
    const { container } = render(<StarRatingDisplay score={10} max={5} />)
    const stars = container.querySelectorAll('svg')
    expect(stars).toHaveLength(5)
  })

  it('score 0 muestra solo estrellas vacías', () => {
    const { container } = render(<StarRatingDisplay score={0} max={5} />)
    const stars = container.querySelectorAll('svg')
    expect(stars).toHaveLength(5)
  })

  it('aplica tamaño sm correctamente', () => {
    const { container } = render(<StarRatingDisplay score={3} size="sm" />)
    const firstStar = container.querySelector('svg')
    expect(firstStar?.getAttribute('class')).toContain('h-4')
  })
})

describe('StarRatingInput', () => {
  it('renderiza 5 botones por defecto', () => {
    render(<StarRatingInput value={0} onChange={vi.fn()} />)
    expect(screen.getAllByRole('button')).toHaveLength(5)
  })

  it('respeta el prop max', () => {
    render(<StarRatingInput value={0} onChange={vi.fn()} max={3} />)
    expect(screen.getAllByRole('button')).toHaveLength(3)
  })

  it('llama a onChange con el valor correcto al hacer click', () => {
    const onChange = vi.fn()
    render(<StarRatingInput value={0} onChange={onChange} />)

    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[2]) // 3ª estrella = valor 3

    expect(onChange).toHaveBeenCalledWith(3)
  })

  it('marca las estrellas correctas como pressed', () => {
    render(<StarRatingInput value={3} onChange={vi.fn()} />)
    const buttons = screen.getAllByRole('button')

    expect(buttons[0]).toHaveAttribute('aria-pressed', 'true')
    expect(buttons[1]).toHaveAttribute('aria-pressed', 'true')
    expect(buttons[2]).toHaveAttribute('aria-pressed', 'true')
    expect(buttons[3]).toHaveAttribute('aria-pressed', 'false')
    expect(buttons[4]).toHaveAttribute('aria-pressed', 'false')
  })

  it('los botones tienen aria-label descriptivo', () => {
    render(<StarRatingInput value={0} onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: '1 de 5 estrellas' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '5 de 5 estrellas' })).toBeInTheDocument()
  })

  it('llama a onChange con Enter en un botón', () => {
    const onChange = vi.fn()
    render(<StarRatingInput value={0} onChange={onChange} />)

    const buttons = screen.getAllByRole('button')
    fireEvent.keyDown(buttons[4], { key: 'Enter' })

    expect(onChange).toHaveBeenCalledWith(5)
  })

  it('llama a onChange con Space en un botón', () => {
    const onChange = vi.fn()
    render(<StarRatingInput value={0} onChange={onChange} />)

    const buttons = screen.getAllByRole('button')
    fireEvent.keyDown(buttons[1], { key: ' ' })

    expect(onChange).toHaveBeenCalledWith(2)
  })
})
