
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

export const useUserConsent = () => {
  const { user } = useAuth()
  const [hasConsent, setHasConsent] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchConsent = async () => {
      if (!user) {
        setHasConsent(false)
        setIsLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('ai_assistant_consent')
          .eq('id', user.id)
          .single()

        if (error) throw error

        setHasConsent(data?.ai_assistant_consent || false)
      } catch (error) {
        console.error('Error fetching consent:', error)
        setHasConsent(false)
      } finally {
        setIsLoading(false)
      }
    }

    fetchConsent()
  }, [user])

  const updateConsent = (consent: boolean) => {
    setHasConsent(consent)
  }

  return {
    hasConsent,
    isLoading,
    updateConsent
  }
}
