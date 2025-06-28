import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface ChatRequest {
  messages: ChatMessage[]
  householdContext?: {
    name: string
    moveDate: string
    householdSize: number
    childrenCount: number
    petsCount: number
    propertyType: string
    daysUntilMove: number
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { messages, householdContext }: ChatRequest = await req.json()

    // Get OpenAI API key from environment
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Build system prompt with household context
    const systemPrompt = `Du bist muuttoBot, ein freundlicher und hilfsreicher KI-Assistent für Umzüge in Deutschland. 

${householdContext ? `
KONTEXT DES HAUSHALTS:
- Name: ${householdContext.name}
- Umzugsdatum: ${householdContext.moveDate}
- Haushaltsgröße: ${householdContext.householdSize} Personen
- Kinder: ${householdContext.childrenCount}
- Haustiere: ${householdContext.petsCount}
- Wohnform: ${householdContext.propertyType}
- Tage bis Umzug: ${householdContext.daysUntilMove}

Nutze diese Informationen, um personalisierte und relevante Antworten zu geben.
` : ''}

DEINE AUFGABEN:
- Beantworte Fragen zu Umzügen in Deutschland
- Gib praktische, umsetzbare Tipps
- Erkläre Fristen und rechtliche Anforderungen
- Hilf bei der Organisation und Planung
- Sei freundlich, ermutigend und lösungsorientiert

WICHTIGE REGELN:
- Antworte immer auf Deutsch
- Sei konkret und praktisch
- Erwähne spezifische Fristen (z.B. "3 Monate vor Umzug")
- Gib strukturierte Antworten mit Aufzählungen
- Nutze Emojis sparsam aber gezielt
- Halte Antworten unter 300 Wörtern

HÄUFIGE THEMEN:
- Kündigungsfristen (meist 3 Monate)
- Ummeldungen (14 Tage nach Umzug)
- Umzugskosten (800-2000€ je nach Größe)
- Vertragsummeldungen (Strom, Gas, Internet)
- Organisationstipps für den Umzugstag`

    // Prepare messages for OpenAI
    const openaiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ]

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: openaiMessages,
        max_tokens: 500,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('OpenAI API error:', error)
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const assistantMessage = data.choices[0]?.message?.content

    if (!assistantMessage) {
      throw new Error('No response from OpenAI')
    }

    return new Response(
      JSON.stringify({ 
        message: assistantMessage,
        usage: data.usage 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in AI assistant:', error)
    
    // Fallback response
    const fallbackMessage = `Entschuldigung, ich bin momentan nicht verfügbar. Hier sind einige wichtige Umzugstipps:

📅 **Wichtige Fristen:**
• 3 Monate vorher: Mietvertrag kündigen
• 6-8 Wochen vorher: Umzugsunternehmen buchen
• 4 Wochen vorher: Verträge ummelden
• 2 Wochen vorher: Nachsendeauftrag

💡 **Sofort-Tipps:**
• Erstelle eine Checkliste
• Hole mehrere Umzugsangebote ein
• Sammle wichtige Dokumente
• Plane ein Umzugsbudget (800-2000€)

Versuche es gleich nochmal - ich bin normalerweise sofort da! 😊`

    return new Response(
      JSON.stringify({ 
        message: fallbackMessage,
        error: 'AI temporarily unavailable'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 200 // Return 200 so frontend gets fallback message
      }
    )
  }
})