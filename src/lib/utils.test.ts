import { describe, it, expect } from 'vitest'
import { cn, formatDate } from './utils'

describe('cn', () => {
  it('joins class names', () => {
    expect(cn('a', 'b')).toBe('a b')
  })
  it('filters falsy values', () => {
    expect(cn('a', undefined, 'b', false)).toBe('a b')
  })
  it('returns empty string when all falsy', () => {
    expect(cn(undefined, false)).toBe('')
  })
})

describe('formatDate', () => {
  it('formats ISO date in es-ES', () => {
    const result = formatDate('2024-06-15T00:00:00.000Z')
    expect(result).toMatch(/\d{1,2}/)
    expect(result).toMatch(/2024/)
  })
})
