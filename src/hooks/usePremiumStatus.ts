import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

export interface PremiumStatus {
  user_id: string
  is_premium: boolean
  premium_mode: 'one-time' | 'monthly' | null
  purchase_date: string | null
  valid_until: string | null
  stripe_subscription_id: string | null
  features_enabled: Record<string, unknown> | null
}

export function usePremiumStatus() {
  const { user } = useAuth()
  const [status, setStatus] = useState<PremiumStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setStatus(null)
      setLoading(false)
      return
    }
    const fetchStatus = async () => {
      const { data } = await supabase
        .from('premium_status')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()
      if (data) setStatus(data as PremiumStatus)
      setLoading(false)
    }
    fetchStatus()
  }, [user])

  return { status, loading }
}
