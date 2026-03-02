export interface Game {
  id: string
  title: string
  year?: number
  coverImage?: string
  platform?: string[]
  description?: string
  addedAt: string
}

export interface Rating {
  id: string
  gameId: string
  score: number
  comment?: string
  ratedAt: string
}
