import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowRight } from 'lucide-react'

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
    formState: { errors },
  } = useForm<AddGameFormValues, unknown, z.infer<typeof addGameSchema>>({
    resolver: zodResolver(addGameSchema),
    defaultValues: {
      title: '',
      year: '',
      coverImage: '',
      platform: '',
      description: '',
    },
  })

  const inputClass =
    "w-full rounded-lg border border-cp-border bg-cp-dark px-3 py-2 text-cp-light placeholder-cp-muted focus:border-cp-neon focus:outline-none focus:ring-1 focus:ring-cp-neon/40 focus:shadow-[0_0_8px_rgba(16,185,129,0.08)] transition-all"
  const labelClass = "mb-1.5 block text-xs font-medium uppercase tracking-widest text-cp-muted"

  return (
    <form
      onSubmit={handleSubmit((data) => {
        const platforms = data.platform
          ? data.platform.split(',').map((p) => p.trim()).filter(Boolean)
          : undefined
        onSubmit({ ...data, platform: platforms })
      })}
      className="mx-auto w-full max-w-2xl space-y-5"
    >
      <div>
        <label htmlFor="title" className={labelClass}>
          Título *
        </label>
        <input
          id="title"
          {...register('title')}
          className={inputClass}
          placeholder="Nombre del juego"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-400">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="year" className={labelClass}>
          Año
        </label>
        <input
          id="year"
          type="number"
          {...register('year')}
          className={inputClass}
          placeholder="2020"
        />
        {errors.year && (
          <p className="mt-1 text-sm text-red-400">{errors.year.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="coverImage" className={labelClass}>
          URL de la portada
        </label>
        <input
          id="coverImage"
          type="url"
          {...register('coverImage')}
          className={inputClass}
          placeholder="https://..."
        />
        {errors.coverImage && (
          <p className="mt-1 text-sm text-red-400">{errors.coverImage.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="platform" className={labelClass}>
          Plataformas (separadas por comas)
        </label>
        <input
          id="platform"
          {...register('platform')}
          className={inputClass}
          placeholder="PC, PlayStation, Nintendo Switch"
        />
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>
          Descripción
        </label>
        <textarea
          id="description"
          rows={4}
          {...register('description')}
          className={inputClass}
          placeholder="Breve descripción del juego..."
        />
      </div>

      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-cp-neon bg-cp-neon px-4 py-2.5 font-semibold text-cp-black hover:bg-cp-neon-dim focus:outline-none focus:ring-2 focus:ring-cp-neon focus:ring-offset-2 focus:ring-offset-cp-black transition-colors"
      >
        Añadir juego
        <ArrowRight className="h-4 w-4" aria-hidden />
      </button>
    </form>
  )
}
