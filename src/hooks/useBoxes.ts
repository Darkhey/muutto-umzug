import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Box, 
  BoxInsert, 
  BoxUpdate, 
  BoxWithDetails, 
  CreateBoxData,
  BoxFilters,
  BoxSort,
  BoxStatistics,
  BoxSearchResult
} from '@/types/box';

export function useBoxes(householdId: string) {
  const { user } = useAuth();
  const [boxes, setBoxes] = useState<BoxWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<BoxFilters>({});
  const [sort, setSort] = useState<BoxSort>({ field: 'created_at', direction: 'desc' });

  // Lade alle Kartons für einen Haushalt
  const loadBoxes = async () => {
    if (!householdId || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('boxes')
        .select(`*`)
        .eq('household_id', householdId);

      // Filter anwenden
      if (filters.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
      }
      if (filters.category && filters.category.length > 0) {
        query = query.in('category', filters.category);
      }
      if (filters.room && filters.room.length > 0) {
        query = query.in('room', filters.room);
      }
      if (filters.search_term) {
        query = query.or(`name.ilike.%${filters.search_term}%,description.ilike.%${filters.search_term}%`);
      }

      // Sortierung anwenden
      query = query.order(sort.field, { ascending: sort.direction === 'asc' });

      const { data, error } = await query;

      if (error) throw error;

      // Zusätzliche Filter für verknüpfte Daten
      let filteredData = data || [];
      
      if (filters.has_photos) {
        filteredData = filteredData.filter(box => box.photos && box.photos.length > 0);
      }
      if (filters.has_comments) {
        filteredData = filteredData.filter(box => box.comments && box.comments.length > 0);
      }
      if (filters.is_fragile !== undefined) {
        filteredData = filteredData.filter(box => 
          box.contents?.some(content => content.is_fragile === filters.is_fragile)
        );
      }

      setBoxes(filteredData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden der Kartons');
    } finally {
      setLoading(false);
    }
  };

  // Erstelle einen neuen Karton
  const createBox = async (boxData: CreateBoxData): Promise<Box | null> => {
    if (!householdId || !user) return null;

    try {
      const insertData: BoxInsert = {
        ...boxData,
        household_id: householdId,
        created_by: user.id,
      };

      const { data, error } = await supabase
        .from('boxes')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      await loadBoxes(); // Liste neu laden
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Erstellen des Kartons');
      return null;
    }
  };

  // Aktualisiere einen Karton
  const updateBox = async (boxId: string, updates: BoxUpdate): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('boxes')
        .update(updates)
        .eq('id', boxId);

      if (error) throw error;

      await loadBoxes(); // Liste neu laden
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Aktualisieren des Kartons');
      return false;
    }
  };

  // Lösche einen Karton
  const deleteBox = async (boxId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('boxes')
        .delete()
        .eq('id', boxId);

      if (error) throw error;

      await loadBoxes(); // Liste neu laden
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Löschen des Kartons');
      return false;
    }
  };

  // Suche nach Gegenständen in Kartons
  const searchItems = async (searchTerm: string): Promise<BoxSearchResult[]> => {
    if (!householdId || !searchTerm.trim()) return [];

    try {
      const { data, error } = await supabase
        .rpc('search_items_in_boxes', {
          p_household_id: householdId,
          p_search_term: searchTerm
        });

      if (error) throw error;
      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler bei der Suche');
      return [];
    }
  };

  // Hole Statistiken
  const getStatistics = async (): Promise<BoxStatistics | null> => {
    if (!householdId) return null;

    try {
      const { data: boxesData } = await supabase
        .from('boxes')
        .select(`
          status,
          category,
          contents:box_contents(is_fragile, estimated_value),
          photos:box_photos(id),
          comments:box_comments(id)
        `)
        .eq('household_id', householdId);

      if (!boxesData) return null;

      const stats: BoxStatistics = {
        total_boxes: boxesData.length,
        boxes_by_status: {
          leer: 0,
          gepackt: 0,
          versiegelt: 0,
          transportiert: 0,
          ausgepackt: 0
        },
        boxes_by_category: {
          küche: 0,
          wohnzimmer: 0,
          schlafzimmer: 0,
          bad: 0,
          keller: 0,
          dachboden: 0,
          büro: 0,
          kinderzimmer: 0,
          garten: 0,
          sonstiges: 0
        },
        total_items: 0,
        fragile_items: 0,
        estimated_total_value: 0,
        boxes_with_photos: 0,
        boxes_with_comments: 0
      };

      boxesData.forEach(box => {
        // Status zählen
        if (box.status) {
          stats.boxes_by_status[box.status]++;
        }

        // Kategorie zählen
        if (box.category) {
          stats.boxes_by_category[box.category]++;
        }

        // Items zählen
        if (box.contents) {
          stats.total_items += box.contents.length;
          stats.fragile_items += box.contents.filter(item => item.is_fragile).length;
          stats.estimated_total_value += box.contents.reduce((sum, item) => 
            sum + (item.estimated_value || 0), 0
          );
        }

        // Fotos und Kommentare zählen
        if (box.photos && box.photos.length > 0) {
          stats.boxes_with_photos++;
        }
        if (box.comments && box.comments.length > 0) {
          stats.boxes_with_comments++;
        }
      });

      return stats;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden der Statistiken');
      return null;
    }
  };

  // Lade Kartons beim Mount und bei Änderungen
  useEffect(() => {
    loadBoxes();
  }, [householdId, user, filters, sort]);

  return {
    boxes,
    loading,
    error,
    filters,
    sort,
    setFilters,
    setSort,
    createBox,
    updateBox,
    deleteBox,
    searchItems,
    getStatistics,
    refresh: loadBoxes
  };
} 