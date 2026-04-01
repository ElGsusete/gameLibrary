import { Link } from 'react-router-dom'
import { useGames } from '../hooks/useGames'
import { GameList } from '../components/GameList'
import { ArrowRight, Gamepad2, ListPlus, LayoutGrid } from 'lucide-react'

function SectionHeader({ title, count, to }: { title: string; count: number; to: string }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h2 className="border-l-2 border-cp-neon pl-3 text-xl font-semibold text-cp-light">
          {title}
        </h2>
        {count > 0 && (
          <span className="rounded bg-cp-surface border border-cp-border px-2 py-0.5 text-xs text-cp-muted">
            {count}
          </span>
        )}
      </div>
      <Link
        to={to}
        className="flex items-center gap-1 text-sm text-cp-neon hover:text-cp-neon/80 transition-colors"
      >
        Ver todos <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}

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

      {/* Hero */}
      <section
        className="mb-12 flex flex-col items-center justify-center rounded-2xl border border-cp-border px-6 py-14 text-center relative overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse at 50% 60%, rgba(16,185,129,0.07) 0%, transparent 70%)',
          backgroundSize: '100% 100%',
        }}
      >
        {/* Grid pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'linear-gradient(rgba(63,63,70,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(63,63,70,0.4) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
          aria-hidden
        />

        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="rounded-2xl border border-cp-neon/30 bg-cp-neon/10 p-4 glow-neon">
            <Gamepad2 className="h-12 w-12 text-cp-neon" aria-hidden />
          </div>

          <h1
            className="text-5xl font-bold md:text-6xl"
            style={{
              background: 'linear-gradient(135deg, #fafafa 30%, #a1a1aa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            GameLog
          </h1>

          <p className="max-w-md text-cp-muted text-base">
            Tu colección de videojuegos personal. Letterboxd para gamers.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
            <Link
              to="/add-game"
              className="flex items-center gap-2 rounded-lg bg-cp-neon px-5 py-2.5 text-sm font-semibold text-cp-black hover:bg-cp-neon-dim transition-colors"
            >
              <ListPlus className="h-4 w-4" aria-hidden />
              Añadir juego
            </Link>
            <Link
              to="/games"
              className="flex items-center gap-2 rounded-lg border border-cp-border px-5 py-2.5 text-sm font-medium text-cp-light hover:border-cp-neon/50 hover:text-cp-neon transition-colors"
            >
              <LayoutGrid className="h-4 w-4" aria-hidden />
              Ver colección
            </Link>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <SectionHeader title="Últimos añadidos" count={Math.min(byDate.length, 10)} to="/games" />
        <GameList games={byDate.slice(0, 10)} emptyMessage="Aún no hay juegos. Añade el primero." />
      </section>

      <section>
        <SectionHeader title="Mejor valorados" count={byScore.length} to="/top" />
        <GameList games={byScore} emptyMessage="No hay valoraciones todavía." />
      </section>
    </div>
  )
}
