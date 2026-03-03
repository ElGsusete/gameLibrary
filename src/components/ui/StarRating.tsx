import { Star } from 'lucide-react'
import { cn } from '../../lib/utils'

const MAX_STARS = 5

type StarRatingProps = {
  score: number
  max?: number
  size?: 'sm' | 'md'
  className?: string
}

export function StarRatingDisplay({ score, max = 5, size = 'md', className }: StarRatingProps) {
  const normalized = Math.min(max, Math.max(0, score))
  const full = Math.floor(normalized)
  const hasHalf = normalized % 1 >= 0.5
  const empty = max - full - (hasHalf ? 1 : 0)

  const iconClass = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'

  return (
    <div className={cn('flex items-center gap-0.5', className)} title={`${score}/${max}`}>
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`full-${i}`} className={cn(iconClass, 'fill-cp-neon text-cp-neon')} />
      ))}
      {hasHalf && (
        <span className="relative inline-block">
          <Star className={cn(iconClass, 'text-cp-surface')} />
          <Star
            className={cn(iconClass, 'absolute left-0 top-0 fill-cp-neon text-cp-neon')}
            style={{ clipPath: 'inset(0 50% 0 0)' }}
          />
        </span>
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`empty-${i}`} className={cn(iconClass, 'text-cp-surface')} />
      ))}
    </div>
  )
}

type StarRatingInputProps = {
  value: number
  onChange: (value: number) => void
  max?: number
  className?: string
}

export function StarRatingInput({
  value,
  onChange,
  max = MAX_STARS,
  className,
}: StarRatingInputProps) {
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: max }).map((_, i) => {
        const starValue = i + 1
        const filled = value >= starValue
        return (
          <button
            key={starValue}
            type="button"
            onClick={() => onChange(starValue)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onChange(starValue)
              }
            }}
            className="p-0.5 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-cp-neon rounded"
            aria-label={`${starValue} de ${max} estrellas`}
            aria-pressed={filled}
          >
            <Star
              className={cn(
                'h-8 w-8 transition-colors',
                filled ? 'fill-cp-neon text-cp-neon' : 'text-cp-muted hover:text-cp-neon'
              )}
            />
          </button>
        )
      })}
    </div>
  )
}
