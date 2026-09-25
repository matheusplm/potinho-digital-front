import { useEffect, useRef } from 'react'
import { useUser, type Persona } from '../context/UserContext'
import { useCollectionsQuery } from '../hooks/useNotes'
import { resolvePersona, savedPersona } from '../utils/collectionAccess'

export function PersonaBootstrap() {
  const { user, persona, personaReady, setPersona, markPersonaReady } = useUser()
  const { data: collections, isSuccess, isError } = useCollectionsQuery({ enabled: !!user })
  const savedAtStart = useRef<{ userId: string; persona: Persona | null } | null>(null)
  if (user && savedAtStart.current?.userId !== user.id) savedAtStart.current = { userId: user.id, persona: savedPersona(user.id) }

  useEffect(() => {
    if (!user || personaReady) return
    if (isSuccess && collections) {
      setPersona(resolvePersona(collections, user.id, user.role, user.isAdmin === true))
      markPersonaReady()
    } else if (isError) {
      setPersona(user.role)
      markPersonaReady()
    }
  }, [user, collections, isSuccess, isError, personaReady, setPersona, markPersonaReady])

  useEffect(() => {
    if (!personaReady || !user) return
    if (persona === 'admin' && user.isAdmin === false) {
      setPersona(user.role)
      return
    }
    const start = savedAtStart.current
    if (persona !== 'admin' && user.isAdmin === true && start?.userId === user.id && start.persona === 'admin') {
      savedAtStart.current = { userId: user.id, persona: null }
      setPersona('admin')
    }
  }, [personaReady, persona, user, setPersona])

  return null
}
