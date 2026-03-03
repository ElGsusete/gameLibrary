import { Link } from "react-router-dom";
import { StarRatingDisplay } from "./ui/StarRating";

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

export function GameCard({ game }: { game: GameWithScores }) {
  return (
    <Link
      to={`/games/${game.id}`}
      className="group block rounded-xl overflow-hidden bg-cp-surface border border-cp-surface hover:border-cp-neon/40 hover:shadow-lg hover:shadow-cp-neon/5 transition-all duration-200"
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
              className="relative z-10 h-full w-full object-contain transition-transform group-hover:scale-105"
            />
          </>
        ) : (
          <div className="h-full w-full flex items-center justify-center text-cp-muted text-4xl">
            ?
          </div>
        )}
        <div className="absolute bottom-2 left-2 right-2 z-20 flex items-center justify-between gap-0.5">
          {game.averageScore != null && (
            <span className="flex items-center gap-1 rounded bg-cp-black/80 px-2 py-1 text-cp-neon">
              <StarRatingDisplay score={game.averageScore} size="sm" />
              <span className="text-sm font-medium">{game.averageScore}</span>
            </span>
          )}
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-cp-light truncate group-hover:text-cp-neon transition-colors">
          {game.title}
        </h3>
        {game.year != null && (
          <p className="text-sm text-cp-muted">{game.year}</p>
        )}
      </div>
    </Link>
  );
}
