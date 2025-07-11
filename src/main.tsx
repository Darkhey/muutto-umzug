
import { createRoot } from 'react-dom/client'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import * as Sentry from "@sentry/react"
import App from './App.tsx'
import './index.css'

// Initialize Sentry
Sentry.init({
  dsn: "YOUR_SENTRY_DSN_HERE", // Replace with your actual Sentry DSN
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of the transactions
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

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
