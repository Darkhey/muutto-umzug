import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { photo_url, box_id } = await req.json()

    if (!photo_url || !box_id) {
      throw new Error('photo_url und box_id sind erforderlich')
    }

    // OpenAI API Key aus Umgebungsvariablen
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY ist nicht konfiguriert')
    }

    // Bildanalyse mit OpenAI Vision API
    const analysisResult = await analyzeImageWithAI(photo_url, openaiApiKey)

    // Speichere die Analyse in der Datenbank
    const { data: photoData, error: photoError } = await supabaseClient
      .from('box_photos')
      .insert({
        box_id: box_id,
        photo_url: photo_url,
        photo_type: 'content',
        uploaded_by: (await supabaseClient.auth.getUser()).data.user?.id,
        ai_analysis: analysisResult
      })
      .select()
      .single()

    if (photoError) {
      throw new Error(`Fehler beim Speichern des Fotos: ${photoError.message}`)
    }

    // Erstelle Kartoninhalt basierend auf der KI-Analyse
    if (analysisResult.detected_items && analysisResult.detected_items.length > 0) {
      const contentInserts = analysisResult.detected_items.map((item: any) => ({
        box_id: box_id,
        item_name: item.name,
        description: item.description,
        quantity: item.quantity || 1,
        is_fragile: item.is_fragile || false,
        category: item.category,
        ai_detected: true,
        manually_added: false
      }))

      const { error: contentError } = await supabaseClient
        .from('box_contents')
        .insert(contentInserts)

      if (contentError) {
        console.error('Fehler beim Erstellen der Kartoninhalte:', contentError)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        photo_id: photoData.id,
        analysis: analysisResult,
        message: 'Foto erfolgreich analysiert und gespeichert'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

async function analyzeImageWithAI(imageUrl: string, apiKey: string) {
  const prompt = `
    Analysiere dieses Foto eines Umzugskartons und erkenne alle sichtbaren Gegenstände.
    
    Erstelle eine detaillierte Liste mit:
    - Name des Gegenstands
    - Beschreibung (Material, Farbe, Größe wenn erkennbar)
    - Geschätzte Menge
    - Kategorie (z.B. Küche, Bücher, Kleidung, Elektronik, etc.)
    - Ob es sich um zerbrechliche Gegenstände handelt
    
    Antworte nur mit einem JSON-Objekt in diesem Format:
    {
      "detected_items": [
        {
          "name": "Gegenstandsname",
          "description": "Detaillierte Beschreibung",
          "quantity": 1,
          "category": "Kategorie",
          "is_fragile": false
        }
      ],
      "overall_category": "Hauptkategorie für den Karton",
      "confidence_score": 0.85,
      "notes": "Zusätzliche Beobachtungen"
    }
    
    Sei so genau wie möglich und verwende deutsche Begriffe.
  `

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.1
    })
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`OpenAI API Fehler: ${errorData.error?.message || 'Unbekannter Fehler'}`)
  }

  const data = await response.json()
  const content = data.choices[0]?.message?.content

  if (!content) {
    throw new Error('Keine Antwort von der KI erhalten')
  }

  try {
    // Versuche JSON aus der Antwort zu extrahieren
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    } else {
      throw new Error('Kein gültiges JSON in der Antwort gefunden')
    }
  } catch (parseError) {
    console.error('Fehler beim Parsen der KI-Antwort:', content)
    throw new Error('Fehler beim Verarbeiten der KI-Analyse')
  }
} 