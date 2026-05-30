import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { MobileLayout } from './components/MobileLayout'
import { UserProvider, useUser } from './context/UserContext'
import { CardConfigProvider } from './context/CardConfigContext'
import { CollectionPage } from './pages/CollectionPage'
import { ConfigPage } from './pages/ConfigPage'
import { FavoritesPage } from './pages/FavoritesPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { TestPage } from './pages/TestPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PackPage } from './pages/PackPage'
import { ProgressPage } from './pages/ProgressPage'
import { RegisterPage } from './pages/RegisterPage'

function AppRoutes() {
  const { user } = useUser()

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <CardConfigProvider>
      <Routes>
        <Route element={<MobileLayout />}>
          <Route index element={<HomePage />} />
          <Route path="colecao" element={<CollectionPage />} />
          <Route path="pacotinho" element={<PackPage />} />
          <Route path="favoritos" element={<FavoritesPage />} />
          <Route path="progresso" element={<ProgressPage />} />
          <Route path="config" element={<ConfigPage />} />
          <Route path="inicio" element={<Navigate to="/" replace />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </CardConfigProvider>
  )
}

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <AppRoutes />
        <Toaster
          position="top-center"
          gap={8}
          toastOptions={{ unstyled: true }}
        />
      </UserProvider>
    </BrowserRouter>
  )
}

export default App
