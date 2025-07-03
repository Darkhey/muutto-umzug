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
    let isMounted = true
    if (!user) {
      setStatus(null)
      setLoading(false)
      return
    }
    const fetchStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('premium_status')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()
        if (!isMounted) return
        if (error) throw error
        if (data && typeof data === 'object') setStatus(data as PremiumStatus)
      } catch (err) {
        console.error('Failed to load premium status', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchStatus()
    return () => {
      isMounted = false
    }
  }, [user])

  return { status, loading }
}
