import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import Stripe from 'npm:stripe@18.3.0'

const frontendUrl = Deno.env.get('FRONTEND_URL') || 'http://localhost:8080'

const corsHeaders = {
  'Access-Control-Allow-Origin': frontendUrl,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')
if (!stripeSecret) throw new Error('Missing STRIPE_SECRET_KEY')

const stripe = new Stripe(stripeSecret, { apiVersion: '2023-10-16' })

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const products = await stripe.products.list({
      active: true,
      expand: ['data.default_price'],
      limit: 20,
    })

    const result = products.data.filter(p => p.default_price);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Stripe error:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
})
 