import { useEffect, useState } from "react";
import { Outlet, useSearchParams } from "react-router-dom";
import { Header } from "./Header";

const BANNER_WIDTH = "w-[160px]";
const BANNER_MIN_HEIGHT = "min-h-[600px]";

function SideBanner({ side }: { side: "left" | "right" }) {
  return (
    <aside
      className={`hidden shrink-0 xl:block ${BANNER_WIDTH} ${side === "left" ? "xl:order-first xl:ml-6" : "xl:order-last xl:mr-6"}`}
      aria-label={`Banner ${side === "left" ? "izquierdo" : "derecho"}`}
    >
      <div
        className={`sticky top-24 rounded-lg border border-zinc-800 bg-zinc-900/80 ${BANNER_MIN_HEIGHT} flex flex-col items-center justify-center px-2 py-4 text-center`}
      >
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          Espacio publicitario
        </span>
        <span className="mt-2 text-[10px] text-zinc-600">160 × 600</span>
      </div>
    </aside>
  );
}

function AuthErrorBanner() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [show, setShow] = useState(false);
  const reason = searchParams.get("reason");

  useEffect(() => {
    if (searchParams.get("auth") === "error" && reason === "no_api_key") {
      setShow(true);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete("auth");
        next.delete("reason");
        return next;
      }, { replace: true });
    }
  }, [searchParams, setSearchParams, reason]);

  if (!show) return null;
  return (
    <div
      role="alert"
      className="rounded-md border border-amber-800 bg-amber-950/80 px-3 py-2 text-sm text-amber-200"
    >
      <p className="font-medium">Login con Steam no configurado</p>
      <p className="mt-0.5 text-amber-300/90">
        El servidor necesita una clave de Steam API. Crea <code className="rounded bg-zinc-800 px-1">server/.env</code> con{" "}
        <code className="rounded bg-zinc-800 px-1">STEAM_API_KEY=tu_clave</code>. Obtén la clave en{" "}
        <a
          href="https://steamcommunity.com/dev/apikey"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-amber-200"
        >
          steamcommunity.com/dev/apikey
        </a>
        .
      </p>
      <button
        type="button"
        onClick={() => setShow(false)}
        className="mt-2 text-xs underline hover:no-underline"
      >
        Cerrar
      </button>
    </div>
  );
}

function AuthFeedbackBanner() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [message, setMessage] = useState<"login" | "logout" | null>(null);

  useEffect(() => {
    const auth = searchParams.get("auth");
    const logout = searchParams.get("logout");
    if (auth === "success") {
      setMessage("login");
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete("auth");
        return next;
      }, { replace: true });
    } else if (logout === "1") {
      setMessage("logout");
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete("logout");
        return next;
      }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (!message) return;
    const id = setTimeout(() => setMessage(null), 5000);
    return () => clearTimeout(id);
  }, [message]);

  if (!message) return null;
  if (message === "login") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-md border border-emerald-800 bg-emerald-950/80 px-3 py-2 text-sm text-emerald-200"
      >
        <p className="font-medium">Sesión iniciada con Steam correctamente.</p>
      </div>
    );
  }
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-md border border-red-800 bg-red-950/80 px-3 py-2 text-sm text-red-200"
    >
      <p className="font-medium">Sesión cerrada.</p>
    </div>
  );
}

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
      <Header />
      <main className="flex-1 py-8">
        <div className="mx-auto flex w-full max-w-[calc(1152px+320px)] flex-col xl:flex-row xl:justify-center xl:gap-0">
          <SideBanner side="left" />
          <div className="min-h-0 min-w-0 flex-1 px-4 py-6 xl:max-w-6xl xl:px-6">
            <div className="flex flex-col gap-2">
              <AuthErrorBanner />
              <AuthFeedbackBanner />
              <Outlet />
            </div>
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
