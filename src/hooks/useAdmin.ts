import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { api, ApiRequestError } from '../services/api'
import { clearAdminSession, useAdminSession } from '../services/adminSession'

export const ADMIN_QUERY_ROOT = 'admin'

export function useAdminOverviewQuery() {
  const session = useAdminSession()
  const query = useQuery({
    queryKey: [ADMIN_QUERY_ROOT, 'overview'],
    queryFn: () => {
      if (!session) throw new ApiRequestError('Confirme sua identidade para continuar no modo admin.', 403, undefined, 'ADMIN_REAUTH_REQUIRED')
      return api.adminOverview(session.token)
    },
    enabled: !!session,
    staleTime: 60_000,
    retry: (count, error) => !(error instanceof ApiRequestError && [403, 429].includes(error.status)) && count < 2,
  })

  useEffect(() => {
    if (query.error instanceof ApiRequestError && query.error.code === 'ADMIN_REAUTH_REQUIRED') clearAdminSession(false)
  }, [query.error])

  return { ...query, session }
}
