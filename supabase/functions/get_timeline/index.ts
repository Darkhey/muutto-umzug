import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/v135/@supabase/supabase-js@2.43.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, serviceRole)

const getModuleColors = () => {
  return {
    haushalte: 'blue',
    checklisten: 'green',
    vertraege: 'red',
    inventar: 'orange',
    langzeit: 'purple',
    ki_assistent: 'indigo',
    rechtliches: 'yellow',
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const { household_id } = await req.json()
  if (!household_id) {
    return new Response(JSON.stringify({ error: 'household_id required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const { count } = await supabase
    .from('household_members')
    .select('id', { count: 'exact', head: true })
    .eq('household_id', household_id)
    .eq('user_id', user.id)

  if (!count) {
    return new Response(JSON.stringify({ error: 'forbidden' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const { data: tasks, error: taskError } = await supabase
    .from('tasks')
    .select('*')
    .eq('household_id', household_id)

  if (taskError) {
    return new Response(JSON.stringify({ error: taskError.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const moduleColors = getModuleColors()

  const formatted = (tasks ?? []).map((t) => ({
    ...t,
    module_color: moduleColors[t.category as string] || 'gray',
    is_overdue: t.due_date ? new Date(t.due_date) < new Date() && !t.completed : false,
  }))

  const { data: prefs } = await supabase
    .from('timeline_preferences')
    .select('*')
    .eq('household_id', household_id)
    .maybeSingle()

  return new Response(
    JSON.stringify({ tasks: formatted, preferences: prefs }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})
