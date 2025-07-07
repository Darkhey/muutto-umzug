
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    // Check if Authorization header exists
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization header is required' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    // Parse JSON with error handling
    let body
    try {
      body = await req.json()
    } catch (parseError) {
      return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const { householdId } = body

    if (!householdId) {
      return new Response(JSON.stringify({ error: 'householdId is required' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
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
  } catch (error) {
    console.error('Error in generate-timeline-suggestions:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

interface TaskData {
  title: string;
}

interface HouseholdData {
  move_date: string;
  tasks: TaskData[];
}

// Task categories with related keywords
const TASK_CATEGORIES = {
  nachsendeauftrag: ['nachsendeauftrag', 'post', 'briefe', 'weiterleitung', 'ummelden'],
  internet: ['internet', 'dsl', 'telefon', 'anschluss', 'provider', 'wlan', 'router'],
  ummeldung: ['ummeldung', 'anmeldung', 'einwohnermeldeamt', 'melderegister'],
  versicherung: ['versicherung', 'haftpflicht', 'hausrat', 'kfz', 'auto'],
  strom: ['strom', 'gas', 'energie', 'versorger', 'zähler'],
  schule: ['schule', 'kindergarten', 'kita', 'bildung', 'anmeldung'],
  arzt: ['arzt', 'zahnarzt', 'praxis', 'gesundheit', 'impfung'],
  bank: ['bank', 'konto', 'adresse', 'finanzen', 'kreditkarte']
};

// Helper function to check if any task title contains keywords from a category
function hasTaskInCategory(tasks: TaskData[], category: keyof typeof TASK_CATEGORIES): boolean {
  const keywords = TASK_CATEGORIES[category];
  return tasks.some((task: TaskData) => 
    keywords.some(keyword => 
      task.title.toLowerCase().includes(keyword.toLowerCase())
    )
  );
}

function generateSuggestions(household: HouseholdData) {
  const suggestions = [];
  const tasks = household.tasks || [];

  // Nachsendeauftrag suggestion
  if (!hasTaskInCategory(tasks, 'nachsendeauftrag')) {
    suggestions.push({
      title: 'Nachsendeauftrag bei der Post beantragen',
      description: 'Stelle sicher, dass deine Post an die neue Adresse weitergeleitet wird.',
      due_date: new Date(new Date(household.move_date).getTime() - 14 * 24 * 60 * 60 * 1000), // 2 weeks before move
      priority: 'hoch',
    });
  }

  // Internet suggestion
  if (!hasTaskInCategory(tasks, 'internet')) {
    suggestions.push({
      title: 'Internet- und Telefonanschluss ummelden oder neu beantragen',
      description: 'Kümmere dich frühzeitig um einen Internetanbieter an der neuen Adresse.',
      due_date: new Date(new Date(household.move_date).getTime() - 30 * 24 * 60 * 60 * 1000), // 1 month before move
      priority: 'hoch',
    });
  }

  // Ummeldung suggestion
  if (!hasTaskInCategory(tasks, 'ummeldung')) {
    suggestions.push({
      title: 'Ummeldung beim Einwohnermeldeamt',
      description: 'Melde dich innerhalb von 14 Tagen nach dem Umzug an der neuen Adresse an.',
      due_date: new Date(new Date(household.move_date).getTime() + 7 * 24 * 60 * 60 * 1000), // 1 week after move
      priority: 'hoch',
    });
  }

  // Versicherung suggestion
  if (!hasTaskInCategory(tasks, 'versicherung')) {
    suggestions.push({
      title: 'Versicherungen an neue Adresse anpassen',
      description: 'Informiere deine Versicherungen über die Adressänderung.',
      due_date: new Date(new Date(household.move_date).getTime() - 7 * 24 * 60 * 60 * 1000), // 1 week before move
      priority: 'mittel',
    });
  }

  return suggestions;
}
