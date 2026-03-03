import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGames } from '../hooks/useGames'
import { StarRatingDisplay, StarRatingInput } from '../components/ui/StarRating'
import { formatDate } from '../lib/utils'

export function GameDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getGameById, getRatingsForGame, getAverageScore, getMyRatingForGame, addRating, updateRating } = useGames()
  const [score, setScore] = useState(0)
  const [comment, setComment] = useState('')
  const [showForm, setShowForm] = useState(false)

  const game = id ? getGameById(id) : null
  const ratings = id ? getRatingsForGame(id) : []
  const myRating = id ? getMyRatingForGame(id) : null
  const averageScore = id ? getAverageScore(id) : null

  const sortedRatings = [...ratings].sort(
    (a, b) => new Date(b.ratedAt).getTime() - new Date(a.ratedAt).getTime()
  )

  const handleSubmitRating = (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || score < 1) return
    if (myRating) {
      updateRating(myRating.id, { score, comment: comment || undefined })
    } else {
      addRating({ gameId: id, score, comment: comment || undefined })
    }
    setScore(0)
    setComment('')
    setShowForm(false)
  }

  const handleOpenForm = () => {
    if (myRating) {
      setScore(myRating.score)
      setComment(myRating.comment ?? '')
    } else {
      setScore(0)
      setComment('')
    }
    setShowForm(true)
  }

  if (!game) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-12 text-center">
        <p className="text-cp-muted">Juego no encontrado.</p>
        <button
          onClick={() => navigate('/games')}
          className="mt-4 text-cp-neon hover:text-cp-neon/80 transition-colors"
        >
          Volver al listado
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <div className="flex flex-col gap-8 md:flex-row">
        <div className="shrink-0">
          <div className="aspect-[3/4] w-56 overflow-hidden rounded-lg bg-cp-surface relative">
            {game.coverImage ? (
              <>
                <div
                  className="absolute inset-0 bg-cover bg-center scale-110"
                  style={{
                    backgroundImage: `url(${game.coverImage})`,
                    filter: 'blur(14px)',
                  }}
                  aria-hidden
                />
                <img
                  src={game.coverImage}
                  alt=""
                  className="relative z-10 h-full w-full object-contain"
                />
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center text-4xl text-cp-muted">
                ?
              </div>
            )}
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold text-cp-light">{game.title}</h1>
          {game.year != null && (
            <p className="mt-1 text-cp-muted">{game.year}</p>
          )}
          {game.platform && game.platform.length > 0 && (
            <p className="mt-2 text-sm text-cp-muted">
              {game.platform.join(' · ')}
            </p>
          )}
          <div className="mt-4 flex items-center gap-4">
            {averageScore != null && (
              <span className="flex items-center gap-2">
                <StarRatingDisplay score={averageScore} />
                <span className="text-lg font-semibold text-cp-neon">
                  {averageScore}
                </span>
                <span className="text-cp-muted">
                  ({ratings.length} valoración{ratings.length !== 1 ? 'es' : ''})
                </span>
              </span>
            )}
            {averageScore == null && (
              <span className="text-cp-muted">Sin valoraciones aún</span>
            )}
          </div>
          {game.description && (
            <p className="mt-4 text-cp-light/90">{game.description}</p>
          )}
          <button
            onClick={() => (showForm ? setShowForm(false) : handleOpenForm())}
            className="mt-6 rounded-lg border border-cp-neon bg-cp-neon px-4 py-2 text-sm font-medium text-cp-black hover:bg-cp-neon/90 transition-colors"
          >
            {showForm ? 'Cancelar' : myRating ? 'Modificar mi valoración' : 'Añadir mi valoración'}
          </button>
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmitRating}
          className="mt-8 rounded-lg border border-cp-surface bg-cp-dark/80 p-6"
        >
          <label className="mb-2 block text-sm font-medium text-cp-light">
            Puntuación (1-5)
          </label>
          <StarRatingInput value={score} onChange={setScore} />
          <label className="mt-4 mb-2 block text-sm font-medium text-cp-light">
            Comentario (opcional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="w-full rounded border border-cp-surface bg-cp-dark px-3 py-2 text-cp-light placeholder-cp-muted focus:border-cp-neon focus:outline-none"
            placeholder="Tu opinión..."
          />
          <button
            type="submit"
            disabled={score < 1}
            className="mt-4 rounded-lg border border-cp-neon bg-cp-neon px-4 py-2 font-medium text-cp-black disabled:opacity-50 hover:bg-cp-neon/90 transition-colors"
          >
            {myRating ? 'Guardar cambios' : 'Enviar valoración'}
          </button>
        </form>
      )}

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-semibold text-cp-light">Valoraciones</h2>
        {sortedRatings.length === 0 ? (
          <p className="text-cp-muted">Aún no hay valoraciones.</p>
        ) : (
          <ul className="space-y-4">
            {sortedRatings.map((r) => (
              <li
                key={r.id}
                className="rounded-lg border border-cp-surface bg-cp-dark/50 p-4"
              >
                <div className="flex items-center gap-2">
                  <StarRatingDisplay score={r.score} size="sm" />
                  <span className="font-medium text-cp-neon">{r.score}/5</span>
                  <span className="text-sm text-cp-muted">
                    {formatDate(r.ratedAt)}
                  </span>
                </div>
                {r.comment && (
                  <p className="mt-2 text-cp-light/90">{r.comment}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
