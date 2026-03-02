import type { Game } from '../types/game'

/** SteamSpy devuelve la lista de juegos (sin CORS si usas el proxy en dev). */
const STEAMSPY_BASE = '/steamspy'
const STEAM_STORE_BASE = '/steam-store'

export interface SteamAppListItem {
  appid: number
  name: string
}

/** Respuesta de SteamSpy api.php?request=all: objeto appid -> { appid, name, ... }. */
interface SteamSpyAllResponse {
  [appid: string]: { appid: number; name: string }
}

interface SteamAppDetailsRelease {
  date?: string
}

interface SteamAppDetailsPlatforms {
  windows?: boolean
  mac?: boolean
  linux?: boolean
}

interface SteamAppDetailsData {
  type?: string
  name?: string
  short_description?: string
  detailed_description?: string
  header_image?: string
  release_date?: SteamAppDetailsRelease
  platforms?: SteamAppDetailsPlatforms
}

interface SteamAppDetailsResponse {
  [appid: string]: {
    success: boolean
    data?: SteamAppDetailsData
  }
}

const APP_LIST_CACHE_KEY = 'steam-app-list'
const APP_LIST_CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 horas

function getCachedAppList(): SteamAppListItem[] | null {
  try {
    const raw = localStorage.getItem(APP_LIST_CACHE_KEY)
    if (!raw) return null
    const { data, at } = JSON.parse(raw) as { data: SteamAppListItem[]; at: number }
    if (Date.now() - at > APP_LIST_CACHE_TTL_MS) return null
    return data
  } catch {
    return null
  }
}

function setCachedAppList(apps: SteamAppListItem[]): void {
  try {
    localStorage.setItem(
      APP_LIST_CACHE_KEY,
      JSON.stringify({ data: apps, at: Date.now() })
    )
  } catch {
    // ignore
  }
}

/** Obtiene la lista de juegos desde SteamSpy (cacheada 24h). En dev las peticiones pasan por el proxy para evitar CORS. */
export async function fetchSteamAppList(): Promise<SteamAppListItem[]> {
  const cached = getCachedAppList()
  if (cached && cached.length > 0) return cached

  const url = `${STEAMSPY_BASE}/api.php?request=all`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`SteamSpy: ${res.status}`)
  const json = (await res.json()) as SteamSpyAllResponse
  const apps: SteamAppListItem[] = Object.values(json)
    .filter((item) => item?.appid != null && item?.name != null)
    .map((item) => ({ appid: item.appid, name: item.name }))
  if (apps.length > 0) setCachedAppList(apps)
  return apps
}

/** Busca en la lista de Steam por nombre (usa lista cacheada o la descarga desde SteamSpy). */
export async function searchSteamApps(
  query: string,
  maxResults = 30
): Promise<SteamAppListItem[]> {
  if (!query.trim()) return []
  const list = await fetchSteamAppList()
  const lower = query.toLowerCase().trim()
  const filtered = list.filter(
    (app) => app.name && app.name.toLowerCase().includes(lower)
  )
  return filtered.slice(0, maxResults)
}

/** Detalle de un app desde la Store API. Permite detectar type === "game" y mapear a Game. */
export async function fetchSteamAppDetails(
  appid: number,
  lang = 'spanish'
): Promise<SteamAppDetailsData | null> {
  const url = `${STEAM_STORE_BASE}/api/appdetails?appids=${appid}&l=${lang}`
  const res = await fetch(url)
  if (!res.ok) return null
  const json = (await res.json()) as SteamAppDetailsResponse
  const entry = json[String(appid)]
  if (!entry?.success || !entry.data) return null
  return entry.data
}

function parseYearFromDate(dateStr?: string): number | undefined {
  if (!dateStr) return undefined
  const match = dateStr.match(/\d{4}/)
  return match ? parseInt(match[0], 10) : undefined
}

function platformsFromSteam(platforms?: SteamAppDetailsPlatforms): string[] {
  if (!platforms) return []
  const out: string[] = []
  if (platforms.windows) out.push('PC (Windows)')
  if (platforms.mac) out.push('Mac')
  if (platforms.linux) out.push('Linux')
  return out
}

/** Convierte la respuesta de appdetails a tu tipo Game. */
export function steamAppDetailsToGame(
  appid: number,
  data: SteamAppDetailsData
): Omit<Game, 'addedAt'> & { addedAt: string } {
  return {
    id: String(appid),
    title: data.name ?? 'Sin nombre',
    year: parseYearFromDate(data.release_date?.date),
    coverImage: data.header_image,
    platform: platformsFromSteam(data.platforms).length
      ? platformsFromSteam(data.platforms)
      : undefined,
    description: data.short_description ?? undefined,
    addedAt: new Date().toISOString(),
  }
}
