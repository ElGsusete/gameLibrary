import { useNavigate } from 'react-router-dom'
import { useGames } from '../hooks/useGames'
import { AddGameForm, type AddGameSubmitValues } from '../components/AddGameForm'

export function AddGamePage() {
  const { addGame } = useGames()
  const navigate = useNavigate()

  const handleSubmit = (values: AddGameSubmitValues) => {
    const id = addGame({
      title: values.title,
      year: values.year,
      coverImage: values.coverImage,
      platform: values.platform,
      description: values.description,
    })
    navigate(`/games/${id}`)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-white">Añadir juego</h1>
      <AddGameForm onSubmit={handleSubmit} />
    </div>
  )
}
