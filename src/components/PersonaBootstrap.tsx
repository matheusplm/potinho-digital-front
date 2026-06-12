import { useEffect } from 'react'
import { useUser } from '../context/UserContext'
import { useCollectionsQuery } from '../hooks/useNotes'
import { resolvePersona } from '../utils/collectionAccess'

export function PersonaBootstrap() {
  const { user, personaReady, setPersona, markPersonaReady } = useUser()
  const { data: collections, isSuccess, isError } = useCollectionsQuery({ enabled: !!user })

  useEffect(() => {
    if (!user || personaReady) return
    if (isSuccess && collections) {
      setPersona(resolvePersona(collections, user.id, user.role))
      markPersonaReady()
    } else if (isError) {
      setPersona(user.role)
      markPersonaReady()
    }
  }, [user, collections, isSuccess, isError, personaReady, setPersona, markPersonaReady])

  return null
}
