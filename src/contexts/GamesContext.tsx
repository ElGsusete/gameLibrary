import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { Game, Rating } from '../types/game'
import { mockGames, mockRatings } from '../data/mockGames'

const STORAGE_KEYS = { games: 'games-store', ratings: 'ratings-store' }

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw) {
      const parsed = JSON.parse(raw) as T
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    // ignore
  }
  return fallback
}

function saveToStorage(key: string, data: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {
    // ignore
  }
}

export type GamesContextValue = {
  games: Game[]
  ratings: Rating[]
  gamesWithScores: (Game & { averageScore: number | null; ratingCount: number })[]
  addGame: (game: Omit<Game, 'id' | 'addedAt'> & { id?: string }) => string
  addRating: (rating: Omit<Rating, 'id' | 'ratedAt'>) => void
  updateRating: (ratingId: string, data: { score: number; comment?: string }) => void
  getRatingsForGame: (gameId: string) => Rating[]
  getMyRatingForGame: (gameId: string) => Rating | null
  getAverageScore: (gameId: string) => number | null
  getGameById: (id: string) => Game | null
}

const GamesContext = createContext<GamesContextValue | null>(null)

export function GamesProvider({ children }: { children: React.ReactNode }) {
  const [games, setGames] = useState<Game[]>(() =>
    loadFromStorage(STORAGE_KEYS.games, mockGames)
  )
  const [ratings, setRatings] = useState<Rating[]>(() =>
    loadFromStorage(STORAGE_KEYS.ratings, mockRatings)
  )

  const addGame = useCallback((game: Omit<Game, 'id' | 'addedAt'> & { id?: string }) => {
    const newGame: Game = {
      ...game,
      id: game.id ?? crypto.randomUUID(),
      addedAt: new Date().toISOString(),
    }
    setGames((prev) => {
      const next = [newGame, ...prev]
      saveToStorage(STORAGE_KEYS.games, next)
      return next
    })
    return newGame.id
  }, [])

  const addRating = useCallback((rating: Omit<Rating, 'id' | 'ratedAt'>) => {
    setRatings((prev) => {
      const existing = prev.find((r) => r.gameId === rating.gameId)
      const now = new Date().toISOString()
      const next = existing
        ? prev.map((r) =>
            r.gameId === rating.gameId
              ? { ...r, score: rating.score, comment: rating.comment, ratedAt: now }
              : r
          )
        : [...prev, { ...rating, id: crypto.randomUUID(), ratedAt: now }]
      saveToStorage(STORAGE_KEYS.ratings, next)
      return next
    })
  }, [])

  const updateRating = useCallback((ratingId: string, data: { score: number; comment?: string }) => {
    const now = new Date().toISOString()
    setRatings((prev) => {
      const next = prev.map((r) =>
        r.id === ratingId ? { ...r, ...data, ratedAt: now } : r
      )
      saveToStorage(STORAGE_KEYS.ratings, next)
      return next
    })
  }, [])

  const getRatingsForGame = useCallback(
    (gameId: string) => ratings.filter((r) => r.gameId === gameId),
    [ratings]
  )

  const getAverageScore = useCallback(
    (gameId: string): number | null => {
      const gameRatings = ratings.filter((r) => r.gameId === gameId)
      if (gameRatings.length === 0) return null
      const sum = gameRatings.reduce((a, r) => a + r.score, 0)
      return Math.round((sum / gameRatings.length) * 10) / 10
    },
    [ratings]
  )

  const getGameById = useCallback(
    (id: string) => games.find((g) => g.id === id) ?? null,
    [games]
  )

  const getMyRatingForGame = useCallback(
    (gameId: string) => ratings.find((r) => r.gameId === gameId) ?? null,
    [ratings]
  )

  const gamesWithScores = useMemo(() => {
    return games.map((game) => ({
      ...game,
      averageScore: getAverageScore(game.id),
      ratingCount: getRatingsForGame(game.id).length,
    }))
  }, [games, getAverageScore, getRatingsForGame])

  const value: GamesContextValue = useMemo(
    () => ({
      games,
      ratings,
      gamesWithScores,
      addGame,
      addRating,
      updateRating,
      getRatingsForGame,
      getAverageScore,
      getGameById,
      getMyRatingForGame,
    }),
    [
      games,
      ratings,
      gamesWithScores,
      addGame,
      addRating,
      updateRating,
      getRatingsForGame,
      getAverageScore,
      getGameById,
      getMyRatingForGame,
    ]
  )

  return <GamesContext.Provider value={value}>{children}</GamesContext.Provider>
}

export function useGamesContext(): GamesContextValue {
  const ctx = useContext(GamesContext)
  if (!ctx) throw new Error('useGamesContext must be used within GamesProvider')
  return ctx
}