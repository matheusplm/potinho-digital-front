import type { ReactElement } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { MobileLayout } from './components/MobileLayout'
import { UserProvider, useUser, type UserRole } from './context/UserContext'
import { BackgroundProvider } from './context/BackgroundContext'
import { SimulationProvider, useSimulation } from './context/SimulationContext'
import { WriterHomePage } from './pages/WriterHomePage'
import { SimulatedReaderHomePage } from './pages/SimulatedReaderHomePage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { CollectionsListPage } from './pages/CollectionsListPage'
import { CollectionPlayPage } from './pages/CollectionPlayPage'
import { CollectionManagePage } from './pages/CollectionManagePage'
import { TestPage } from './pages/TestPage'
import { NotFoundPage } from './pages/NotFoundPage'

function HomeRoute() {
  const { user } = useUser()
  const simulation = useSimulation()
  if (simulation.isActive) return <SimulatedReaderHomePage />
  return user?.role === 'writer' ? <WriterHomePage /> : <Navigate to="/colecoes" replace />
}

function RequireRole({ role, children }: { role: UserRole; children: ReactElement }) {
  const { user } = useUser()
  if (user?.role !== role) return <Navigate to="/home" replace />
  return children
}

function AppRoutes() {
  const { user } = useUser()

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {import.meta.env.DEV && <Route path="/test" element={<TestPage />} />}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route element={<MobileLayout />}>
        <Route index element={<Navigate to="/home" replace />} />
        <Route path="home" element={<HomeRoute />} />
        <Route path="colecoes" element={<CollectionsListPage />} />
        <Route path="colecoes/:slug" element={<CollectionPlayPage />} />
        <Route path="colecoes/:slug/gerenciar" element={<RequireRole role="writer"><CollectionManagePage /></RequireRole>} />
      </Route>
      {import.meta.env.DEV && <Route path="test" element={<TestPage />} />}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <BackgroundProvider>
          <SimulationProvider>
            <AppRoutes />
          </SimulationProvider>
          <Toaster
            position="top-center"
            gap={8}
            toastOptions={{ unstyled: true }}
          />
        </BackgroundProvider>
      </UserProvider>
    </BrowserRouter>
  )
}

export default App
