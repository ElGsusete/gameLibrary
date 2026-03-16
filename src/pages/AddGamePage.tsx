import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useGames } from '../hooks/useGames'
import { AddGameForm, type AddGameSubmitValues } from '../components/AddGameForm'
import { AddFromSteam } from '../components/AddFromSteam'
import { fetchSteamAppDetails, steamAppDetailsToGame } from '../services/steamApi'

export function AddGamePage() {
  const { addGame, getGameById } = useGames()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [steamImportState, setSteamImportState] = useState<'idle' | 'loading' | 'error'>('idle')
  const [steamError, setSteamError] = useState<string | null>(null)
  const steamImportStartedRef = useRef<string | null>(null)

  const steamAppId = searchParams.get('steam')

  useEffect(() => {
    if (!steamAppId) {
      setSteamImportState('idle')
      steamImportStartedRef.current = null
      return
    }
    const appid = parseInt(steamAppId, 10)
    if (Number.isNaN(appid) || appid <= 0) {
      setSteamImportState('error')
      setSteamError('ID de Steam inválido.')
      steamImportStartedRef.current = null
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.delete('steam')
        return next
      }, { replace: true })
      return
    }

    const existing = getGameById(String(appid))
    if (existing) {
      navigate(`/games/${appid}`, { replace: true })
      return
    }

    if (steamImportStartedRef.current === steamAppId) return
    steamImportStartedRef.current = steamAppId

    setSteamImportState('loading')
    setSteamError(null)
    fetchSteamAppDetails(appid)
      .then((data) => {
        if (!data) {
          steamImportStartedRef.current = null
          setSteamError('No se pudo cargar el detalle del juego.')
          setSteamImportState('error')
          return
        }
        if (data.type && data.type !== 'game') {
          steamImportStartedRef.current = null
          setSteamError(`"${data.name}" no es un juego (tipo: ${data.type}).`)
          setSteamImportState('error')
          return
        }
        const game = steamAppDetailsToGame(appid, data)
        addGame({
          id: game.id,
          title: game.title,
          year: game.year,
          coverImage: game.coverImage,
          platform: game.platform,
          description: game.description,
        })
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev)
          next.delete('steam')
          return next
        }, { replace: true })
        navigate(`/games/${game.id}`, { replace: true })
      })
      .catch((e) => {
        steamImportStartedRef.current = null
        setSteamError(e instanceof Error ? e.message : 'Error al importar desde Steam.')
        setSteamImportState('error')
      })
  }, [steamAppId, addGame, getGameById, navigate, setSearchParams])

  const handleSubmit = (values: AddGameSubmitValues) => {
    const id = addGame({
      title: values.title,
      year: values.year,
      coverImage: values.coverImage,
      platform: values.platform,
      description: values.description,
    })
    navigate(`/games/${id}`)
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 lg:flex-row lg:items-start">
      <div className="w-full lg:w-7/12">
        <h1 className="mb-2 text-center text-3xl font-bold text-cp-light lg:text-left">
          Añadir juego
        </h1>
        <p className="mb-4 text-center text-sm text-cp-muted lg:text-left">
          Empieza buscando tu juego en Steam. Es la forma más rápida y precisa de añadirlo.
        </p>
        {steamImportState === 'loading' && (
          <div className="mb-4 rounded-xl border border-cp-neon/60 bg-cp-black/80 px-4 py-3 text-center text-sm text-cp-light shadow-md">
            Importando desde Steam… Redirigiendo a la página del juego para asignar tu valoración.
          </div>
        )}
        {steamImportState === 'error' && steamError && (
          <div className="mb-4 rounded-xl border border-red-500/70 bg-red-950/90 px-4 py-3 text-sm text-red-200 shadow-md">
            {steamError}
          </div>
        )}
        <div className="rounded-2xl border border-cp-neon/60 bg-cp-black/80 p-6 shadow-2xl backdrop-blur-sm">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-cp-light lg:text-left">
              Importar desde Steam
            </h2>
            <span className="rounded-full border border-cp-neon/60 bg-cp-neon/10 px-3 py-0.5 text-xs font-medium uppercase tracking-wide text-cp-neon">
              Recomendado
            </span>
          </div>
          <p className="mb-4 text-sm text-cp-muted">
            Pega el ID de la app de Steam para añadir el juego automáticamente con su título, año y portada.
          </p>
          <div className="flex justify-center">
            <AddFromSteam />
          </div>
        </div>
      </div>

      <div className="w-full lg:w-5/12">
        <h2 className="mb-4 text-center text-xl font-semibold text-cp-light lg:text-left">Añadir manualmente</h2>
        <div className="rounded-2xl border border-cp-surface/80 bg-cp-black/80 p-6 shadow-2xl backdrop-blur-sm sm:p-7 lg:p-8">
          <AddGameForm onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  )
}
