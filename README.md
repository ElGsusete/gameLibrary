# GameLog

Biblioteca personal de videojuegos: registra tus juegos, puntúalos y consulta los mejor valorados. Inspirado en la idea de Letterboxd pero para videojuegos.

Construido con **React**, **TypeScript** y **Vite**. Los datos se guardan en **localStorage** (sin backend ni cuentas de usuario).

---

## Funcionalidades

- **Inicio**: últimos juegos añadidos y mejor valorados.
- **Listado de juegos**: todos los juegos con filtro por plataforma y orden (fecha, puntuación, título).
- **Detalle de juego**: portada, plataformas, descripción, puntuación media y valoraciones. Una sola review por juego; se puede editar.
- **Añadir juego**:
  - Formulario manual (título, año, URL de portada, plataformas, descripción).
  - **Importar desde Steam**: búsqueda al escribir (SteamSpy + Steam Store API), con portadas tipo banner y fondo difuminado en las tarjetas.
- **Mejores juegos** (`/top`): ordenados por puntuación con filtro de mínimo de valoraciones.
- **Layout**: barra superior fija, contenido centrado y banners laterales en escritorio (placeholders publicitarios).

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

**Build de producción:**

```bash
npm run build
npm run preview
```

---

## Integración con Steam

- **Lista de juegos:** SteamSpy (`/steamspy/api.php?request=all`), cacheada 24 h en localStorage.
- **Detalle por juego:** Steam Store API (`/api/appdetails`).
- En desarrollo, Vite hace de proxy (`vite.config.ts`) para evitar CORS. Sin API key; el uso depende de las políticas de Steam/SteamSpy.

---

## Estructura del proyecto

- `src/App.tsx` – Rutas: `/`, `/games`, `/games/:id`, `/top`, `/add-game`.
- `src/contexts/GamesContext.tsx` – Estado global (juegos, valoraciones, helpers).
- `src/services/steamApi.ts` – Llamadas a SteamSpy y Store API, mapeo a `Game`.
- `src/components/AddFromSteam.tsx` – Búsqueda reactiva con debounce e importación desde Steam.
- `src/components/GameCard.tsx`, `GameList.tsx` – Tarjetas y grid de juegos.
- `src/components/Layout/` – Header, Layout con banners laterales.

---

## Licencia

Proyecto de uso personal/educativo. Adapta la licencia si lo reutilizas.
