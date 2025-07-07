import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Validierungsfunktionen
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    // Prüfe, ob es sich um HTTP/HTTPS handelt
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

function sanitizeString(input: string): string {
  // Entferne gefährliche Zeichen und trimme Whitespace
  return input
    .trim()
    .replace(/[<>]/g, '') // Entferne < und > um XSS zu verhindern
    .replace(/\0/g, '') // Entferne Null-Bytes
    .slice(0, 2048); // Begrenze Länge auf 2048 Zeichen
}

function validateAndSanitizeInput(photoUrl: string, boxId: string): { photoUrl: string; boxId: string } {
  // Sanitize inputs
  const sanitizedPhotoUrl = sanitizeString(photoUrl);
  const sanitizedBoxId = sanitizeString(boxId);

  // Validiere photo_url
  if (!sanitizedPhotoUrl) {
    throw new Error('photo_url ist erforderlich und darf nicht leer sein');
  }

  if (!isValidUrl(sanitizedPhotoUrl)) {
    throw new Error('photo_url muss eine gültige HTTP/HTTPS URL sein');
  }

  // Prüfe URL-Länge
  if (sanitizedPhotoUrl.length > 2048) {
    throw new Error('photo_url ist zu lang (Maximum: 2048 Zeichen)');
  }

  // Validiere box_id
  if (!sanitizedBoxId) {
    throw new Error('box_id ist erforderlich und darf nicht leer sein');
  }

  if (!isValidUUID(sanitizedBoxId)) {
    throw new Error('box_id muss ein gültiges UUID-Format haben');
  }

  return {
    photoUrl: sanitizedPhotoUrl,
    boxId: sanitizedBoxId
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Validiere HTTP-Methode
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Nur POST-Anfragen sind erlaubt'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      }
    )
  }

  // Validiere Content-Type
  const contentType = req.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Content-Type muss application/json sein'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
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

    // Umfassende Input-Validierung und Sanitization
    const { photoUrl, boxId } = validateAndSanitizeInput(photo_url, box_id);

    // OpenAI API Key aus Umgebungsvariablen
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY ist nicht konfiguriert')
    }

    // Bildanalyse mit OpenAI Vision API
    const analysisResult = await analyzeImageWithAI(photoUrl, openaiApiKey)

    // Speichere die Analyse in der Datenbank
    const { data: photoData, error: photoError } = await supabaseClient
      .from('box_photos')
      .insert({
        box_id: boxId,
        photo_url: photoUrl,
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
        box_id: boxId,
        item_name: item.name,
        description: item.description,
        quantity: item.quantity || 1,
        is_fragile: item.is_fragile || false,
        category: item.category,
        ai_detected: true,
        manually_added: false
      }))

      // Atomar per SQL-Funktion einfügen
      const { error: contentError } = await supabaseClient.rpc('insert_box_contents_atomic', {
        contents: JSON.stringify(contentInserts)
      });

      if (contentError) {
        throw new Error('Fehler beim atomaren Einfügen der Kartoninhalte: ' + contentError.message);
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
  // Zusätzliche URL-Validierung für OpenAI
  if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
    throw new Error('Ungültige Bild-URL für OpenAI API');
  }

  // Prüfe, ob die URL auf ein Bild verweist
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const hasImageExtension = imageExtensions.some(ext => 
    imageUrl.toLowerCase().includes(ext)
  );
  
  if (!hasImageExtension) {
    throw new Error('URL muss auf ein Bild verweisen (jpg, jpeg, png, gif, webp)');
  }

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
      model: 'gpt-4-turbo-2024-04-09',
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