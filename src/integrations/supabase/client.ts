
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vzolmlztzewveszdykwq.supabase.co'
export const SUPABASE_URL = supabaseUrl
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6b2xtbHp0emV3dmVzemR5a3dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NDU5MjYsImV4cCI6MjA2NjUyMTkyNn0.GxRPZkwFWxsmiG_QXAV0BOpaLNV5mtO6QdEDC5eYSFY'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
})
