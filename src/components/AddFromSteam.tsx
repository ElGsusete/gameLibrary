import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGames } from '../hooks/useGames'
import {
  searchSteamApps,
  fetchSteamAppDetails,
  steamAppDetailsToGame,
  type SteamAppListItem,
} from '../services/steamApi'

export function AddFromSteam() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SteamAppListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [detailLoading, setDetailLoading] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { addGame, getGameById } = useGames()
  const navigate = useNavigate()

  const runSearch = useCallback(async () => {
    if (!query.trim()) {
      setResults([])
      return
    }
    setError(null)
    setLoading(true)
    try {
      const list = await searchSteamApps(query.trim(), 25)
      setResults(list)
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Error al buscar en Steam. ¿Tienes el servidor de desarrollo en marcha (npm run dev)?'
      )
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [query])

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
    <div className="mx-auto max-w-xl space-y-4 rounded-xl border border-zinc-700 bg-zinc-800/50 p-6">
      <h2 className="text-lg font-semibold text-white">Importar desde Steam</h2>
      <p className="text-sm text-zinc-400">
        Busca por nombre y añade el juego a tu biblioteca. La primera búsqueda puede tardar (se descarga la lista de Steam).
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && runSearch()}
          placeholder="Nombre del juego en Steam"
          className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
        <button
          type="button"
          onClick={runSearch}
          disabled={loading}
          className="rounded-lg bg-amber-500 px-4 py-2 font-medium text-zinc-950 hover:bg-amber-400 disabled:opacity-50"
        >
          {loading ? 'Buscando…' : 'Buscar'}
        </button>
      </div>
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
      {results.length > 0 && (
        <ul className="max-h-72 space-y-1 overflow-y-auto rounded-lg border border-zinc-700 bg-zinc-900 p-2">
          {results.map((app) => (
            <li key={app.appid}>
              <button
                type="button"
                onClick={() => handleSelect(app)}
                disabled={detailLoading === app.appid}
                className="w-full rounded px-2 py-2 text-left text-sm text-white hover:bg-zinc-700 disabled:opacity-50"
              >
                {detailLoading === app.appid ? 'Cargando…' : app.name}
                <span className="ml-2 text-zinc-500">({app.appid})</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
