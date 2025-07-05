import { Database } from './database';

export type Move = Database['public']['Tables']['moves']['Row'];
export type MoveInsert = Database['public']['Tables']['moves']['Insert'];

export type MoveMemberRole = Database['public']['Tables']['move_members_roles']['Row'];

export interface ExtendedMove extends Move {
  households?: string[]; // Array of household IDs linked to this move
  members_roles?: MoveMemberRole[];
}
