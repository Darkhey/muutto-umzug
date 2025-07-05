
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import Stripe from 'npm:stripe@18.3.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')
if (!stripeSecret) {
  console.error('STRIPE_SECRET_KEY nicht gefunden')
  throw new Error('Missing STRIPE_SECRET_KEY')
}

const stripe = new Stripe(stripeSecret, { apiVersion: '2023-10-16' })

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  console.log('Stripe Products Function aufgerufen')

  try {
    // Alle aktiven Produkte mit ihren Preisen laden
    const products = await stripe.products.list({
      active: true,
      expand: ['data.default_price'],
      limit: 20,
    })

    console.log(`${products.data.length} Produkte gefunden`)

    // Filter nur Produkte mit default_price
    const result = products.data.filter(p => p.default_price)

    console.log(`${result.length} Produkte mit Preisen gefiltert`)

    // Log für Debugging
    result.forEach(product => {
      console.log(`Produkt: ${product.name} (${product.id}), Preis: ${product.default_price?.id}`)
    })

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
