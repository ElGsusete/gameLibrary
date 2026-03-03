import { useMemo, useState } from 'react'
import { useGames } from '../hooks/useGames'
import { GameList } from '../components/GameList'

const MIN_REVIEWS_OPTIONS = [0, 1, 2, 3, 4, 5, 10] as const

export function TopGamesPage() {
  const { gamesWithScores } = useGames()
  const [minReviews, setMinReviews] = useState<number>(0)

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
        <div>
          <label htmlFor="min-reviews" className="mr-2 text-sm text-cp-muted">
            Mínimo de valoraciones:
          </label>
          <select
            id="min-reviews"
            value={minReviews}
            onChange={(e) => setMinReviews(Number(e.target.value))}
            className="rounded border border-cp-surface bg-cp-dark px-3 py-1.5 text-cp-light focus:border-cp-neon focus:outline-none"
          >
            <option value={0}>Todos</option>
            {MIN_REVIEWS_OPTIONS.filter((n) => n > 0).map((n) => (
              <option key={n} value={n}>
                Al menos {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      <GameList games={filteredAndSorted} emptyMessage={emptyMessage} />
    </div>
  )
}
