
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Invitation } from '@/types/invitation'
import { useToast } from '@/hooks/use-toast'

export function usePendingInvitations() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchInvites = useCallback(async () => {
    if (!user?.email) return
    
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: queryError } = await supabase
        .from('household_members')
        .select(`
          *,
          households!inner(name, move_date)
        `)
        .eq('email', user.email.toLowerCase())
        .is('user_id', null)
        .is('joined_at', null)

      if (queryError) {
        console.error('Error fetching invitations:', queryError)
        throw queryError
      }

      setInvitations((data as Invitation[]) || [])
    } catch (err) {
      console.error('Error fetching invitations:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unbekannter Fehler'
      setError(new Error(errorMessage))
      toast({
        title: "Fehler beim Laden der Einladungen",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [user?.email, toast])

  useEffect(() => {
    fetchInvites()
  }, [fetchInvites])

  return { invitations, loading, error, refetch: fetchInvites }
}
