import { Link } from 'react-router-dom'
import { Gamepad2, Home, ListPlus, LayoutGrid, Trophy } from 'lucide-react'

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link
          to="/"
          className="flex items-center gap-2 text-lg font-semibold text-white hover:text-zinc-300"
        >
          <Gamepad2 className="h-6 w-6" />
          <span>GameLog</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white"
          >
            <Home className="h-4 w-4" />
            Inicio
          </Link>
          <Link
            to="/games"
            className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white"
          >
            <LayoutGrid className="h-4 w-4" />
            Juegos
          </Link>
          <Link
            to="/top"
            className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white"
          >
            <Trophy className="h-4 w-4" />
            Mejores
          </Link>
          <Link
            to="/add-game"
            className="flex items-center gap-1.5 text-sm text-amber-400 hover:text-amber-300"
          >
            <ListPlus className="h-4 w-4" />
            Añadir juego
          </Link>
        </nav>
      </div>
    </header>
  )
}
