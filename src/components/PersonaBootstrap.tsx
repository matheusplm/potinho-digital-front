import { useEffect, useRef } from 'react'
import { useUser, type Persona } from '../context/UserContext'
import { useCollectionsQuery } from '../hooks/useNotes'
import { resolvePersona, savedPersona } from '../utils/collectionAccess'

export function PersonaBootstrap() {
  const { user, persona, personaReady, setPersona, markPersonaReady } = useUser()
  const { data: collections, isSuccess, isError } = useCollectionsQuery({ enabled: !!user })
  const pendingAdminRestore = useRef<Persona | null>(null)

  useEffect(() => {
    if (!user || personaReady) return
    if (isSuccess && collections) {
      const wasAdmin = savedPersona(user.id) === 'admin'
      const resolved = resolvePersona(collections, user.id, user.role, user.isAdmin === true)
      pendingAdminRestore.current = wasAdmin && resolved !== 'admin' && user.isAdmin === undefined ? resolved : null
      setPersona(resolved)
      markPersonaReady()
    } else if (isError) {
      pendingAdminRestore.current = null
      setPersona(user.role)
      markPersonaReady()
    }
  }, [user, collections, isSuccess, isError, personaReady, setPersona, markPersonaReady])

  useEffect(() => {
    if (!personaReady || !user) return
    if (persona === 'admin' && user.isAdmin === false) {
      pendingAdminRestore.current = null
      setPersona(user.role)
      return
    }
    const bootPersona = pendingAdminRestore.current
    if (!bootPersona) return
    if (persona !== bootPersona) {
      pendingAdminRestore.current = null
      return
    }
    if (user.isAdmin !== undefined) {
      pendingAdminRestore.current = null
      if (user.isAdmin) setPersona('admin')
    }
  }, [personaReady, persona, user, setPersona])

  return null
}
