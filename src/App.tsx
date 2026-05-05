import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { MobileLayout } from './components/MobileLayout'
import { CollectionPage } from './pages/CollectionPage'
import { FavoritesPage } from './pages/FavoritesPage'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PackPage } from './pages/PackPage'
import { ProgressPage } from './pages/ProgressPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MobileLayout />}>
          <Route index element={<HomePage />} />
          <Route path="colecao" element={<CollectionPage />} />
          <Route path="pacotinho" element={<PackPage />} />
          <Route path="favoritos" element={<FavoritesPage />} />
          <Route path="progresso" element={<ProgressPage />} />
          <Route path="inicio" element={<Navigate to="/" replace />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
