
import { createRoot } from 'react-dom/client'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import App from './App.tsx'
import './index.css'

// Stripe Elements Provider with fallback
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null

if (!stripePublishableKey) {
  console.warn('VITE_STRIPE_PUBLISHABLE_KEY not found - Stripe functionality will be disabled')
}

createRoot(document.getElementById("root")!).render(
  stripePromise ? (
    <Elements stripe={stripePromise}>
      <App />
    </Elements>
  ) : (
    <App />
  )
);
