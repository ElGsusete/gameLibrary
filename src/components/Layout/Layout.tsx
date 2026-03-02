import { Outlet } from "react-router-dom";
import { Header } from "./Header";

const BANNER_WIDTH = "w-[160px]";
const BANNER_MIN_HEIGHT = "min-h-[600px]";

function SideBanner({ side }: { side: "left" | "right" }) {
  return (
    <aside
      className={`hidden shrink-0 xl:block ${BANNER_WIDTH} ${side === "left" ? "xl:order-first" : "xl:order-last"}`}
      aria-label={`Banner ${side === "left" ? "izquierdo" : "derecho"}`}
    >
      <div
        className={`sticky top-20 rounded-lg border border-zinc-800 bg-zinc-900/80 ${BANNER_MIN_HEIGHT} flex flex-col items-center justify-center px-2 py-4 text-center`}
      >
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          Espacio publicitario
        </span>
        <span className="mt-2 text-[10px] text-zinc-600">160 × 600</span>
      </div>
    </aside>
  );
}

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
      <Header />
      <main className="flex-1">
        <div className="mx-auto flex w-full max-w-[calc(1152px+320px)] flex-col xl:flex-row xl:justify-center xl:gap-0">
          <SideBanner side="left" />
          <div className="min-w-0 flex-1 px-4 py-8 xl:max-w-6xl xl:px-6">
            <Outlet />
          </div>
          <SideBanner side="right" />
        </div>
      </main>
      <footer className="border-t border-zinc-800 py-4 text-center text-sm text-zinc-500">
        GameLog — Tu lista de juegos. Los datos no son reales.
      </footer>
    </div>
  );
}
