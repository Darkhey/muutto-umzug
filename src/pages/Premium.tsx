
import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { usePremiumStatus } from '@/hooks/usePremiumStatus'
import StripeElementsCheckout from '@/components/checkout/StripeElementsCheckout'
import { Crown, Check, ArrowLeft, CreditCard, Calendar, Loader2 } from 'lucide-react'
import CustomerPortal from '@/components/premium/CustomerPortal'
import { SUPABASE_URL } from '@/integrations/supabase/client'

interface StripeProduct {
  id: string
  name: string
  description?: string
  default_price?: {
    id: string
    unit_amount: number
    currency: string
    recurring?: {
      interval: string
    }
  }
}

export default function Premium() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { status, loading } = usePremiumStatus()
  const [showCheckout, setShowCheckout] = useState(false)
  const [selectedMode, setSelectedMode] = useState<'monthly' | 'one-time'>('monthly')
  const [products, setProducts] = useState<StripeProduct[]>([])
  const [priceIds, setPriceIds] = useState<{ monthly?: string; oneTime?: string }>({})
  const [loadingProducts, setLoadingProducts] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true)
      try {
        console.log('Lade Stripe Produkte...')
        const res = await fetch(`${SUPABASE_URL}/functions/v1/stripe-products`)
        
        if (!res.ok) {
          const errorText = await res.text()
          console.error('HTTP Fehler:', res.status, errorText)
          throw new Error(`HTTP ${res.status}: ${errorText}`)
        }
        
        const data = await res.json()
        console.log('Stripe Produkte erhalten:', data)
        
        if (data.error) throw new Error(data.error)

        setProducts(data)

        // Automatisch Monthly und One-Time Preise identifizieren
        const monthlyProduct = data.find((p: StripeProduct) => 
          p.default_price?.recurring?.interval === 'month'
        )
        const oneTimeProduct = data.find((p: StripeProduct) => 
          !p.default_price?.recurring
        )

        console.log('Monthly Produkt:', monthlyProduct)
        console.log('One-Time Produkt:', oneTimeProduct)

        setPriceIds({
          monthly: monthlyProduct?.default_price?.id,
          oneTime: oneTimeProduct?.default_price?.id
        })

      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Unbekannter Fehler'
        console.error('Fehler beim Laden der Produkte:', errorMessage)
        toast({ 
          title: 'Fehler beim Laden der Preise', 
          description: errorMessage, 
          variant: 'destructive' 
        })
      } finally {
        setLoadingProducts(false)
      }
    }
    fetchProducts()
  }, [toast])

  useEffect(() => {
    const success = searchParams.get('success')
    const canceled = searchParams.get('canceled')

    if (success === 'true') {
      toast({
        title: 'Premium erfolgreich aktiviert!',
        description: 'Du hast jetzt Zugriff auf alle Premium-Funktionen.',
      })
      searchParams.delete('success')
      setSearchParams(searchParams)
    }
    if (canceled === 'true') {
      toast({
        title: 'Zahlung abgebrochen',
        description: 'Du kannst jederzeit erneut versuchen, Premium zu aktivieren.',
        variant: 'destructive',
      })
      searchParams.delete('canceled')
      setSearchParams(searchParams)
    }
  }, [searchParams, setSearchParams, toast])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (status?.is_premium) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück
            </Button>
          </div>
          <Card className="text-center">
            <CardHeader>
              <div className="flex items-center justify-center gap-2 mb-4">
                <Crown className="h-8 w-8 text-yellow-500" />
                <CardTitle className="text-2xl">Premium aktiviert!</CardTitle>
              </div>
              <Badge variant="outline" className="text-lg">
                {status.premium_mode === 'monthly' ? 'Monatliches Abo' : 'Einmalzahlung'}
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Du hast bereits Zugriff auf alle Premium-Funktionen.
              </p>
              <div className="space-y-3">
                <Button onClick={() => navigate('/dashboard')} className="w-full">
                  Zum Dashboard
                </Button>
                <CustomerPortal />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const features = [
    'Mehrere Haushalte pro Umzug',
    'KI-gestützte Aufgabenplanung',
    'Merge-Analyse und Vergleich von Haushalten',
    'Smart-Timeline mit Drag&Drop',
    'Automatische Vertragsanalyse (via Banking API)',
    'Individuelle Rollenvergabe & Exportmöglichkeiten',
  ]

  const monthlyProduct = products.find(p => p.default_price?.recurring?.interval === 'month')
  const oneTimeProduct = products.find(p => !p.default_price?.recurring)

  function formatPrice(price: { unit_amount: number | null; currency: string } | undefined) {
    if (!price) return ''
    const amount = (price.unit_amount || 0) / 100
    return amount.toLocaleString('de-DE', { style: 'currency', currency: price.currency?.toUpperCase() || 'EUR' })
  }

  const renderLoadingCard = () => (
    <Card>
      <CardHeader className="text-center">
        <div className="h-7 bg-gray-200 rounded w-3/4 mx-auto animate-pulse"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mt-2 animate-pulse"></div>
        <div className="h-5 bg-gray-200 rounded w-full mx-auto mt-2 animate-pulse"></div>
      </CardHeader>
      <CardContent>
        <div className="h-10 bg-gray-300 rounded w-full animate-pulse"></div>
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
        </div>
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="h-8 w-8 text-yellow-500" />
            <h1 className="text-3xl font-bold">Premium freischalten</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Schalte alle Funktionen frei, um deinen Umzug noch reibungsloser zu gestalten
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  Premium-Funktionen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
          <div>
            {loadingProducts ? renderLoadingCard() : (
              <Tabs value={selectedMode} onValueChange={(value) => setSelectedMode(value as 'monthly' | 'one-time')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="monthly" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Monatlich
                  </TabsTrigger>
                  <TabsTrigger value="one-time" className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Einmalig
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="monthly" className="mt-6">
                  <Card>
                    <CardHeader className="text-center">
                      <CardTitle className="text-2xl">{monthlyProduct?.name || 'Monatliches Abo'}</CardTitle>
                      <div className="flex items-center justify-center gap-2">
                        <Badge variant="outline" className="text-2xl font-bold">
                          {formatPrice(monthlyProduct?.default_price)}
                        </Badge>
                        <span className="text-muted-foreground">/ Monat</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {monthlyProduct?.description || 'Jederzeit kündbar • Automatische Verlängerung'}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        onClick={() => setShowCheckout(true)}
                        className="w-full bg-yellow-500 hover:bg-yellow-600"
                        disabled={!priceIds.monthly}
                      >
                        {priceIds.monthly ? 'Monatliches Abo starten' : 'Nicht verfügbar'}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="one-time" className="mt-6">
                  <Card>
                    <CardHeader className="text-center">
                      <CardTitle className="text-2xl">{oneTimeProduct?.name || 'Einmalzahlung'}</CardTitle>
                      <div className="flex items-center justify-center gap-2">
                        <Badge variant="outline" className="text-2xl font-bold">
                          {formatPrice(oneTimeProduct?.default_price)}
                        </Badge>
                        <span className="text-muted-foreground">einmalig</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {oneTimeProduct?.description || 'Lebenslanger Zugang • Keine automatische Verlängerung'}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        onClick={() => setShowCheckout(true)}
                        className="w-full bg-yellow-500 hover:bg-yellow-600"
                        disabled={!priceIds.oneTime}
                      >
                        {priceIds.oneTime ? 'Einmalzahlung tätigen' : 'Nicht verfügbar'}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
        <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Zahlung abschließen</DialogTitle>
            </DialogHeader>
            <StripeElementsCheckout
              mode={selectedMode}
              priceId={selectedMode === 'monthly' ? priceIds.monthly : priceIds.oneTime}
              onSuccess={() => {
                setShowCheckout(false)
                navigate('/premium?success=true', { replace: true })
              }}
              onCancel={() => setShowCheckout(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
