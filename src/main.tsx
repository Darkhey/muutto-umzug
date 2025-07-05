import { createRoot } from 'react-dom/client'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import App from './App.tsx'
import './index.css'

// Stripe Elements Provider
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '')

createRoot(document.getElementById("root")!).render(
  <Elements stripe={stripePromise}>
    <App />
  </Elements>
);
