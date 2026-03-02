import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { GamesProvider } from './contexts/GamesContext'
import { Layout } from './components/Layout/Layout'
import { HomePage } from './pages/HomePage'
import { GamesPage } from './pages/GamesPage'
import { GameDetailPage } from './pages/GameDetailPage'
import { AddGamePage } from './pages/AddGamePage'
import { TopGamesPage } from './pages/TopGamesPage'

function App() {
  return (
    <BrowserRouter>
      <GamesProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="games" element={<GamesPage />} />
            <Route path="games/:id" element={<GameDetailPage />} />
            <Route path="top" element={<TopGamesPage />} />
            <Route path="add-game" element={<AddGamePage />} />
          </Route>
        </Routes>
      </GamesProvider>
    </BrowserRouter>
  )
}

export default App
