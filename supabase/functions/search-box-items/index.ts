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

    const { search_term, household_id } = await req.json()

    if (!search_term || !household_id) {
      throw new Error('search_term und household_id sind erforderlich')
    }

    // Verwende die Datenbankfunktion für die Suche
    const { data: searchResults, error } = await supabaseClient
      .rpc('search_items_in_boxes', {
        p_household_id: household_id,
        p_search_term: search_term
      })

    if (error) {
      throw new Error(`Datenbankfehler: ${error.message}`)
    }

    // Erweitere die Ergebnisse mit zusätzlichen Informationen
    const enrichedResults = await Promise.all(
      searchResults.map(async (result) => {
        // Hole zusätzliche Informationen über den Karton
        const { data: boxData } = await supabaseClient
          .from('boxes')
          .select(`
            *,
            box_photos(photo_url, photo_type),
            box_comments(comment_text, comment_type, created_at)
          `)
          .eq('id', result.box_id)
          .single()

        return {
          ...result,
          box_photos: boxData?.box_photos || [],
          comments: boxData?.box_comments || [],
          category: boxData?.category,
          room: boxData?.room
        }
      })
    )

    return new Response(
      JSON.stringify({
        success: true,
        results: enrichedResults,
        total_count: enrichedResults.length,
        search_term: search_term
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