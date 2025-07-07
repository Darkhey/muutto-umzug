import { Database } from 'src/types/database';

// Basis-Typen aus der Datenbank
export type Box = Database['public']['Tables']['boxes']['Row'];
export type BoxInsert = Database['public']['Tables']['boxes']['Insert'];
export type BoxUpdate = Database['public']['Tables']['boxes']['Update'];

export type BoxPhoto = Database['public']['Tables']['box_photos']['Row'];
export type BoxPhotoInsert = Database['public']['Tables']['box_photos']['Insert'];

export type BoxContent = Database['public']['Tables']['box_contents']['Row'];
export type BoxContentInsert = Database['public']['Tables']['box_contents']['Insert'];

export type BoxComment = Database['public']['Tables']['box_comments']['Row'];
export type BoxCommentInsert = Database['public']['Tables']['box_comments']['Insert'];

export type BoxLocation = Database['public']['Tables']['box_locations']['Row'];
export type BoxLocationInsert = Database['public']['Tables']['box_locations']['Insert'];

// Enums
export type BoxStatus = Database['public']['Enums']['box_status'];
export type BoxCategory = Database['public']['Enums']['box_category'];

// Vereinheitlichte Schnittstelle für Box mit Details
export interface BoxWithDetails extends Box {
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

export interface CreateBoxData {
  box_number: string;
  name?: string;
  description?: string;
  category?: BoxCategory;
  room?: string;
  weight_kg?: number;
  dimensions_cm?: {
    length: number;
    width: number;
    height: number;
  };
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
    category: string;
    is_fragile: boolean;
  }>;
  overall_category: string;
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

export interface BoxContentFormData {
  item_name: string;
  description?: string;
  quantity: number;
  is_fragile: boolean;
  estimated_value?: number;
  category?: string;
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
  direction: SortDirection;
} 