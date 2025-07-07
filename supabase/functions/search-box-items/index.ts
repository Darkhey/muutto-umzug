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

    // Erweitere die Ergebnisse mit zusätzlichen Informationen (N+1-Problem vermeiden)
    const boxIds = searchResults.map((result: any) => result.box_id)
    let boxDataMap: Record<string, any> = {}
    if (boxIds.length > 0) {
      const { data: boxesData, error: boxesError } = await supabaseClient
        .from('boxes')
        .select(`
          id,
          category,
          room,
          box_photos(photo_url, photo_type),
          box_comments(comment_text, comment_type, created_at)
        `)
        .in('id', boxIds)

      if (boxesError) {
        throw new Error(`Fehler beim Laden der Box-Daten: ${boxesError.message}`)
      }
      // Mappe Boxdaten nach ID
      boxDataMap = (boxesData || []).reduce((acc: Record<string, any>, box: any) => {
        acc[box.id] = box
        return acc
      }, {})
    }

    const enrichedResults = searchResults.map((result: any) => {
      const boxData = boxDataMap[result.box_id] || {}
      return {
        ...result,
        box_photos: boxData.box_photos || [],
        comments: boxData.box_comments || [],
        category: boxData.category,
        room: boxData.room
      }
    })

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