import { GameCard } from './GameCard'
import type { Game } from '../types/game'

type GameWithScores = Game & { averageScore: number | null; ratingCount: number }

export function GameList({
  games,
  emptyMessage = 'No hay juegos.',
}: {
  games: GameWithScores[]
  emptyMessage?: string
}) {
  if (games.length === 0) {
    return (
      <p className="py-12 text-center text-zinc-500">{emptyMessage}</p>
    )
  }
  return (
    <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {games.map((game) => (
        <li key={game.id}>
          <GameCard game={game} />
        </li>
      ))}
    </ul>
  )
}
