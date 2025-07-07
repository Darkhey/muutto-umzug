
import { Database } from 'src/types/database';

// Basis-Typen aus der Datenbank
export type Box = Database['public']['Tables']['boxes']['Row'];
export type BoxInsert = Database['public']['Tables']['boxes']['Insert'];
export type BoxUpdate = Database['public']['Tables']['boxes']['Update'];

export type BoxPhoto = Database['public']['Tables']['box_photos']['Row'];
export type BoxPhotoInsert = Database['public']['Tables']['box_photos']['Insert'];
export type BoxPhotoUpdate = Database['public']['Tables']['box_photos']['Update'];

export type BoxContent = Database['public']['Tables']['box_contents']['Row'];
export type BoxContentInsert = Database['public']['Tables']['box_contents']['Insert'];
export type BoxContentUpdate = Database['public']['Tables']['box_contents']['Update'];

export type BoxComment = Database['public']['Tables']['box_comments']['Row'];
export type BoxCommentInsert = Database['public']['Tables']['box_comments']['Insert'];
export type BoxCommentUpdate = Database['public']['Tables']['box_comments']['Update'];

export type BoxLocation = Database['public']['Tables']['box_locations']['Row'];
export type BoxLocationInsert = Database['public']['Tables']['box_locations']['Insert'];
export type BoxLocationUpdate = Database['public']['Tables']['box_locations']['Update'];

// Enums
export type BoxStatus = 'leer' | 'gepackt' | 'versiegelt' | 'transportiert' | 'ausgepackt';
export type BoxCategory = 'küche' | 'wohnzimmer' | 'schlafzimmer' | 'bad' | 'keller' | 'dachboden' | 'büro' | 'kinderzimmer' | 'garten' | 'sonstiges';

// Vereinheitlichte Schnittstelle für Box mit Details - includes all Box properties explicitly
export interface BoxWithDetails {
  id: string;
  box_number: string;
  name?: string | null;
  description?: string | null;
  category?: BoxCategory | null;
  room?: string | null;
  status?: BoxStatus | null;
  weight_kg?: number | null;
  dimensions_cm?: {
    length: number;
    width: number;
    height: number;
  } | null;
  source_household_id?: string | null;
  destination_household_id?: string | null;
  created_at?: string;
  updated_at?: string;
  photos?: BoxPhoto[];
  contents?: BoxContent[];
  comments?: BoxComment[];
  current_location?: BoxLocation | null;
  location_history?: BoxLocation[];
  _count?: {
    photos: number;
    contents: number;
    comments: number;
  };
}

// Für Rückwärtskompatibilität
export type ExtendedBox = BoxWithDetails;

export interface BoxDimensionsCm {
  length: number;
  width: number;
  height: number;
}

export interface CreateBoxData {
  box_number: string;
  name?: string;
  description?: string;
  category?: BoxCategory;
  room?: string;
  weight_kg?: number;
  dimensions_cm?: BoxDimensionsCm;
  source_household_id?: string;
  destination_household_id?: string;
}

export interface BoxSearchResult {
  box_id: string;
  box_number: string;
  box_name: string | null;
  item_name: string | null;
  item_description: string | null;
  box_status: BoxStatus;
  current_location: string | null;
  category?: BoxCategory;
  room?: string;
  photos?: BoxPhoto[];
  comments?: BoxComment[];
}

export interface AIAnalysisResult {
  detected_items: Array<{
    name: string;
    description: string;
    quantity: number;
    category: BoxCategory;
    is_fragile: boolean;
  }>;
  overall_category: BoxCategory;
  confidence_score: number;
  notes: string;
}

export interface BoxPhotoUpload {
  name: string;
  type: string;
  size: number;
  data: ArrayBuffer;
  photo_type?: 'content' | 'label' | 'damage';
}

// Hilfstyp für positive Zahlen
export type PositiveNumber = number & { __positive__: void };

export interface BoxContentFormData {
  item_name: string;
  description?: string;
  quantity: PositiveNumber; // Muss > 0 sein
  is_fragile: boolean;
  estimated_value?: number;
  category?: BoxCategory;
}

export interface BoxCommentFormData {
  comment_text: string;
  comment_type?: 'general' | 'question' | 'reminder' | 'note';
}

export interface BoxLocationFormData {
  location_type: 'source_house' | 'destination_house' | 'storage' | 'transport' | 'other';
  location_name: string;
  room?: string;
  notes?: string;
}

// Statistik-Typen
export interface BoxStatistics {
  total_boxes: number;
  boxes_by_status: Record<BoxStatus, number>;
  boxes_by_category: Record<BoxCategory, number>;
  total_items: number;
  fragile_items: number;
  estimated_total_value: number;
  boxes_with_photos: number;
  boxes_with_comments: number;
}

// Filter-Typen
export interface BoxFilters {
  status?: BoxStatus[];
  category?: BoxCategory[];
  room?: string[];
  has_photos?: boolean;
  has_comments?: boolean;
  is_fragile?: boolean;
  search_term?: string;
}

// Sort-Typen
export type BoxSortField = 'box_number' | 'name' | 'created_at' | 'updated_at' | 'status' | 'category';
export type SortDirection = 'asc' | 'desc';

export interface BoxSort {
  field: BoxSortField;
  direction?: SortDirection; // defaults to 'asc'
} 
