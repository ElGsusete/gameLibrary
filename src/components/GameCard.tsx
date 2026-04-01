import { Link } from "react-router-dom";
import { Star } from "lucide-react";

type GameWithScores = {
  id: string;
  title: string;
  year?: number;
  coverImage?: string;
  platform?: string[];
  addedAt: string;
  averageScore: number | null;
  ratingCount: number;
};

const MAX_PLATFORM_BADGES = 2;

export function GameCard({ game }: { game: GameWithScores }) {
  const visiblePlatforms = game.platform?.slice(0, MAX_PLATFORM_BADGES) ?? [];
  const overflowCount = (game.platform?.length ?? 0) - MAX_PLATFORM_BADGES;

  return (
    <Link
      to={`/games/${game.id}`}
      className="group block rounded-xl overflow-hidden bg-cp-surface border border-cp-border hover:border-cp-neon/50 hover:shadow-lg hover:shadow-cp-neon/10 hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="aspect-[3/4] bg-cp-surface relative overflow-hidden">
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
              className="relative z-10 h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </>
        ) : (
          <div className="h-full w-full flex items-center justify-center text-cp-muted text-4xl">
            ?
          </div>
        )}

        {/* Gradient overlay bottom */}
        <div className="absolute inset-x-0 bottom-0 h-16 z-10 bg-gradient-to-t from-cp-black/80 to-transparent pointer-events-none" />

        {/* Score badge — top right */}
        {game.averageScore != null && (
          <span className="absolute top-2 right-2 z-20 flex items-center gap-1 rounded-full bg-cp-black/90 border border-cp-neon/60 px-2 py-0.5 text-cp-neon text-sm font-bold">
            <Star className="h-3 w-3 fill-cp-neon text-cp-neon" aria-hidden />
            {game.averageScore}
          </span>
        )}
      </div>

      <div className="p-3 space-y-1.5">
        <h3 className="font-semibold text-cp-light line-clamp-2 leading-snug group-hover:text-cp-neon transition-colors duration-150">
          {game.title}
        </h3>
        {game.year != null && (
          <p className="text-xs text-cp-muted">{game.year}</p>
        )}
        {visiblePlatforms.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {visiblePlatforms.map((p) => (
              <span
                key={p}
                className="rounded bg-cp-surface border border-cp-border px-1.5 py-0.5 text-[10px] text-cp-muted"
              >
                {p}
              </span>
            ))}
            {overflowCount > 0 && (
              <span className="rounded bg-cp-surface border border-cp-border px-1.5 py-0.5 text-[10px] text-cp-muted">
                +{overflowCount}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
