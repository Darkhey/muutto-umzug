import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Invitation } from '@/types/invitation'

export function usePendingInvitations() {
  const { user } = useAuth()
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchInvites = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data, error: queryError } = await supabase
        .from('household_members')
        .select('*, households!inner(name, move_date)')
        .eq('email', user.email)
        .is('joined_at', null)

      if (queryError) throw queryError

      setInvitations((data as Invitation[]) || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching invitations:', err)
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchInvites()
  }, [user, fetchInvites])

  return { invitations, loading, error, refetch: fetchInvites }
}
