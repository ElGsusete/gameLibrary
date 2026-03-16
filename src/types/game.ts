export interface Game {
  id: string
  title: string
  year?: number
  coverImage?: string
  platform?: string[]
  description?: string
  /** Puntuación media de Steam (0–100), si está disponible. */
  steamScore?: number
  /** Número aproximado de reseñas en Steam asociadas a la puntuación. */
  steamReviewsCount?: number
  addedAt: string
}

export interface Rating {
  id: string
  gameId: string
  score: number
  comment?: string
  ratedAt: string
}
