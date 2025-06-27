import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { HouseholdMember } from '@/types/household'

interface Invitation extends HouseholdMember {
  households: {
    name: string
    move_date: string
  }
}

export function usePendingInvitations() {
  const { user } = useAuth()
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(false)

  const fetchInvites = async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('household_members')
      .select('*, households!inner(name, move_date)')
      .eq('email', user.email)
      .is('joined_at', null)

    if (!error) {
      setInvitations((data as Invitation[]) || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchInvites()
  }, [user])

  return { invitations, loading, refetch: fetchInvites }
}
