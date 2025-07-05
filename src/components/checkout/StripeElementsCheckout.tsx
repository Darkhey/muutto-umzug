
import { useState } from 'react'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { SUPABASE_URL, supabase } from '@/integrations/supabase/client'
import { Loader2, CreditCard, Crown } from 'lucide-react'

interface StripeElementsCheckoutProps {
  mode?: 'monthly' | 'one-time'
  priceId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
}

export const StripeElementsCheckout = ({ 
  mode = 'monthly', 
  priceId,
  onSuccess, 
  onCancel 
}: StripeElementsCheckoutProps) => {
  const stripe = useStripe()
  const elements = useElements()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    console.log('Stripe Checkout gestartet:', { mode, priceId })

    if (!stripe || !elements) {
      setError('Stripe ist nicht verfügbar')
      setLoading(false)
      return
    }

    if (!priceId) {
      setError('Preis-ID nicht verfügbar')
      setLoading(false)
      return
    }

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      setError('Kartenelement nicht gefunden')
      setLoading(false)
      return
    }

    try {
      // 1. PaymentMethod erstellen
      console.log('Erstelle PaymentMethod...')
      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      })

      if (pmError) {
        console.error('PaymentMethod Fehler:', pmError)
        setError(pmError.message || 'Fehler bei der Kartenerstellung')
        setLoading(false)
        return
      }

      if (!paymentMethod) {
        setError('PaymentMethod konnte nicht erstellt werden')
        setLoading(false)
        return
      }

      console.log('PaymentMethod erstellt:', paymentMethod.id)

      // 2. Session Token holen
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) {
        setError('Nicht angemeldet')
        setLoading(false)
        return
      }

      // 3. Payment/Subscription im Backend erstellen
      console.log('Rufe stripe-elements Function auf...')
      const res = await fetch(`${SUPABASE_URL}/functions/v1/stripe-elements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          paymentMethodId: paymentMethod.id,
          mode,
          priceId
        }),
      })

      const data = await res.json()
      console.log('Stripe Elements Response:', data)

      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}: Fehler beim Erstellen der Zahlung`)
      }

      // 4. Falls erforderlich: Payment bestätigen
      if (data.clientSecret) {
        console.log('Bestätige Payment...')
        const { error: confirmError } = await stripe.confirmCardPayment(data.clientSecret)
        if (confirmError) {
          console.error('Payment Confirmation Fehler:', confirmError)
          setError(confirmError.message || 'Zahlung fehlgeschlagen')
          setLoading(false)
          return
        }
      }

      // Erfolg!
      console.log('Zahlung erfolgreich!')
      toast({
        title: 'Zahlung erfolgreich!',
        description: mode === 'monthly' 
          ? 'Dein Premium-Abo ist aktiviert.' 
          : 'Dein Premium-Zugang ist freigeschaltet.',
      })

      onSuccess?.()
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unbekannter Fehler'
      console.error('Stripe Checkout Fehler:', errorMessage)
      setError(errorMessage)
      toast({
        title: 'Fehler bei der Zahlung',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const getPriceDisplay = () => {
    if (mode === 'monthly') {
      return { amount: '9,99', period: 'Monat' }
    }
    return { amount: '9,99', period: 'einmalig' }
  }

  const priceDisplay = getPriceDisplay()

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Crown className="h-6 w-6 text-yellow-500" />
          <CardTitle>Premium freischalten</CardTitle>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Badge variant="outline" className="text-lg font-semibold">
            {priceDisplay.amount}€
          </Badge>
          <span className="text-sm text-muted-foreground">
            {mode === 'monthly' ? '/ Monat' : 'einmalig'}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Kreditkartendaten
            </label>
            <div className="border rounded-md p-3">
              <CardElement options={cardElementOptions} />
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="flex-1"
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              disabled={loading || !stripe || !priceId}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verarbeite...
                </>
              ) : (
                'Jetzt zahlen'
              )}
            </Button>
          </div>
        </form>

        <div className="mt-4 text-xs text-muted-foreground text-center">
          Sichere Zahlung über Stripe. Deine Kartendaten werden verschlüsselt übertragen.
        </div>
      </CardContent>
    </Card>
  )
}

export default StripeElementsCheckout
