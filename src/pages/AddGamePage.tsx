import { useNavigate } from 'react-router-dom'
import { useGames } from '../hooks/useGames'
import { AddGameForm, type AddGameSubmitValues } from '../components/AddGameForm'
import { AddFromSteam } from '../components/AddFromSteam'

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
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <h1 className="mb-8 text-center text-3xl font-bold text-white">Añadir juego</h1>
      <div className="mb-10 flex justify-center">
        <AddFromSteam />
      </div>
      <h2 className="mb-4 text-center text-xl font-semibold text-zinc-300">Añadir manualmente</h2>
      <div className="flex justify-center">
        <AddGameForm onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
