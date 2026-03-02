import { useMemo, useState } from 'react'
import { useGames } from '../hooks/useGames'
import { GameList } from '../components/GameList'

export function GamesPage() {
  const { gamesWithScores } = useGames()
  const [platformFilter, setPlatformFilter] = useState<string>('')
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'title'>('date')

  const platforms = useMemo(() => {
    const set = new Set<string>()
    gamesWithScores.forEach((g) => g.platform?.forEach((p) => set.add(p)))
    return Array.from(set).sort()
  }, [gamesWithScores])

  const filteredAndSorted = useMemo(() => {
    let list = platformFilter
      ? gamesWithScores.filter((g) =>
          g.platform?.some((p) => p.toLowerCase().includes(platformFilter.toLowerCase()))
        )
      : [...gamesWithScores]
    if (sortBy === 'date') {
      list = list.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
    } else if (sortBy === 'score') {
      list = list.sort((a, b) => (b.averageScore ?? 0) - (a.averageScore ?? 0))
    } else {
      list = list.sort((a, b) => a.title.localeCompare(b.title))
    }
    return list
  }, [gamesWithScores, platformFilter, sortBy])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-white">Todos los juegos</h1>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div>
          <label htmlFor="platform" className="mr-2 text-sm text-zinc-400">
            Plataforma:
          </label>
          <select
            id="platform"
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-white focus:border-amber-500 focus:outline-none"
          >
            <option value="">Todas</option>
            {platforms.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="sort" className="mr-2 text-sm text-zinc-400">
            Ordenar:
          </label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'score' | 'title')}
            className="rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-white focus:border-amber-500 focus:outline-none"
          >
            <option value="date">Más recientes</option>
            <option value="score">Mejor valorados</option>
            <option value="title">Título</option>
          </select>
        </div>
      </div>

      <GameList games={filteredAndSorted} />
    </div>
  )
}
