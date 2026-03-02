# GameLog

Biblioteca personal de videojuegos: registra tus juegos, puntúalos y consulta los mejor valorados. Inspirado en la idea de Letterboxd pero para videojuegos.

Construido con **React**, **TypeScript** y **Vite**. Los datos se guardan en **localStorage**. Opcionalmente puedes **iniciar sesión con Steam** (backend Express) para ver **Mis juegos de Steam**.

---

## Funcionalidades

- **Inicio**: últimos juegos añadidos y mejor valorados.
- **Listado de juegos**: todos los juegos con filtro por plataforma y orden (fecha, puntuación, título). La página sigue disponible; la búsqueda principal está en la barra superior.
- **Búsqueda global**: en la topbar puedes buscar por nombre entre tus juegos y abrir el detalle sin ir a la página de listado.
- **Detalle de juego**: portada, plataformas, descripción, puntuación media y valoraciones. Una sola review por juego; se puede editar.
- **Añadir juego**:
  - Formulario manual (título, año, URL de portada, plataformas, descripción).
  - **Importar desde Steam**: búsqueda al escribir (SteamSpy + Steam Store API), con miniaturas de portada en los resultados y portadas tipo banner en las tarjetas.
- **Mejores juegos** (`/top`): ordenados por puntuación con filtro de mínimo de valoraciones.
- **Login con Steam** (opcional): botón «Steam» en la barra. Tras iniciar sesión se muestra **Mis juegos de Steam** (`/my-steam-games`), listado de tu biblioteca con imágenes de cabecera de Steam, tiempo jugado, buscador por nombre y enlace para añadir cada juego a GameLog (botón «Añadir a GameLog» siempre alineado abajo en cada tarjeta).
- **Topbar**:
  - **Escritorio**: cabecera en tres zonas (logo izquierda, búsqueda centrada, navegación derecha). Menú desplegable **Juegos** con animación (Todos los juegos, Mejores juegos, Mis juegos de Steam si hay sesión). Barra de búsqueda ancha y centrada.
  - **Móvil**: una sola barra que agrupa búsqueda + botón de menú (hamburguesa); al abrir el menú aparece un panel con toda la navegación (Inicio, Juegos, Añadir, Steam / Cerrar sesión).
- **Layout**: barra superior fija, contenido centrado, márgenes uniformes arriba/abajo y **banners laterales** en escritorio (placeholders publicitarios) con margen exterior para no quedar pegados al borde de la pantalla ni al footer.

---

## Tecnologías

- React 19, TypeScript, Vite
- React Router, Zustand
- React Hook Form + Zod
- Tailwind CSS, Lucide React
- ESLint + TypeScript ESLint

---

## Cómo ejecutar

**Requisitos:** Node.js (recomendado 20+) y npm.

```bash
npm install
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173).

**Para levantar todo a la vez (frontend + servidor Steam):**

```bash
npm install
cd server && npm install && cd ..
# Crea server/.env con STEAM_API_KEY (https://steamcommunity.com/dev/apikey), JWT_SECRET, etc.
npm run dev:all
```

Con `dev:all` se ejecutan en paralelo Vite (puerto 5173) y el servidor Express (3001). Las peticiones a `/api/*` se proxyan al servidor (Vite proxy en `vite.config.ts`).

**Importante:** Los archivos `.env` (y `server/.env`) están en `.gitignore` y **no se suben al repositorio**. Contienen claves y secretos; cada desarrollador debe crear su propio `server/.env` a partir de `server/.env.example`.

**Build de producción:**

```bash
npm run build
npm run preview
```

**Despliegue en GitHub Pages:** Hay un workflow en `.github/workflows/deploy-pages.yml` que hace `npm run build` y publica la carpeta **dist** (no el código fuente). Así se evita el 404 en `main.tsx`. **Configuración necesaria:** en el repo, **Settings → Pages → Build and deployment → Source** debe estar en **"GitHub Actions"** (no en "Deploy from a branch"). Tras el primer push a `main`, el workflow construye y despliega; la URL será `https://<usuario>.github.io/gameLibrary/`. El login con Steam no funcionará en esa URL (no hay backend); el resto de la app (añadir juegos manualmente, listados, búsqueda, etc.) sí.

---

## Integración con Steam

- **Lista de juegos (búsqueda):** SteamSpy (`/steamspy/api.php?request=all`), cacheada 24 h en localStorage.
- **Detalle por juego:** Steam Store API (`/api/appdetails`).
- **Login:** OpenID 2.0 vía backend (passport-steam). Tras login, el backend devuelve un JWT con el SteamID.
- **Mis juegos de Steam:** el backend llama a `IPlayerService/GetOwnedGames` con tu SteamID y la API key; la biblioteca debe ser pública.
- En desarrollo, Vite hace de proxy para SteamSpy, Store y `/api` (backend).

---

## Estructura del proyecto

- `src/App.tsx` – Rutas: `/`, `/games`, `/games/:id`, `/top`, `/add-game`, `/my-steam-games`, `/auth/callback`.
- `src/contexts/GamesContext.tsx` – Estado global (juegos, valoraciones, helpers).
- `src/contexts/AuthContext.tsx` – Token Steam (JWT), login/logout.
- `src/services/steamApi.ts` – Llamadas a SteamSpy y Store API, mapeo a `Game`.
- `src/components/AddFromSteam.tsx` – Búsqueda reactiva con debounce, miniaturas Steam e importación.
- `src/components/GameCard.tsx`, `GameList.tsx` – Tarjetas y grid de juegos.
- `src/components/Layout/` – Header (búsqueda, menú Juegos, menú móvil), Layout con banners laterales y márgenes uniformes.
- `src/pages/MySteamGamesPage.tsx` – Biblioteca Steam con búsqueda por nombre e imágenes de cabecera.
- `server/` – Express, passport-steam, JWT, `/api/auth/steam`, `/api/me/games`.

---

## Licencia

Proyecto de uso personal/educativo. Adapta la licencia si lo reutilizas.
