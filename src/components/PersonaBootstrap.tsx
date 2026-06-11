import { useEffect } from 'react'
import { useUser } from '../context/UserContext'
import { useCollectionsQuery } from '../hooks/useNotes'
import { resolvePersona } from '../utils/collectionAccess'

export function PersonaBootstrap() {
  const { user, personaReady, setPersona, markPersonaReady } = useUser()
  const { data: collections, isSuccess } = useCollectionsQuery({ enabled: !!user })

  useEffect(() => {
    if (!user || !isSuccess || !collections || personaReady) return
    setPersona(resolvePersona(collections, user.id, user.role))
    markPersonaReady()
  }, [user, collections, isSuccess, personaReady, setPersona, markPersonaReady])

  return null
}
