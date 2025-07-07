import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from "https://esm.sh/v135/@supabase/supabase-js@2.43.2"
import Stripe from 'npm:stripe@18.3.0'

const frontendUrl = Deno.env.get('FRONTEND_URL') || 'http://localhost:8080'

const corsHeaders = {
  'Access-Control-Allow-Origin': frontendUrl,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')

if (!supabaseUrl || !serviceRole || !stripeSecret) {
  throw new Error('Missing required environment variables')
}

const supabase = createClient(supabaseUrl, serviceRole)
const stripe = new Stripe(stripeSecret, { apiVersion: '2023-10-16' })

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Hole die Stripe Customer ID aus deiner Datenbank
    const { data: customerData, error: customerError } = await supabase
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    if (customerError || !customerData) {
      console.error('Stripe customer not found:', customerError)
      return new Response(JSON.stringify({ error: 'Stripe customer not found.' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { stripe_customer_id } = customerData

    const session = await stripe.billingPortal.sessions.create({
      customer: stripe_customer_id,
      return_url: `${frontendUrl}/premium`,
    })

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error('Stripe portal error:', errorMessage)
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
