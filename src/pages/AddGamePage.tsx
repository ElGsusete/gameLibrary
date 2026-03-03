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
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <h1 className="mb-8 text-center text-3xl font-bold text-cp-light">Añadir juego</h1>
      {steamImportState === 'loading' && (
        <div className="mb-6 rounded-md border border-cp-surface bg-cp-dark px-3 py-4 text-center text-sm text-cp-light">
          Importando desde Steam… Redirigiendo a la página del juego para asignar tu valoración.
        </div>
      )}
      {steamImportState === 'error' && steamError && (
        <div className="mb-6 rounded-md border border-red-500/60 bg-red-950/80 px-3 py-2 text-sm text-red-200">
          {steamError}
        </div>
      )}
      <div className="mb-10 flex justify-center">
        <AddFromSteam />
      </div>
      <h2 className="mb-4 text-center text-xl font-semibold text-cp-light">Añadir manualmente</h2>
      <div className="flex justify-center">
        <AddGameForm onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
