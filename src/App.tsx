import type { ReactElement } from 'react'
import { Suspense, lazy, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useMediaQuery } from '@mui/material'
import { MobileLayout } from './components/MobileLayout'
import { DesktopLayout } from './components/DesktopLayout'
import { PersonaBootstrap } from './components/PersonaBootstrap'
import { ErrorBoundary } from './components/ErrorBoundary'
import { RouteMeta } from './components/RouteMeta'
import { UserProvider, useUser, type UserRole } from './context/UserContext'
import { BackgroundProvider } from './context/BackgroundContext'
import { SimulationProvider, useSimulation } from './context/SimulationContext'
import { ReaderProvider } from './context/ReaderContext'
import { LoadingState } from './components/ui'
import { clearAdminSession, useAdminSession } from './services/adminSession'
import { ADMIN_QUERY_ROOT } from './hooks/useAdmin'
import { Box } from '@mui/material'

const WriterHomePage = lazy(() => import('./pages/WriterHomePage').then((m) => ({ default: m.WriterHomePage })))
const SimulatedReaderHomePage = lazy(() => import('./pages/SimulatedReaderHomePage').then((m) => ({ default: m.SimulatedReaderHomePage })))
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('./pages/RegisterPage').then((m) => ({ default: m.RegisterPage })))
const CollectionsListPage = lazy(() => import('./pages/CollectionsListPage').then((m) => ({ default: m.CollectionsListPage })))
const CollectionPlayPage = lazy(() => import('./pages/CollectionPlayPage').then((m) => ({ default: m.CollectionPlayPage })))
const CollectionManagePage = lazy(() => import('./pages/CollectionManagePage').then((m) => ({ default: m.CollectionManagePage })))
const ReaderCollectionPage = lazy(() => import('./pages/ReaderCollectionPage').then((m) => ({ default: m.ReaderCollectionPage })))
const ConquistasPage = lazy(() => import('./pages/ConquistasPage').then((m) => ({ default: m.ConquistasPage })))
const FavoritasPage = lazy(() => import('./pages/FavoritasPage').then((m) => ({ default: m.FavoritasPage })))
const TestPage = lazy(() => import('./pages/TestPage').then((m) => ({ default: m.TestPage })))
const LandingPage = lazy(() => import('./pages/LandingPage').then((m) => ({ default: m.LandingPage })))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage').then((m) => ({ default: m.VerifyEmailPage })))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })))
const ContaPage = lazy(() => import('./pages/ContaPage').then((m) => ({ default: m.ContaPage })))
const ConfirmEmailChangePage = lazy(() => import('./pages/ConfirmEmailChangePage').then((m) => ({ default: m.ConfirmEmailChangePage })))
const InviteAcceptPage = lazy(() => import('./pages/InviteAcceptPage').then((m) => ({ default: m.InviteAcceptPage })))
const NotificationsPage = lazy(() => import('./pages/NotificationsPage').then((m) => ({ default: m.NotificationsPage })))
const AdminOverviewPage = lazy(() => import('./pages/admin/AdminOverviewPage').then((m) => ({ default: m.AdminOverviewPage })))
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage })))
const AdminCollectionsPage = lazy(() => import('./pages/admin/AdminCollectionsPage').then((m) => ({ default: m.AdminCollectionsPage })))

function RouteFallback() {
  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <LoadingState label="Carregando" />
    </Box>
  )
}

function HomeRoute() {
  const { user, persona } = useUser()
  const simulation = useSimulation()
  if (simulation.isActive) return <SimulatedReaderHomePage />
  if (persona === 'admin' && user?.isAdmin) return <AdminOverviewPage />
  return persona === 'writer' ? <WriterHomePage /> : <SimulatedReaderHomePage />
}

function RequireRole({ role, children }: { role: UserRole; children: ReactElement }) {
  const { persona } = useUser()
  if (persona !== role) return <Navigate to="/home" replace />
  return children
}

function RequireAdmin({ children }: { children: ReactElement }) {
  const { user, persona } = useUser()
  if (persona !== 'admin' || !user?.isAdmin) return <Navigate to="/home" replace />
  return children
}

function AdminSessionSync() {
  const { user, persona } = useUser()
  const session = useAdminSession()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (persona !== 'admin' || !user?.isAdmin) clearAdminSession(true)
  }, [persona, user?.isAdmin])

  useEffect(() => {
    if (!session) queryClient.removeQueries({ queryKey: [ADMIN_QUERY_ROOT] })
  }, [session, queryClient])

  return null
}

function AppRoutes() {
  const { user, personaReady } = useUser()
  const isDesktop = useMediaQuery('(min-width: 900px)', { noSsr: true })
  const Layout = isDesktop ? DesktopLayout : MobileLayout

  if (user && !personaReady) {
    return (
      <Box sx={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingState label="Preparando seu potinho" />
      </Box>
    )
  }

  if (!user) {
    return (
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verificar-email" element={<VerifyEmailPage />} />
          <Route path="/esqueci-minha-senha" element={<ForgotPasswordPage />} />
          <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
          <Route path="/confirmar-troca-email" element={<ConfirmEmailChangePage />} />
          <Route path="/convite/:token" element={<InviteAcceptPage />} />
          {import.meta.env.DEV && <Route path="/test" element={<TestPage />} />}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    )
  }

  return (
    <Suspense fallback={<RouteFallback />}>
      <AdminSessionSync />
      <Routes>
        <Route path="/verificar-email" element={<VerifyEmailPage />} />
        <Route path="/esqueci-minha-senha" element={<ForgotPasswordPage />} />
        <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
        <Route path="/confirmar-troca-email" element={<ConfirmEmailChangePage />} />
        <Route path="/convite/:token" element={<InviteAcceptPage />} />
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="home" element={<HomeRoute />} />
          <Route path="colecoes" element={<RequireRole role="writer"><CollectionsListPage /></RequireRole>} />
          <Route path="colecoes/:slug" element={<CollectionPlayPage />} />
          <Route path="conquistas" element={<ConquistasPage />} />
          <Route path="favoritas" element={<FavoritasPage />} />
          <Route path="notificacoes" element={<NotificationsPage />} />
          <Route path="colecoes/:slug/gerenciar" element={<RequireRole role="writer"><CollectionManagePage /></RequireRole>} />
          <Route path="colecoes/:slug/gerenciar/leitores/:email" element={<RequireRole role="writer"><ReaderCollectionPage /></RequireRole>} />
          <Route path="conta" element={<ContaPage />} />
          <Route path="admin/usuarios" element={<RequireAdmin><AdminUsersPage /></RequireAdmin>} />
          <Route path="admin/colecoes" element={<RequireAdmin><AdminCollectionsPage /></RequireAdmin>} />
        </Route>
        {import.meta.env.DEV && <Route path="test" element={<TestPage />} />}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}

function App() {
  useEffect(() => {
    const mockMode = import.meta.env.DEV && !import.meta.env.VITE_API_URL
    if ('serviceWorker' in navigator && !mockMode) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <RouteMeta />
        <UserProvider>
          <PersonaBootstrap />
          <BackgroundProvider>
            <ReaderProvider>
              <SimulationProvider>
                <AppRoutes />
              </SimulationProvider>
            </ReaderProvider>
            <Toaster
              position="top-center"
              gap={8}
              toastOptions={{ unstyled: true }}
            />
          </BackgroundProvider>
        </UserProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
