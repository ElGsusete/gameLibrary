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
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-white">Mejores juegos</h1>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div>
          <label htmlFor="min-reviews" className="mr-2 text-sm text-zinc-400">
            Mínimo de valoraciones:
          </label>
          <select
            id="min-reviews"
            value={minReviews}
            onChange={(e) => setMinReviews(Number(e.target.value))}
            className="rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-white focus:border-amber-500 focus:outline-none"
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
