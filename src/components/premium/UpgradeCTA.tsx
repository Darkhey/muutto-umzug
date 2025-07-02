import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { usePremiumStatus } from '@/hooks/usePremiumStatus'
import { SUPABASE_URL, supabase } from '@/integrations/supabase/client'

export const UpgradeCTA = () => {
  const { status, loading } = usePremiumStatus()

  const handleUpgrade = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const token = session?.access_token
    const res = await fetch(
      `${SUPABASE_URL}/functions/v1/stripe-session`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mode: 'one-time' }),
      }
    )
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url as string
    }
  }

  if (loading) return null
  if (status?.is_premium) {
    return <Badge variant="outline">Premium aktiviert</Badge>
  }
  return (
    <Button onClick={handleUpgrade} className="bg-yellow-500 text-white">
      Premium freischalten
    </Button>
  )
}
