import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useGames } from '../hooks/useGames'
import { GameList } from '../components/GameList'

const MIN_REVIEWS_OPTIONS = [0, 1, 2, 3, 4, 5, 10] as const

export function TopGamesPage() {
  const { gamesWithScores } = useGames()
  const [searchParams, setSearchParams] = useSearchParams()
  const [minReviews, setMinReviews] = useState<number>(0)

  useEffect(() => {
    const param = searchParams.get('minReviews')
    const value = param != null ? Number(param) : 0
    setMinReviews(Number.isNaN(value) ? 0 : value)
  }, [searchParams])

  const updateMinReviews = (value: number) => {
    setMinReviews(value)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value > 0) next.set('minReviews', String(value))
      else next.delete('minReviews')
      return next
    }, { replace: true })
  }

  const filteredAndSorted = useMemo(() => {
    let list = gamesWithScores.filter((g) => g.ratingCount >= minReviews)
    list = [...list].sort((a, b) => {
      const scoreA = a.averageScore ?? -1
      const scoreB = b.averageScore ?? -1
      if (scoreB !== scoreA) return scoreB - scoreA
      return b.ratingCount - a.ratingCount
    })
    return list
  }, [gamesWithScores, minReviews])

  const emptyMessage =
    minReviews > 0
      ? `No hay juegos con al menos ${minReviews} valoración${minReviews !== 1 ? 'es' : ''}.`
      : 'No hay juegos.'

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-center text-3xl font-bold text-cp-light">Mejores juegos</h1>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex flex-col gap-1">
          <span className="mr-2 text-sm text-cp-muted">Mínimo de valoraciones:</span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => updateMinReviews(0)}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                minReviews === 0
                  ? 'border-cp-neon bg-cp-neon text-cp-black'
                  : 'border-cp-surface bg-cp-dark text-cp-muted hover:border-cp-neon hover:text-cp-light'
              }`}
            >
              Todos
            </button>
            {MIN_REVIEWS_OPTIONS.filter((n) => n > 0).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => updateMinReviews(n)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  minReviews === n
                    ? 'border-cp-neon bg-cp-neon text-cp-black'
                    : 'border-cp-surface bg-cp-dark text-cp-muted hover:border-cp-neon hover:text-cp-light'
                }`}
              >
                Al menos {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      <GameList games={filteredAndSorted} emptyMessage={emptyMessage} />
    </div>
  )
}
