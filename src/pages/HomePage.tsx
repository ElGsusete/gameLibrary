import { Link } from 'react-router-dom'
import { useGames } from '../hooks/useGames'
import { GameList } from '../components/GameList'
import { ArrowRight } from 'lucide-react'

export function HomePage() {
  const { gamesWithScores } = useGames()

  const byDate = [...gamesWithScores].sort(
    (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
  )
  const byScore = [...gamesWithScores]
    .filter((g) => g.averageScore != null)
    .sort((a, b) => (b.averageScore ?? 0) - (a.averageScore ?? 0))
    .slice(0, 10)

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-cp-light md:text-5xl">
          Tu lista de juegos
        </h1>
        <p className="mt-2 text-cp-muted">
          Añade juegos y puntúa. Estilo Letterboxd para videojuegos.
        </p>
      </section>

      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-cp-light">Últimos añadidos</h2>
          <Link
            to="/games"
            className="flex items-center gap-1 text-sm text-cp-neon hover:text-cp-neon/80 transition-colors"
          >
            Ver todos <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <GameList games={byDate.slice(0, 10)} emptyMessage="Aún no hay juegos. Añade el primero." />
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-cp-light">Mejor valorados</h2>
          <Link
            to="/games"
            className="flex items-center gap-1 text-sm text-cp-neon hover:text-cp-neon/80 transition-colors"
          >
            Ver todos <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <GameList
          games={byScore}
          emptyMessage="No hay valoraciones todavía."
        />
      </section>
    </div>
  )
}
