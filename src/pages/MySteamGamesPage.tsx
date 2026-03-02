import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'

const STEAM_HEADER_URL = (appid: number) =>
  `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/header.jpg`

type SteamOwnedGame = {
  appid: number
  name: string
  playtime_forever?: number
  playtime_2weeks?: number
  img_icon_url?: string
  img_logo_url?: string
}

function SteamGameCard({
  game: g,
  formatHours,
}: {
  game: SteamOwnedGame
  formatHours: (min: number) => string
}) {
  const [imgError, setImgError] = useState(false)
  const showImg = !imgError
  return (
    <div className="flex h-full flex-col">
      <div className="relative aspect-[460/215] w-full shrink-0 bg-zinc-800">
        {showImg ? (
          <img
            src={STEAM_HEADER_URL(g.appid)}
            alt=""
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-500 text-xs">
            Sin imagen
          </div>
        )}
      </div>
      <div className="flex min-h-0 flex-1 flex-col p-3">
        <p className="truncate font-medium text-white" title={g.name}>{g.name}</p>
        {g.playtime_forever != null && g.playtime_forever > 0 && (
          <p className="text-sm text-zinc-500">{formatHours(g.playtime_forever)}</p>
        )}
        <Link
          to={`/add-game?steam=${g.appid}`}
          className="mt-auto pt-2 text-sm text-amber-400 hover:text-amber-300"
        >
          Añadir a GameLog
        </Link>
      </div>
    </div>
  )
}

export function MySteamGamesPage() {
  const { token, isLoggedIn } = useAuth()
  const [games, setGames] = useState<SteamOwnedGame[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nameFilter, setNameFilter] = useState('')

  useEffect(() => {
    if (!token || !isLoggedIn) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    fetch('/api/me/games', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 401 ? 'Sesión inválida' : 'Error al cargar')
        return res.json()
      })
      .then((data) => {
        setGames(data.games || [])
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'Error')
        setGames([])
      })
      .finally(() => setLoading(false))
  }, [token, isLoggedIn])

  if (!isLoggedIn) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-8 text-center">
        <h1 className="mb-6 text-3xl font-bold text-white">Mis juegos de Steam</h1>
        <p className="text-zinc-400">
          Inicia sesión con Steam para ver tu biblioteca aquí.
        </p>
      </div>
    )
  }

  const formatHours = (minutes: number) => {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    if (h > 0) return `${h} h ${m > 0 ? `${m} min` : ''}`
    return `${m} min`
  }

  const filteredGames = nameFilter.trim()
    ? games.filter((g) =>
        g.name.toLowerCase().includes(nameFilter.trim().toLowerCase())
      )
    : games

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-center text-3xl font-bold text-white">Mis juegos de Steam</h1>

      {loading && <p className="text-center text-zinc-400">Cargando tu biblioteca…</p>}
      {error && <p className="text-center text-red-400">{error}</p>}

      {!loading && !error && games.length === 0 && (
        <p className="text-center text-zinc-400">
          No se encontraron juegos. Comprueba que tu perfil de Steam sea público.
        </p>
      )}

      {!loading && games.length > 0 && (
        <>
          <div className="mx-auto mb-6 max-w-5xl">
            <label htmlFor="steam-name-search" className="sr-only">
              Buscar por nombre
            </label>
            <input
              id="steam-name-search"
              type="text"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              placeholder="Buscar por nombre…"
              className="w-full max-w-md rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            {nameFilter.trim() && (
              <p className="mt-2 text-sm text-zinc-500">
                {filteredGames.length} de {games.length} juegos
              </p>
            )}
          </div>
          <ul className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredGames.map((g) => (
              <li
                key={g.appid}
                className="rounded-xl border border-zinc-800 bg-zinc-900/80 overflow-hidden transition hover:border-zinc-700"
              >
                <SteamGameCard game={g} formatHours={formatHours} />
              </li>
            ))}
          </ul>
          {filteredGames.length === 0 && nameFilter.trim() && (
            <p className="text-center text-zinc-400">Ningún juego coincide con la búsqueda.</p>
          )}
        </>
      )}
    </div>
  )
}
