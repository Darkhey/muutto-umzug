
export const checkRequiredEnvVars = () => {
  const missing = []
  
  if (!import.meta.env.VITE_SUPABASE_URL) {
    missing.push('VITE_SUPABASE_URL')
  }
  
  if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
    missing.push('VITE_SUPABASE_ANON_KEY')
  }
  
  return missing
}

export const checkStripeEnvVars = () => {
  const missing = []
  
  if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
    missing.push('VITE_STRIPE_PUBLISHABLE_KEY')
  }
  
  if (!import.meta.env.VITE_ONE_TIME_PRODUCT_ID) {
    missing.push('VITE_ONE_TIME_PRODUCT_ID')
  }
  
  if (!import.meta.env.VITE_MONTHLY_PRODUCT_ID) {
    missing.push('VITE_MONTHLY_PRODUCT_ID')
  }
  
  return missing
}
