import type { ReactElement } from 'react'
import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useMediaQuery } from '@mui/material'
import { MobileLayout } from './components/MobileLayout'
import { DesktopLayout } from './components/DesktopLayout'
import { PersonaBootstrap } from './components/PersonaBootstrap'
import { UserProvider, useUser, type UserRole } from './context/UserContext'
import { BackgroundProvider } from './context/BackgroundContext'
import { SimulationProvider, useSimulation } from './context/SimulationContext'
import { ReaderProvider } from './context/ReaderContext'
import { WriterHomePage } from './pages/WriterHomePage'
import { SimulatedReaderHomePage } from './pages/SimulatedReaderHomePage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { CollectionsListPage } from './pages/CollectionsListPage'
import { CollectionPlayPage } from './pages/CollectionPlayPage'
import { CollectionManagePage } from './pages/CollectionManagePage'
import { ReaderCollectionPage } from './pages/ReaderCollectionPage'
import { ConquistasPage } from './pages/ConquistasPage'
import { FavoritasPage } from './pages/FavoritasPage'
import { TestPage } from './pages/TestPage'
import { LandingPage } from './pages/LandingPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { VerifyEmailPage } from './pages/VerifyEmailPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { ContaPage } from './pages/ContaPage'
import { ConfirmEmailChangePage } from './pages/ConfirmEmailChangePage'
import { MailLogPage } from './pages/MailLogPage'
import { InviteAcceptPage } from './pages/InviteAcceptPage'
import { LoadingState } from './components/ui'
import { CaptchaProvider } from './context/CaptchaContext'
import { Box } from '@mui/material'

function HomeRoute() {
  const { persona } = useUser()
  const simulation = useSimulation()
  if (simulation.isActive) return <SimulatedReaderHomePage />
  return persona === 'writer' ? <WriterHomePage /> : <SimulatedReaderHomePage />
}

function RequireRole({ role, children }: { role: UserRole; children: ReactElement }) {
  const { persona } = useUser()
  if (persona !== role) return <Navigate to="/home" replace />
  return children
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
      <CaptchaProvider>
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
      </CaptchaProvider>
    )
  }

  return (
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
        <Route path="colecoes/:slug/gerenciar" element={<RequireRole role="writer"><CollectionManagePage /></RequireRole>} />
        <Route path="colecoes/:slug/gerenciar/leitores/:email" element={<RequireRole role="writer"><ReaderCollectionPage /></RequireRole>} />
        <Route path="conta" element={<ContaPage />} />
        <Route path="mail-logs" element={<RequireRole role="writer"><MailLogPage /></RequireRole>} />
      </Route>
      {import.meta.env.DEV && <Route path="test" element={<TestPage />} />}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

function App() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  return (
    <BrowserRouter>
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
  )
}

export default App
