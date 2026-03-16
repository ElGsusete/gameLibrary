import { useMemo, useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useGames } from '../hooks/useGames'
import { GameList } from '../components/GameList'

export function GamesPage() {
  const { gamesWithScores } = useGames()
  const [searchParams, setSearchParams] = useSearchParams()
  const [platformFilter, setPlatformFilter] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'title'>('date')
  const [platformMenuOpen, setPlatformMenuOpen] = useState(false)
  const platformMenuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const platformsParam = searchParams.get('platforms') ?? searchParams.get('platform') ?? ''
    const initialPlatform =
      platformsParam.trim().length > 0
        ? platformsParam
            .split(',')
            .map((p) => p.trim())
            .filter(Boolean)
        : []
    const initialSort = (searchParams.get('sort') as 'date' | 'score' | 'title' | null) ?? 'date'
    setPlatformFilter(initialPlatform)
    setSortBy(initialSort)
  }, [searchParams])

  useEffect(() => {
    if (!platformMenuOpen) return
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node
      if (platformMenuRef.current && !platformMenuRef.current.contains(target)) {
        setPlatformMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [platformMenuOpen])

  const updateSearchParams = (nextPlatforms: string[], nextSort: 'date' | 'score' | 'title') => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (nextPlatforms.length > 0) next.set('platforms', nextPlatforms.join(','))
      else {
        next.delete('platforms')
        next.delete('platform')
      }
      if (nextSort && nextSort !== 'date') next.set('sort', nextSort)
      else next.delete('sort')
      return next
    }, { replace: true })
  }

  const platforms = useMemo(() => {
    const set = new Set<string>()
    gamesWithScores.forEach((g) => g.platform?.forEach((p) => set.add(p)))
    return Array.from(set).sort()
  }, [gamesWithScores])

  const filteredAndSorted = useMemo(() => {
    let list =
      platformFilter.length > 0
        ? gamesWithScores.filter((g) => {
            const plats = g.platform ?? []
            return plats.some((p) => platformFilter.includes(p))
          })
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
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-center text-3xl font-bold text-cp-light">Todos los juegos</h1>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div ref={platformMenuRef} className="flex flex-col gap-1">
          <span className="mr-2 text-sm font-medium uppercase tracking-wide text-[11px] text-cp-muted">
            Plataformas
          </span>
          <div className="relative inline-flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPlatformMenuOpen((v) => !v)}
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs shadow-sm transition-colors ${
                platformFilter.length > 0
                  ? 'border-cp-neon bg-cp-dark/80 text-cp-light'
                  : 'border-cp-surface bg-cp-dark/80 text-cp-light hover:border-cp-neon'
              }`}
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-cp-neon" />
              {platformFilter.length === 0
                ? 'Todas las plataformas'
                : `${platformFilter.length} plataforma${platformFilter.length > 1 ? 's' : ''}`}
            </button>
            {platformFilter.length > 0 && (
              <div className="flex flex-wrap gap-1 max-w-xs">
                {platformFilter.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      const next = platformFilter.filter((x) => x !== p)
                      setPlatformFilter(next)
                      updateSearchParams(next, sortBy)
                    }}
                    className="inline-flex items-center rounded-full bg-cp-neon px-2 py-0.5 text-[11px] font-medium text-cp-black hover:bg-cp-neon/90"
                  >
                    {p}
                    <span className="ml-1 text-xs">×</span>
                  </button>
                ))}
              </div>
            )}
            {platformMenuOpen && (
              <div className="absolute left-0 top-full z-30 mt-1 max-h-56 w-56 overflow-y-auto rounded-xl border border-cp-neon/60 bg-cp-dark/95 p-1.5 text-xs shadow-2xl">
                <button
                  type="button"
                  onClick={() => {
                    setPlatformFilter([])
                    updateSearchParams([], sortBy)
                  }}
                  className={`flex w-full items-center justify-between rounded-md px-2 py-1 text-left transition-colors ${
                    platformFilter.length === 0
                      ? 'bg-cp-neon text-cp-black'
                      : 'text-cp-light hover:bg-cp-surface'
                  }`}
                >
                  <span>Todas</span>
                </button>
                <div className="mt-1 h-px w-full bg-cp-surface/60" />
                {platforms.map((p) => {
                  const active = platformFilter.includes(p)
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        const next = active
                          ? platformFilter.filter((x) => x !== p)
                          : [...platformFilter, p]
                        setPlatformFilter(next)
                        updateSearchParams(next, sortBy)
                      }}
                      className={`flex w-full items-center justify-between rounded-md px-2 py-1 text-left transition-colors ${
                        active
                          ? 'bg-cp-neon text-cp-black'
                          : 'text-cp-light hover:bg-cp-surface'
                      }`}
                    >
                      <span>{p}</span>
                      {active && <span className="text-[10px] font-semibold">✓</span>}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-1 border-l border-cp-surface/70 pl-4">
          <span className="mr-2 text-sm text-cp-muted">Ordenar:</span>
          <div className="inline-flex overflow-hidden rounded-full border border-cp-surface bg-cp-dark/80 text-xs shadow-sm">
            {([
              { id: 'date', label: 'Más recientes' },
              { id: 'score', label: 'Mejor valorados' },
              { id: 'title', label: 'Título' },
            ] as const).map((opt) => {
              const active = sortBy === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setSortBy(opt.id)
                    updateSearchParams(platformFilter, opt.id)
                  }}
                  className={`px-3 py-1.5 transition-colors ${
                    active
                      ? 'bg-cp-neon text-cp-black'
                      : 'text-cp-light hover:bg-cp-surface'
                  }`}
                  aria-pressed={active}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <GameList games={filteredAndSorted} />
    </div>
  )
}
