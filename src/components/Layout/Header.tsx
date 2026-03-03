import { useState, useMemo, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Gamepad2,
  Home,
  ListPlus,
  LayoutGrid,
  Trophy,
  Search,
  LogOut,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useGames } from "../../hooks/useGames";

const MAX_SEARCH_RESULTS = 8;

export function Header() {
  const { isLoggedIn, login, logout } = useAuth();
  const { gamesWithScores } = useGames();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showGamesMenu, setShowGamesMenu] = useState(false);
  const [dropdownAnimate, setDropdownAnimate] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const gamesMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) return [];
    const list = Array.isArray(gamesWithScores) ? gamesWithScores : [];
    return list
      .filter((g) => g?.title?.toLowerCase().includes(q))
      .slice(0, MAX_SEARCH_RESULTS);
  }, [gamesWithScores, searchQuery]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (searchRef.current && !searchRef.current.contains(target)) {
        setShowSearchDropdown(false);
      }
      if (gamesMenuRef.current && !gamesMenuRef.current.contains(target)) {
        setShowGamesMenu(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(target)) {
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleLogout = () => {
    logout();
    const onSteamGamesPage = location.pathname.includes("my-steam-games");
    if (onSteamGamesPage) {
      navigate("/?logout=1", { replace: true });
    } else {
      const next = new URLSearchParams(location.search);
      next.set("logout", "1");
      navigate({ pathname: location.pathname, search: next.toString() }, { replace: true });
    }
  };

  // Animación de entrada del desplegable
  useEffect(() => {
    if (showGamesMenu) {
      setDropdownAnimate(false);
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setDropdownAnimate(true));
      });
      return () => cancelAnimationFrame(id);
    }
    setDropdownAnimate(false);
  }, [showGamesMenu]);

  const searchInputCommonProps = {
    value: searchQuery,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
      setShowSearchDropdown(true);
    },
    onFocus: () => searchResults.length > 0 && setShowSearchDropdown(true),
    placeholder: "Buscar juegos…",
  };

  const searchDropdown = showSearchDropdown && searchResults.length > 0 && (
    <ul className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-y-auto rounded-lg border border-zinc-700 bg-zinc-900 py-1 shadow-xl">
      {searchResults.map((g) => (
        <li key={g.id}>
          <button
            type="button"
            onClick={() => {
              navigate(`/games/${g.id}`);
              setSearchQuery("");
              setShowSearchDropdown(false);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-white hover:bg-zinc-800"
          >
            {g.coverImage ? (
              <img
                src={g.coverImage}
                alt=""
                className="h-8 w-12 shrink-0 rounded object-cover"
              />
            ) : (
              <div className="h-8 w-12 shrink-0 rounded bg-zinc-700" />
            )}
            <span className="truncate">{g.title}</span>
            {g.averageScore != null && (
              <span className="ml-auto shrink-0 text-amber-400">{g.averageScore}</span>
            )}
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur" ref={mobileMenuRef}>
      <div className="relative flex h-14 w-full items-center gap-2 px-4">
        {/* Logo */}
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2 text-lg font-semibold text-white hover:text-zinc-300"
        >
          <Gamepad2 className="h-6 w-6" />
          <span className="hidden sm:inline">GameLog</span>
        </Link>

        {/* Contenedor búsqueda (móvil: barra con menú; desktop: centrado) */}
        <div
          ref={searchRef}
          className="flex min-w-0 flex-1 md:absolute md:left-1/2 md:top-1/2 md:w-full md:max-w-md md:-translate-x-1/2 md:-translate-y-1/2 md:flex-none md:px-4"
        >
          {/* Móvil: barra única (búsqueda + menú dentro del mismo campo) */}
          <div className="relative flex w-full min-w-0 items-center rounded-lg border border-zinc-700 bg-zinc-900 md:hidden">
            <div className="relative flex min-w-0 flex-1">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 pointer-events-none" />
              <input
                {...searchInputCommonProps}
                className="w-full rounded-lg border-0 bg-transparent py-1.5 pl-8 pr-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-0"
              />
            </div>
            <div className="h-6 w-px shrink-0 bg-zinc-700" aria-hidden />
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="flex shrink-0 items-center justify-center px-3 py-2 text-zinc-400 hover:text-white"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Desktop: solo búsqueda */}
          <div className="relative hidden w-full md:block">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                {...searchInputCommonProps}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 py-1.5 pl-8 pr-3 text-sm text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Dropdown resultados (compartido móvil/desktop) */}
          {searchDropdown}
        </div>

        {/* Desktop: navegación */}
        <nav className="ml-auto hidden shrink-0 items-center gap-2 sm:gap-4 md:flex">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Inicio</span>
          </Link>

          {/* Desplegable Juegos */}
          <div ref={gamesMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setShowGamesMenu((v) => !v)}
              className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white"
              aria-expanded={showGamesMenu}
              aria-haspopup="true"
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">Juegos</span>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ease-out ${showGamesMenu ? "rotate-180" : ""}`} />
            </button>
            {showGamesMenu && (
              <ul
                className={`absolute right-0 top-full z-50 mt-1 min-w-[200px] origin-top-right rounded-lg border border-zinc-700 bg-zinc-900 py-1 shadow-xl transition-all duration-200 ease-out ${
                  dropdownAnimate
                    ? "translate-y-0 scale-100 opacity-100"
                    : "-translate-y-2 scale-95 opacity-0"
                }`}
              >
                <li>
                  <Link
                    to="/games"
                    onClick={() => setShowGamesMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
                  >
                    <LayoutGrid className="h-4 w-4 shrink-0" />
                    Todos los juegos
                  </Link>
                </li>
                <li>
                  <Link
                    to="/top"
                    onClick={() => setShowGamesMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
                  >
                    <Trophy className="h-4 w-4 shrink-0" />
                    Mejores juegos
                  </Link>
                </li>
                {isLoggedIn && (
                  <li>
                    <Link
                      to="/my-steam-games"
                      onClick={() => setShowGamesMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    >
                      <Gamepad2 className="h-4 w-4 shrink-0" />
                      Mis juegos de Steam
                    </Link>
                  </li>
                )}
              </ul>
            )}
          </div>

          <Link
            to="/add-game"
            className="flex items-center gap-1.5 text-sm text-amber-400 hover:text-amber-300"
          >
            <ListPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Añadir</span>
          </Link>
          {isLoggedIn ? (
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white"
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={login}
              className="flex items-center gap-1.5 rounded bg-[#1b2838] px-2 py-1.5 text-sm text-white hover:bg-[#2a475e]"
              title="Iniciar sesión con Steam"
            >
              <Gamepad2 className="h-4 w-4" />
              <span className="hidden sm:inline">Steam</span>
            </button>
          )}
        </nav>
      </div>

      {/* Panel menú móvil (slide down) */}
      <div
        className={`overflow-hidden transition-all duration-200 ease-out md:hidden ${
          mobileMenuOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="border-t border-zinc-800 bg-zinc-900/95 px-4 py-3 backdrop-blur">
          <ul className="flex flex-col gap-0.5">
            <li>
              <Link
                to="/"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                <Home className="h-5 w-5 shrink-0" />
                Inicio
              </Link>
            </li>
            <li className="border-t border-zinc-800 pt-1 mt-1">
              <span className="px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-zinc-500">
                Juegos
              </span>
            </li>
            <li>
              <Link
                to="/games"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                <LayoutGrid className="h-5 w-5 shrink-0" />
                Todos los juegos
              </Link>
            </li>
            <li>
              <Link
                to="/top"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                <Trophy className="h-5 w-5 shrink-0" />
                Mejores juegos
              </Link>
            </li>
            {isLoggedIn && (
              <li>
                <Link
                  to="/my-steam-games"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                >
                  <Gamepad2 className="h-5 w-5 shrink-0" />
                  Mis juegos de Steam
                </Link>
              </li>
            )}
            <li className="border-t border-zinc-800 pt-1 mt-1">
              <Link
                to="/add-game"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-amber-400 hover:bg-zinc-800 hover:text-amber-300"
              >
                <ListPlus className="h-5 w-5 shrink-0" />
                Añadir juego
              </Link>
            </li>
            <li className="border-t border-zinc-800 pt-1 mt-1">
              {isLoggedIn ? (
                <button
                  type="button"
                  onClick={() => {
                    handleLogout();
                    closeMobileMenu();
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-zinc-300 hover:bg-zinc-800 hover:text-white"
                >
                  <LogOut className="h-5 w-5 shrink-0" />
                  Cerrar sesión
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    login();
                    closeMobileMenu();
                  }}
                  className="flex w-full items-center gap-3 rounded-lg bg-[#1b2838] px-3 py-2.5 text-left text-white hover:bg-[#2a475e]"
                >
                  <Gamepad2 className="h-5 w-5 shrink-0" />
                  Iniciar sesión con Steam
                </button>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
