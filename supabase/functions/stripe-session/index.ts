import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'npm:stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, serviceRole)

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!
const priceOneTime = Deno.env.get('STRIPE_PRICE_ONE_TIME')!
const priceMonthly = Deno.env.get('STRIPE_PRICE_MONTHLY')!

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
  const mode = body.mode === 'monthly' ? 'monthly' : 'one-time'
  const success = body.success_url || `${supabaseUrl}/premium?success=true`
  const cancel = body.cancel_url || `${supabaseUrl}/premium?canceled=true`

  const session = await stripe.checkout.sessions.create({
    mode: mode === 'monthly' ? 'subscription' : 'payment',
    line_items: [{ price: mode === 'monthly' ? priceMonthly : priceOneTime, quantity: 1 }],
    success_url: success,
    cancel_url: cancel,
    client_reference_id: user.id,
    customer_email: user.email || undefined,
  })

  return new Response(JSON.stringify({ url: session.url }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
