import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { usePremiumStatus } from '@/hooks/usePremiumStatus'
import { SUPABASE_URL, supabase } from '@/integrations/supabase/client'
import { useState } from 'react'

export const UpgradeCTA = () => {
  const { status, loading } = usePremiumStatus()
  const [upgrading, setUpgrading] = useState(false)

  const handleUpgrade = async () => {
    setUpgrading(true)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const token = session?.access_token
      const res = await fetch(`${SUPABASE_URL}/functions/v1/stripe-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mode: 'one-time' }),
      })
      if (!res.ok) throw new Error('Request failed')
      const data = await res.json()
      if (data.url && typeof data.url === 'string') {
        window.location.href = data.url
      }
    } catch (err) {
      console.error('Upgrade error', err)
    } finally {
      setUpgrading(false)
    }
  }

  if (loading) return null
  if (status?.is_premium) {
    return <Badge variant="outline">Premium aktiviert</Badge>
  }
  return (
    <Button
      onClick={handleUpgrade}
      disabled={upgrading}
      className="bg-yellow-500 text-white"
    >
      {upgrading ? 'Lädt...' : 'Premium freischalten'}
    </Button>
  )
}
