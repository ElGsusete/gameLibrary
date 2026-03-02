import { useForm } from 'react-hook-form'
import { z } from 'zod'

const currentYear = new Date().getFullYear() + 1
const addGameSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio'),
  year: z
    .string()
    .optional()
    .transform((s) => (s ? parseInt(s, 10) : undefined))
    .pipe(
      z.number().min(1958, 'Año demasiado antiguo').max(currentYear, 'Año no puede ser futuro').optional()
    ),
  coverImage: z.string().url('URL inválida').optional().or(z.literal('')),
  platform: z.string().optional(),
  description: z.string().optional(),
})

export type AddGameFormValues = z.input<typeof addGameSchema>
export type AddGameSubmitValues = Omit<z.infer<typeof addGameSchema>, 'platform'> & { platform?: string[] }

type AddGameFormProps = {
  onSubmit: (values: AddGameSubmitValues) => void
}

export function AddGameForm({ onSubmit }: AddGameFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<AddGameFormValues>({
    defaultValues: {
      title: '',
      year: '',
      coverImage: '',
      platform: '',
      description: '',
    },
  })

  return (
    <form
      onSubmit={handleSubmit((data) => {
        const parsed = addGameSchema.safeParse(data)
        if (!parsed.success) {
          const flat = parsed.error.flatten().fieldErrors
          if (flat.title) setError('title', { message: flat.title[0] })
          if (flat.year) setError('year', { message: flat.year[0] })
          if (flat.coverImage) setError('coverImage', { message: flat.coverImage[0] })
          return
        }
        const platforms = data.platform
          ? data.platform.split(',').map((p) => p.trim()).filter(Boolean)
          : undefined
        onSubmit({ ...parsed.data, platform: platforms })
      })}
      className="mx-auto max-w-xl space-y-4"
    >
      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-zinc-300">
          Título *
        </label>
        <input
          id="title"
          {...register('title')}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          placeholder="Nombre del juego"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-400">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="year" className="mb-1 block text-sm font-medium text-zinc-300">
          Año
        </label>
        <input
          id="year"
          type="number"
          {...register('year')}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          placeholder="2020"
        />
        {errors.year && (
          <p className="mt-1 text-sm text-red-400">{errors.year.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="coverImage" className="mb-1 block text-sm font-medium text-zinc-300">
          URL de la portada
        </label>
        <input
          id="coverImage"
          type="url"
          {...register('coverImage')}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          placeholder="https://..."
        />
        {errors.coverImage && (
          <p className="mt-1 text-sm text-red-400">{errors.coverImage.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="platform" className="mb-1 block text-sm font-medium text-zinc-300">
          Plataformas (separadas por comas)
        </label>
        <input
          id="platform"
          {...register('platform')}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          placeholder="PC, PlayStation, Nintendo Switch"
        />
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-zinc-300">
          Descripción
        </label>
        <textarea
          id="description"
          rows={4}
          {...register('description')}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          placeholder="Breve descripción del juego..."
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-amber-500 px-4 py-2 font-medium text-zinc-950 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-zinc-950"
      >
        Añadir juego
      </button>
    </form>
  )
}
