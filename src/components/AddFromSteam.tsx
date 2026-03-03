import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGames } from '../hooks/useGames'
import {
  searchSteamApps,
  fetchSteamAppDetails,
  steamAppDetailsToGame,
  type SteamAppListItem,
} from '../services/steamApi'

const DEBOUNCE_MS = 350
const MIN_QUERY_LENGTH = 2
const STEAM_HEADER_URL = (appid: number) =>
  `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/header.jpg`

function SteamResultThumb({ appid }: { appid: number }) {
  const [imgError, setImgError] = useState(false)
  if (imgError) {
    return (
      <div className="h-12 w-[92px] shrink-0 rounded bg-cp-surface flex items-center justify-center text-[10px] text-cp-muted">
        Sin img
      </div>
    )
  }
  return (
    <img
      src={STEAM_HEADER_URL(appid)}
      alt=""
      className="h-12 w-[92px] shrink-0 rounded object-cover"
      onError={() => setImgError(true)}
    />
  )
}

export function AddFromSteam() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SteamAppListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [detailLoading, setDetailLoading] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const searchIdRef = useRef(0)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { addGame, getGameById } = useGames()
  const navigate = useNavigate()

  const runSearch = useCallback(async (searchQuery: string, currentId: number) => {
    const q = searchQuery.trim()
    if (q.length < MIN_QUERY_LENGTH) {
      setResults([])
      setLoading(false)
      return
    }
    setError(null)
    setLoading(true)
    try {
      const list = await searchSteamApps(q, 25)
      if (currentId === searchIdRef.current) {
        setResults(list)
      }
    } catch (e) {
      if (currentId === searchIdRef.current) {
        setError(
          e instanceof Error ? e.message : 'Error al buscar en Steam. ¿Tienes el servidor de desarrollo en marcha (npm run dev)?'
        )
        setResults([])
      }
    } finally {
      if (currentId === searchIdRef.current) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    if (query.trim().length < MIN_QUERY_LENGTH) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = null
      }
      setResults([])
      setLoading(false)
      setError(null)
      return
    }
    const id = ++searchIdRef.current
    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null
      runSearch(query, id)
    }, DEBOUNCE_MS)
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = null
      }
    }
  }, [query, runSearch])

  const runSearchNow = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
    const q = query.trim()
    if (q.length >= MIN_QUERY_LENGTH) {
      const id = ++searchIdRef.current
      runSearch(q, id)
    }
  }, [query, runSearch])

  const handleSelect = useCallback(
    async (app: SteamAppListItem) => {
      if (getGameById(String(app.appid))) {
        navigate(`/games/${app.appid}`)
        return
      }
      setDetailLoading(app.appid)
      setError(null)
      try {
        const data = await fetchSteamAppDetails(app.appid)
        if (!data) {
          setError('No se pudo cargar el detalle del juego.')
          return
        }
        if (data.type && data.type !== 'game') {
          setError(`"${data.name}" no es un juego (tipo: ${data.type}). No se ha añadido.`)
          return
        }
        const game = steamAppDetailsToGame(app.appid, data)
        addGame({
          id: game.id,
          title: game.title,
          year: game.year,
          coverImage: game.coverImage,
          platform: game.platform,
          description: game.description,
        })
        navigate(`/games/${game.id}`)
      } catch (e) {
        setError(
          e instanceof Error ? e.message : 'Error al importar el juego.'
        )
      } finally {
        setDetailLoading(null)
      }
    },
    [addGame, getGameById, navigate]
  )

  return (
    <div className="mx-auto w-full max-w-xl space-y-4 rounded-xl border border-cp-surface bg-cp-dark/80 p-6">
      <h2 className="text-lg font-semibold text-cp-light">Importar desde Steam</h2>
      <p className="text-sm text-cp-muted">
        Escribe al menos {MIN_QUERY_LENGTH} caracteres; la búsqueda se actualiza al dejar de escribir. La primera vez puede tardar (se descarga la lista de Steam).
      </p>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && runSearchNow()}
        placeholder="Nombre del juego en Steam"
        className="w-full rounded-lg border border-cp-surface bg-cp-black px-3 py-2 text-cp-light placeholder-cp-muted focus:border-cp-neon focus:outline-none focus:ring-1 focus:ring-cp-neon"
      />
      {loading && (
        <p className="text-sm text-cp-muted">Buscando…</p>
      )}
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
      {results.length > 0 && (
        <ul className="max-h-96 space-y-2 overflow-y-auto rounded-lg border border-cp-surface bg-cp-black p-2">
          {results.map((app) => (
            <li key={app.appid}>
              <button
                type="button"
                onClick={() => handleSelect(app)}
                disabled={detailLoading === app.appid}
                className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm text-cp-light hover:bg-cp-surface disabled:opacity-50 transition-colors"
              >
                <SteamResultThumb appid={app.appid} />
                <span className="min-w-0 flex-1 truncate font-medium">{app.name}</span>
                <span className="shrink-0 text-cp-muted">({app.appid})</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
