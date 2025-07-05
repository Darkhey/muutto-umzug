
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { householdId } = await req.json()

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
  )

  const { data: household, error: householdError } = await supabase
    .from('households')
    .select('*, tasks(*)')
    .eq('id', householdId)
    .single()

  if (householdError) {
    return new Response(JSON.stringify({ error: householdError.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }

  // KI Logic to generate suggestions
  const suggestions = generateSuggestions(household);

  return new Response(
    JSON.stringify({ suggestions }),
    { headers: { 'Content-Type': 'application/json' } },
  )
})

interface TaskData {
  title: string;
}

interface HouseholdData {
  move_date: string;
  tasks: TaskData[];
}

function generateSuggestions(household: HouseholdData) {
  const suggestions = [];
  const tasks = household.tasks || [];

  // Example suggestion: Nachsendeauftrag
  if (!tasks.some((task: TaskData) => task.title.toLowerCase().includes('nachsendeauftrag'))) {
    suggestions.push({
      title: 'Nachsendeauftrag bei der Post beantragen',
      description: 'Stelle sicher, dass deine Post an die neue Adresse weitergeleitet wird.',
      due_date: new Date(new Date(household.move_date).getTime() - 14 * 24 * 60 * 60 * 1000), // 2 weeks before move
      priority: 'hoch',
    });
  }

  // Example suggestion: Internet
  if (!tasks.some((task: TaskData) => task.title.toLowerCase().includes('internet')) && !tasks.some((task: TaskData) => task.title.toLowerCase().includes('dsl'))) {
    suggestions.push({
      title: 'Internet- und Telefonanschluss ummelden oder neu beantragen',
      description: 'Kümmere dich frühzeitig um einen Internetanbieter an der neuen Adresse.',
      due_date: new Date(new Date(household.move_date).getTime() - 30 * 24 * 60 * 60 * 1000), // 1 month before move
      priority: 'hoch',
    });
  }

  return suggestions;
}
