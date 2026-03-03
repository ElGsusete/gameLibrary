import { useEffect, useState } from "react";
import { Outlet, useSearchParams } from "react-router-dom";
import { Github } from "lucide-react";
import { Header } from "./Header";

const BANNER_WIDTH = "w-[160px]";
const BANNER_MIN_HEIGHT = "min-h-[600px]";

const BANNER_IMAGES = {
  left: `${import.meta.env.BASE_URL}banner-left.svg`,
  right: `${import.meta.env.BASE_URL}banner-right.svg`,
} as const;

function SideBanner({ side }: { side: "left" | "right" }) {
  const imgSrc = BANNER_IMAGES[side];
  return (
    <aside
      className={`hidden shrink-0 xl:block ${BANNER_WIDTH} ${side === "left" ? "xl:order-first xl:ml-6" : "xl:order-last xl:mr-6"}`}
      aria-label={`Banner ${side === "left" ? "izquierdo" : "derecho"}`}
    >
      <div
        className={`sticky top-24 overflow-hidden rounded-lg border border-cp-surface bg-cp-dark/90 ${BANNER_MIN_HEIGHT}`}
      >
        <img
          src={imgSrc}
          alt=""
          width={160}
          height={600}
          className="h-full w-full object-cover"
        />
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
      className="rounded-md border border-cp-neon/50 bg-cp-surface px-3 py-2 text-sm text-cp-light"
    >
      <p className="font-medium">Login con Steam no configurado</p>
      <p className="mt-0.5 text-cp-muted">
        El servidor necesita una clave de Steam API. Crea <code className="rounded bg-cp-dark px-1 text-cp-neon">server/.env</code> con{" "}
        <code className="rounded bg-cp-dark px-1 text-cp-neon">STEAM_API_KEY=tu_clave</code>. Obtén la clave en{" "}
        <a
          href="https://steamcommunity.com/dev/apikey"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-cp-neon hover:text-cp-neon/90"
        >
          steamcommunity.com/dev/apikey
        </a>
        .
      </p>
      <button
        type="button"
        onClick={() => setShow(false)}
        className="mt-2 text-xs text-cp-neon underline hover:no-underline"
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
        className="rounded-md border border-cp-neon/60 bg-cp-surface px-3 py-2 text-sm text-cp-light"
      >
        <p className="font-medium">Sesión iniciada con Steam correctamente.</p>
      </div>
    );
  }
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-md border border-red-500/60 bg-red-950/80 px-3 py-2 text-sm text-red-200"
    >
      <p className="font-medium">Sesión cerrada.</p>
    </div>
  );
}

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-cp-dark text-cp-light">
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
      <footer className="border-t border-cp-surface py-4 text-center text-sm text-cp-muted">
        <span className="block mb-2">GameLog — Tu lista de juegos. Los datos no son reales.</span>
        <a
          href="https://github.com/ElGsusete/gameLibrary"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md border border-cp-surface bg-cp-dark px-3 py-1.5 text-cp-muted hover:text-cp-neon hover:border-cp-neon/50 transition-colors"
        >
          <Github className="h-4 w-4" aria-hidden />
          Ver en GitHub
        </a>
      </footer>
    </div>
  );
}
