import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, serviceRole)

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

  const body = await req.json()
  const taskId = body.task_id as string | undefined
  const newDate = body.new_date as string | null | undefined

  // Validate date format if provided
  if (newDate && isNaN(Date.parse(newDate))) {
    return new Response(JSON.stringify({ error: 'Invalid date format' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
  if (!taskId) {
    return new Response(JSON.stringify({ error: 'task_id required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const { data: task, error: taskErr } = await supabase
    .from('tasks')
    .select('id, household_id, due_date')
    .eq('id', taskId)
    .single()

  if (taskErr || !task) {
    return new Response(JSON.stringify({ error: 'task not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const { count } = await supabase
    .from('household_members')
    .select('id', { count: 'exact', head: true })
    .eq('household_id', task.household_id)
    .eq('user_id', user.id)

  if (!count) {
    return new Response(JSON.stringify({ error: 'forbidden' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const { data: updated, error: updateErr } = await supabase
    .from('tasks')
    .update({ due_date: newDate })
    .eq('id', taskId)
    .select()
    .single()

  if (updateErr) {
    return new Response(JSON.stringify({ error: updateErr.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify(updated), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
