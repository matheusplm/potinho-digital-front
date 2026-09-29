import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { useSimulation } from '../context/SimulationContext'
import { useUser } from '../context/UserContext'
import { api } from '../services/api'
import { findTarget, hasTarget } from './dom'
import { onTour } from './events'
import { EVENT_JUMP, TOUR_STEPS, stepIndex, type StepId } from './steps'
import { TourContext, type TourApi } from './TourContext'
import { TourLayer } from './TourLayer'

const STORAGE_KEY = 'pd-tour'
const TICK_MS = 350
const MISSES_BEFORE_FALLBACK = 3

interface TourState {
  stepId: StepId
  collectionId: string | null
}

interface StoredTour extends TourState {
  userId: string
}

function readStored(): StoredTour | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as StoredTour) : null
  } catch {
    return null
  }
}

function writeStored(value: StoredTour | null) {
  try {
    if (value) localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    return
  }
}

function targetOf(stepId: StepId, collectionId: string | null) {
  const target = TOUR_STEPS[stepIndex(stepId)].target
  return typeof target === 'function' ? target(collectionId) : target
}

export function TourProvider({ children }: { children: ReactNode }) {
  const { user, persona, patchUser } = useUser()
  const { isActive: simulating } = useSimulation()
  const { pathname } = useLocation()
  const [state, setState] = useState<TourState | null>(null)
  const decidedFor = useRef<string | null>(null)

  useEffect(() => {
    if (!user?.id) {
      decidedFor.current = null
      setState(null)
      return
    }
    if (decidedFor.current === user.id) return
    const stored = readStored()
    if (stored?.userId === user.id) {
      decidedFor.current = user.id
      setState({ stepId: stored.stepId, collectionId: stored.collectionId })
    } else if (user.onboardingDone === false && persona === 'writer') {
      decidedFor.current = user.id
      setState({ stepId: 'welcome', collectionId: null })
    } else if (user.onboardingDone !== false) {
      decidedFor.current = user.id
    }
  }, [user?.id, user?.onboardingDone, persona])

  useEffect(() => {
    if (!user?.id) return
    if (state) writeStored({ userId: user.id, ...state })
    else if (readStored()?.userId === user.id) writeStored(null)
  }, [state, user?.id])

  const running = !!state && persona === 'writer' && !simulating
  const step = running ? TOUR_STEPS[stepIndex(state.stepId)] : null

  const goNext = useCallback((from: StepId) => {
    setState((current) => {
      if (!current || current.stepId !== from) return current
      const next = TOUR_STEPS[stepIndex(from) + 1]
      return next ? { ...current, stepId: next.id } : current
    })
  }, [])

  const goTo = useCallback((to: StepId) => {
    setState((current) => (current ? { ...current, stepId: to } : current))
  }, [])

  const finish = useCallback(() => {
    setState(null)
    if (user && user.onboardingDone !== true) {
      patchUser({ onboardingDone: true })
      api.markOnboardingDone().catch(() => {})
    }
  }, [user, patchUser])

  useEffect(() => {
    if (!running) return
    return onTour(({ name, collectionId }) => {
      setState((current) => {
        if (!current) return current
        const nextCollection = name === 'collection-created' && collectionId ? collectionId : current.collectionId
        const jump = EVENT_JUMP[name]
        if (stepIndex(jump) <= stepIndex(current.stepId)) return { ...current, collectionId: nextCollection }
        return { stepId: jump, collectionId: nextCollection }
      })
    })
  }, [running])

  useEffect(() => {
    if (!step || step.advance.kind !== 'route') return
    if (step.advance.test(pathname)) goNext(step.id)
  }, [step, pathname, goNext])

  useEffect(() => {
    if (!step) return
    let misses = 0
    const timer = window.setInterval(() => {
      if (step.skipWhen?.({ path: window.location.pathname, has: hasTarget })) {
        goNext(step.id)
        return
      }
      if (step.advance.kind === 'appear' && hasTarget(step.advance.target)) {
        goNext(step.id)
        return
      }
      if (step.requires && step.fallback) {
        misses = hasTarget(step.requires) ? 0 : misses + 1
        if (misses >= MISSES_BEFORE_FALLBACK) goTo(step.fallback)
      }
    }, TICK_MS)
    return () => window.clearInterval(timer)
  }, [step, goNext, goTo])

  const collectionId = state?.collectionId ?? null

  useEffect(() => {
    if (!step || step.advance.kind !== 'click') return
    const targetId = targetOf(step.id, collectionId)
    if (!targetId) return
    const onClick = (event: MouseEvent) => {
      const target = findTarget(targetId)
      if (target && event.target instanceof Node && target.contains(event.target)) window.setTimeout(() => goNext(step.id), 0)
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [step, collectionId, goNext])

  const value = useMemo<TourApi>(() => ({
    step,
    collectionId,
    start: () => setState({ stepId: 'welcome', collectionId: null }),
    next: () => {
      if (!step) return
      if (step.id === 'done') finish()
      else goNext(step.id)
    },
    skip: () => {
      if (step) goNext(step.id)
    },
    exit: finish,
  }), [step, collectionId, finish, goNext])

  return (
    <TourContext.Provider value={value}>
      {children}
      {step && <TourLayer step={step} collectionId={collectionId} />}
    </TourContext.Provider>
  )
}
