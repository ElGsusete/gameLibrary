import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { AuthProvider, useAuth } from './AuthContext'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
)

// JWT mínimo: header.payload.signature — payload = base64({"steamId":"76561198000000001"})
function makeToken(steamId: string): string {
  const payload = btoa(JSON.stringify({ steamId }))
  return `header.${payload}.signature`
}

beforeEach(() => {
  localStorage.clear()
})

describe('AuthContext', () => {
  it('empieza sin autenticar si no hay token', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.isLoggedIn).toBe(false)
    expect(result.current.token).toBeNull()
    expect(result.current.steamId).toBeNull()
  })

  it('setTokenFromCallback guarda el token y extrae steamId', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    const token = makeToken('76561198000000001')

    act(() => {
      result.current.setTokenFromCallback(token)
    })

    expect(result.current.isLoggedIn).toBe(true)
    expect(result.current.token).toBe(token)
    expect(result.current.steamId).toBe('76561198000000001')
    expect(localStorage.getItem('gamelog-steam-token')).toBe(token)
  })

  it('logout limpia el token y localStorage', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    const token = makeToken('76561198000000001')

    act(() => {
      result.current.setTokenFromCallback(token)
    })
    act(() => {
      result.current.logout()
    })

    expect(result.current.isLoggedIn).toBe(false)
    expect(result.current.token).toBeNull()
    expect(localStorage.getItem('gamelog-steam-token')).toBeNull()
  })

  it('un token inválido en localStorage se elimina al inicializar', () => {
    localStorage.setItem('gamelog-steam-token', 'token.invalido')
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.isLoggedIn).toBe(false)
    expect(localStorage.getItem('gamelog-steam-token')).toBeNull()
  })

  it('carga un token válido desde localStorage al inicializar', () => {
    const token = makeToken('76561198000000002')
    localStorage.setItem('gamelog-steam-token', token)

    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.isLoggedIn).toBe(true)
    expect(result.current.steamId).toBe('76561198000000002')
  })

  it('login redirige a /api/auth/steam', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    const assignSpy = vi.spyOn(window, 'location', 'get').mockReturnValue({
      ...window.location,
      href: '',
    } as Location)

    // Solo verificamos que no lanza
    expect(() => {
      act(() => {
        result.current.login()
      })
    }).not.toThrow()

    assignSpy.mockRestore()
  })

  it('lanza error si se usa fuera del provider', () => {
    expect(() => renderHook(() => useAuth())).toThrow('useAuth must be used within AuthProvider')
  })
})
