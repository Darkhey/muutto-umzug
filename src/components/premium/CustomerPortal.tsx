import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { usePremiumStatus } from '@/hooks/usePremiumStatus'
import { SUPABASE_URL, supabase } from '@/integrations/supabase/client'
import { Loader2, Settings, ExternalLink } from 'lucide-react'

export const CustomerPortal = () => {
  const { status, loading } = usePremiumStatus()
  const { toast } = useToast()
  const [opening, setOpening] = useState(false)

  const handleOpenPortal = async () => {
    if (!status?.is_premium) {
      toast({
        title: 'Kein Premium-Abo',
        description: 'Du hast kein aktives Premium-Abo.',
        variant: 'destructive',
      })
      return
    }

    setOpening(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) {
        throw new Error('Nicht angemeldet')
      }

      // Get customer ID from database
      const { data: customerData, error: customerError } = await supabase
        .from('stripe_customers')
        .select('stripe_customer_id')
        .single()

      if (customerError || !customerData?.stripe_customer_id) {
        throw new Error('Kunde nicht gefunden')
      }

      // Create portal session
      const res = await fetch(`${SUPABASE_URL}/functions/v1/stripe-portal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          customer_id: customerData.stripe_customer_id 
        }),
      })

      if (!res.ok) {
        throw new Error('Fehler beim Öffnen des Kundenportals')
      }

      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('Keine Portal-URL erhalten')
      }

    } catch (err) {
      console.error('Portal error', err)
      toast({
        title: 'Fehler beim Öffnen des Portals',
        description: err instanceof Error ? err.message : 'Unbekannter Fehler',
        variant: 'destructive',
      })
    } finally {
      setOpening(false)
    }
  }

  if (loading) return null
  if (!status?.is_premium) return null

  return (
    <Button
      onClick={handleOpenPortal}
      disabled={opening}
      variant="outline"
      className="w-full"
    >
      {opening ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Öffne Portal...
        </>
      ) : (
        <>
          <Settings className="h-4 w-4 mr-2" />
          Abo verwalten
        </>
      )}
    </Button>
  )
}

export default CustomerPortal 