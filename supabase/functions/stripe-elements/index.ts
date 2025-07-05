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
const priceMonthly = Deno.env.get('STRIPE_PRICE_MONTHLY')
const priceOneTime = Deno.env.get('STRIPE_PRICE_ONE_TIME')
const frontendUrl = Deno.env.get('FRONTEND_URL')

if (!supabaseUrl || !serviceRole || !stripeSecret || !priceMonthly || !priceOneTime || !frontendUrl) {
  throw new Error('Missing required environment variables')
}

const supabase = createClient(supabaseUrl, serviceRole)
const stripe = new Stripe(stripeSecret, { apiVersion: '2023-10-16' })

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const body = await req.json()
  const { paymentMethodId, mode = 'monthly', priceId } = body

  if (!paymentMethodId) {
    return new Response(JSON.stringify({ error: 'paymentMethodId is required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    // Check if user already has a Stripe customer
    const { data: existingCustomer } = await supabase
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    let customerId: string

    if (existingCustomer?.stripe_customer_id) {
      customerId = existingCustomer.stripe_customer_id
      // Update payment method
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      })
      await stripe.customers.update(customerId, {
        invoice_settings: { default_payment_method: paymentMethodId },
      })
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        payment_method: paymentMethodId,
        invoice_settings: { default_payment_method: paymentMethodId },
        metadata: { user_id: user.id },
      })
      customerId = customer.id

      // Save customer to database
      await supabase.from('stripe_customers').insert({
        user_id: user.id,
        stripe_customer_id: customerId,
        email: user.email,
      })
    }

    let result: StripeResult = {}

    // Dynamische Preis-ID verwenden, falls vorhanden
    const usedPriceId = priceId || (mode === 'monthly' ? priceMonthly : priceOneTime)

    if (mode === 'monthly') {
      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: usedPriceId }],
        payment_settings: { payment_method_types: ['card'] },
        expand: ['latest_invoice.payment_intent'],
      })

      result = {
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
        status: subscription.status,
      }
    } else {
      // Create one-time payment
      const priceObj = await stripe.prices.retrieve(usedPriceId)
      const paymentIntent = await stripe.paymentIntents.create({
        amount: priceObj.unit_amount || 999,
        currency: priceObj.currency || 'eur',
        customer: customerId,
        payment_method: paymentMethodId,
        confirm: true,
        return_url: `${frontendUrl}/premium?success=true`,
      })

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
    console.error('Stripe error:', errorMessage)
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
}) 