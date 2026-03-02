import { Outlet } from 'react-router-dom'
import { Header } from './Header'

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-zinc-800 py-4 text-center text-sm text-zinc-500">
        GameLog — Tu lista de juegos. Datos mockeados.
      </footer>
    </div>
  )
}
