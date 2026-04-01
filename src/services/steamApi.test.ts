import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  searchSteamApps,
  fetchSteamAppList,
  steamAppDetailsToGame,
  type SteamAppListItem,
} from './steamApi'

const CACHE_KEY = 'steam-app-list'

function setCacheWith(apps: SteamAppListItem[], age = 0) {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ data: apps, at: Date.now() - age }))
}

const sampleApps: SteamAppListItem[] = [
  { appid: 220, name: 'Half-Life 2' },
  { appid: 400, name: 'Portal' },
  { appid: 730, name: 'Counter-Strike 2' },
  { appid: 570, name: 'Dota 2' },
]

beforeEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('searchSteamApps', () => {
  it('devuelve array vacío para query vacía', async () => {
    setCacheWith(sampleApps)
    const result = await searchSteamApps('')
    expect(result).toEqual([])
  })

  it('devuelve array vacío para query solo espacios', async () => {
    setCacheWith(sampleApps)
    const result = await searchSteamApps('   ')
    expect(result).toEqual([])
  })

  it('filtra por nombre (case-insensitive)', async () => {
    setCacheWith(sampleApps)
    const result = await searchSteamApps('portal')
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Portal')
  })

  it('respeta maxResults', async () => {
    setCacheWith(sampleApps)
    const result = await searchSteamApps('2', 1)
    expect(result).toHaveLength(1)
  })

  it('devuelve todos los matches hasta el límite por defecto (30)', async () => {
    setCacheWith(sampleApps)
    const result = await searchSteamApps('2')
    // Half-Life 2, Counter-Strike 2, Dota 2
    expect(result).toHaveLength(3)
  })
})

describe('fetchSteamAppList', () => {
  it('usa la caché si está vigente', async () => {
    setCacheWith(sampleApps)
    const fetchSpy = vi.spyOn(globalThis, 'fetch')

    const result = await fetchSteamAppList()

    expect(fetchSpy).not.toHaveBeenCalled()
    expect(result).toEqual(sampleApps)
  })

  it('ignora la caché si ha expirado (>24h)', async () => {
    const msIn25h = 25 * 60 * 60 * 1000
    setCacheWith(sampleApps, msIn25h)

    const mockResponse = { '220': { appid: 220, name: 'Half-Life 2' } }
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response)

    const result = await fetchSteamAppList()
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Half-Life 2')
  })

  it('lanza error si la respuesta no es ok', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 503,
    } as Response)

    await expect(fetchSteamAppList()).rejects.toThrow('SteamSpy: 503')
  })
})

describe('steamAppDetailsToGame', () => {
  it('mapea campos básicos correctamente', () => {
    const game = steamAppDetailsToGame(570, {
      name: 'Dota 2',
      short_description: 'MOBA gratuito',
      header_image: 'https://cdn.example.com/dota2.jpg',
      release_date: { date: '9 Jul, 2013' },
      platforms: { windows: true, mac: true, linux: true },
      metacritic: { score: 90 },
      recommendations: { total: 1000000 },
    })

    expect(game.id).toBe('570')
    expect(game.title).toBe('Dota 2')
    expect(game.description).toBe('MOBA gratuito')
    expect(game.coverImage).toBe('https://cdn.example.com/dota2.jpg')
    expect(game.year).toBe(2013)
    expect(game.platform).toEqual(['PC (Windows)', 'Mac', 'Linux'])
    expect(game.steamScore).toBe(90)
    expect(game.steamReviewsCount).toBe(1000000)
  })

  it('usa "Sin nombre" si no hay nombre', () => {
    const game = steamAppDetailsToGame(1, {})
    expect(game.title).toBe('Sin nombre')
  })

  it('devuelve platform undefined si no hay plataformas', () => {
    const game = steamAppDetailsToGame(1, { name: 'Test' })
    expect(game.platform).toBeUndefined()
  })

  it('devuelve year undefined si no hay fecha', () => {
    const game = steamAppDetailsToGame(1, { name: 'Sin fecha' })
    expect(game.year).toBeUndefined()
  })

  it('no incluye steamScore si metacritic no es número', () => {
    const game = steamAppDetailsToGame(1, { name: 'Test', metacritic: {} })
    expect(game.steamScore).toBeUndefined()
  })

  it('construye plataformas solo con las presentes', () => {
    const game = steamAppDetailsToGame(1, {
      name: 'Solo Windows',
      platforms: { windows: true, mac: false, linux: false },
    })
    expect(game.platform).toEqual(['PC (Windows)'])
  })
})
