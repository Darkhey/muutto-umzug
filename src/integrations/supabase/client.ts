
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vzolmlztzewveszdykwq.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6b2xtbHp0emV3dmVzemR5a3dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NDU5MjYsImV4cCI6MjA2NjUyMTkyNn0.GxRPZkwFWxsmiG_QXAV0BOpaLNV5mtO6QdEDC5eYSFY'

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  throw new Error('Missing Supabase environment variables')
}

export const SUPABASE_URL = supabaseUrl

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
})
