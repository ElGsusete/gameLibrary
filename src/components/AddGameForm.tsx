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
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-cp-light">
          Título *
        </label>
        <input
          id="title"
          {...register('title')}
          className="w-full rounded-lg border border-cp-surface bg-cp-dark px-3 py-2 text-cp-light placeholder-cp-muted focus:border-cp-neon focus:outline-none focus:ring-1 focus:ring-cp-neon"
          placeholder="Nombre del juego"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-400">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="year" className="mb-1 block text-sm font-medium text-cp-light">
          Año
        </label>
        <input
          id="year"
          type="number"
          {...register('year')}
          className="w-full rounded-lg border border-cp-surface bg-cp-dark px-3 py-2 text-cp-light placeholder-cp-muted focus:border-cp-neon focus:outline-none focus:ring-1 focus:ring-cp-neon"
          placeholder="2020"
        />
        {errors.year && (
          <p className="mt-1 text-sm text-red-400">{errors.year.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="coverImage" className="mb-1 block text-sm font-medium text-cp-light">
          URL de la portada
        </label>
        <input
          id="coverImage"
          type="url"
          {...register('coverImage')}
          className="w-full rounded-lg border border-cp-surface bg-cp-dark px-3 py-2 text-cp-light placeholder-cp-muted focus:border-cp-neon focus:outline-none focus:ring-1 focus:ring-cp-neon"
          placeholder="https://..."
        />
        {errors.coverImage && (
          <p className="mt-1 text-sm text-red-400">{errors.coverImage.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="platform" className="mb-1 block text-sm font-medium text-cp-light">
          Plataformas (separadas por comas)
        </label>
        <input
          id="platform"
          {...register('platform')}
          className="w-full rounded-lg border border-cp-surface bg-cp-dark px-3 py-2 text-cp-light placeholder-cp-muted focus:border-cp-neon focus:outline-none focus:ring-1 focus:ring-cp-neon"
          placeholder="PC, PlayStation, Nintendo Switch"
        />
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-cp-light">
          Descripción
        </label>
        <textarea
          id="description"
          rows={4}
          {...register('description')}
          className="w-full rounded-lg border border-cp-surface bg-cp-dark px-3 py-2 text-cp-light placeholder-cp-muted focus:border-cp-neon focus:outline-none focus:ring-1 focus:ring-cp-neon"
          placeholder="Breve descripción del juego..."
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-lg border border-cp-neon bg-cp-neon px-4 py-2 font-medium text-cp-black hover:bg-cp-neon/90 focus:outline-none focus:ring-2 focus:ring-cp-neon focus:ring-offset-2 focus:ring-offset-cp-black transition-colors"
      >
        Añadir juego
      </button>
    </form>
  )
}
