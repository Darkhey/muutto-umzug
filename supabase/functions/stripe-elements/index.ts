
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from "https://esm.sh/v135/@supabase/supabase-js@2.43.2"
import Stripe from 'npm:stripe@18.3.0'

interface StripeResult {
  subscriptionId?: string;
  clientSecret?: string | null;
  status?: string;
  paymentIntentId?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')

if (!supabaseUrl || !serviceRole || !stripeSecret) {
  console.error('Fehlende Umgebungsvariablen:', { supabaseUrl: !!supabaseUrl, serviceRole: !!serviceRole, stripeSecret: !!stripeSecret })
  throw new Error('Missing required environment variables')
}

const supabase = createClient(supabaseUrl, serviceRole)
const stripe = new Stripe(stripeSecret, { apiVersion: '2023-10-16' })

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  console.log('Stripe Elements Function aufgerufen')

  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    console.error('Authentifizierungsfehler:', error)
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  console.log('Benutzer authentifiziert:', user.email)

  const body = await req.json()
  const { paymentMethodId, mode = 'monthly', priceId } = body

  console.log('Request Body:', { paymentMethodId: !!paymentMethodId, mode, priceId })

  if (!paymentMethodId) {
    return new Response(JSON.stringify({ error: 'paymentMethodId is required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  if (!priceId) {
    return new Response(JSON.stringify({ error: 'priceId is required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    // Prüfen ob Stripe Customer bereits existiert
    const { data: existingCustomer } = await supabase
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    let customerId: string

    if (existingCustomer?.stripe_customer_id) {
      customerId = existingCustomer.stripe_customer_id
      console.log('Existierender Customer gefunden:', customerId)
      
      // Payment Method anhängen
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      })
      await stripe.customers.update(customerId, {
        invoice_settings: { default_payment_method: paymentMethodId },
      })
    } else {
      // Neuen Stripe Customer erstellen
      console.log('Neuen Customer erstellen für:', user.email)
      const customer = await stripe.customers.create({
        email: user.email,
        payment_method: paymentMethodId,
        invoice_settings: { default_payment_method: paymentMethodId },
        metadata: { user_id: user.id },
      })
      customerId = customer.id

      // Customer in Datenbank speichern
      await supabase.from('stripe_customers').insert({
        user_id: user.id,
        stripe_customer_id: customerId,
        email: user.email,
      })
      console.log('Customer in DB gespeichert:', customerId)
    }

    let result: StripeResult = {}

    if (mode === 'monthly') {
      console.log('Erstelle Abonnement mit Preis:', priceId)
      // Abonnement erstellen
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_settings: { payment_method_types: ['card'] },
        expand: ['latest_invoice.payment_intent'],
      })

      console.log('Abonnement erstellt:', subscription.id, 'Status:', subscription.status)

      result = {
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
        status: subscription.status,
      }
    } else {
      console.log('Erstelle Einmalzahlung mit Preis:', priceId)
      // Preis abrufen für Einmalzahlung
      const priceObj = await stripe.prices.retrieve(priceId)
      const paymentIntent = await stripe.paymentIntents.create({
        amount: priceObj.unit_amount || 999,
        currency: priceObj.currency || 'eur',
        customer: customerId,
        payment_method: paymentMethodId,
        confirm: true,
        return_url: `https://vzolmmlztzewveszdykwq.supabase.co/premium?success=true`,
      })

      console.log('Payment Intent erstellt:', paymentIntent.id, 'Status:', paymentIntent.status)

      result = {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        status: paymentIntent.status,
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error('Stripe Fehler:', errorMessage)
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
