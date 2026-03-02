import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { GamesProvider } from './contexts/GamesContext'
import { Layout } from './components/Layout/Layout'
import { ErrorBoundary } from './components/ErrorBoundary'
import { HomePage } from './pages/HomePage'
import { GamesPage } from './pages/GamesPage'
import { GameDetailPage } from './pages/GameDetailPage'
import { AddGamePage } from './pages/AddGamePage'
import { TopGamesPage } from './pages/TopGamesPage'
import { MySteamGamesPage } from './pages/MySteamGamesPage'
import { AuthCallbackPage } from './pages/AuthCallbackPage'

// En GitHub Pages la app puede estar en /repo-name/; el router necesita ese basename
function getBasename(): string {
  if (import.meta.env.DEV) return '/'
  const path = window.location.pathname
  const segments = path.split('/').filter(Boolean)
  if (segments.length === 0) return '/'
  return '/' + segments[0] + '/'
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter basename={getBasename()}>
        <AuthProvider>
          <GamesProvider>
            <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="games" element={<GamesPage />} />
              <Route path="games/:id" element={<GameDetailPage />} />
              <Route path="top" element={<TopGamesPage />} />
              <Route path="add-game" element={<AddGamePage />} />
              <Route path="my-steam-games" element={<MySteamGamesPage />} />
              <Route path="auth/callback" element={<AuthCallbackPage />} />
            </Route>
            </Routes>
          </GamesProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
