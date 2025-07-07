import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/v135/@supabase/supabase-js@2.43.2'
import Stripe from 'npm:stripe@18.3.0'

// Define types for clarity
type CheckoutSession = Stripe.Checkout.Session
type StripeSubscription = Stripe.Subscription
type PaymentIntent = Stripe.PaymentIntent

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')
const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

if (!supabaseUrl || !serviceRole || !stripeSecret || !endpointSecret) {
  throw new Error('Missing required environment variables')
}

const supabase = createClient(supabaseUrl, serviceRole)
const stripe = new Stripe(stripeSecret, { apiVersion: '2023-10-16' })

// Helper function to get user_id from customer_id
async function getUserFromCustomer(customerId: string) {
  const { data: customerData, error: customerError } = await supabase
    .from('stripe_customers')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single()
  
  if (customerError || !customerData) {
    throw new Error('Customer not found')
  }
  
  return customerData.user_id
}

// Helper function to upsert premium status with transaction
async function upsertPremiumStatus(userId: string, mode: 'monthly' | 'one-time', subscriptionId?: string) {
  const { error: upsertError } = await supabase
    .from('premium_status')
    .upsert({
      user_id: userId,
      is_premium: true,
      premium_mode: mode,
      purchase_date: new Date().toISOString(),
      stripe_subscription_id: subscriptionId || null,
    })
  
  if (upsertError) {
    throw new Error('Failed to update premium status')
  }
}

serve(async (req) => {
  const sig = req.headers.get('stripe-signature')
  if (!sig) return new Response('Missing signature', { status: 400 })

  const body = await req.text()
  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return new Response('Webhook Error: An unexpected error occurred', { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as CheckoutSession
      const userId =
        typeof session.client_reference_id === 'string'
          ? session.client_reference_id
          : null
      if (!userId) {
        console.error('Invalid client reference id', session.client_reference_id)
        return new Response('Invalid reference', { status: 400 })
      }
      const mode = session.mode === 'subscription' ? 'monthly' : 'one-time'
      const { error: upsertError } = await supabase
        .from('premium_status')
        .upsert({
          user_id: userId,
          is_premium: true,
          premium_mode: mode,
          purchase_date: new Date().toISOString(),
          stripe_subscription_id: session.subscription ?? null,
        })
      if (upsertError) {
        console.error('Premium upsert error', upsertError)
        return new Response('Database error', { status: 500 })
      }
      break
    }
    
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as PaymentIntent
      const customerId = paymentIntent.customer as string
      
      if (customerId) {
        try {
          const userId = await getUserFromCustomer(customerId)
          
          // Check if this is a one-time payment (not subscription)
          const { data: subscriptionData } = await supabase
            .from('premium_status')
            .select('stripe_subscription_id')
            .eq('user_id', userId)
            .single()
          
          // Only activate premium if no subscription exists (one-time payment)
          if (!subscriptionData?.stripe_subscription_id) {
            await upsertPremiumStatus(userId, 'one-time')
          }
        } catch (error) {
          console.error('Payment intent processing error:', error)
          return new Response(error instanceof Error ? error.message : 'Database error', { status: 500 })
        }
      }
      break
    }
    
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice
      const subscriptionId = invoice.subscription as string
      const customerId = invoice.customer as string
      
      if (subscriptionId && customerId) {
        try {
          const userId = await getUserFromCustomer(customerId)
          await upsertPremiumStatus(userId, 'monthly', subscriptionId)
        } catch (error) {
          console.error('Invoice payment processing error:', error)
          return new Response(error instanceof Error ? error.message : 'Database error', { status: 500 })
        }
      }
      break
    }
    
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const subId = invoice.subscription as string | null
      if (subId) {
        const { error } = await supabase
          .from('premium_status')
          .update({ is_premium: false })
          .eq('stripe_subscription_id', subId)
        if (error) {
          console.error('Failed to update premium status', error)
          return new Response('Database error', { status: 500 })
        }
      }
      break
    }
    
    case 'customer.subscription.deleted': {
      const sub = event.data.object as StripeSubscription
      const { error } = await supabase
        .from('premium_status')
        .update({ is_premium: false })
        .eq('stripe_subscription_id', sub.id)
      if (error) {
        console.error('Failed to update premium status', error)
        return new Response('Database error', { status: 500 })
      }
      break
    }
  }

  return new Response('ok', { status: 200 })
})
