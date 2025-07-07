
import { Layout } from 'react-grid-layout';

export interface LayoutValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  overlaps: Array<{ item1: string; item2: string }>;
  outOfBounds: Array<{ item: string; reason: string }>;
  healthScore: number;
}

export type BreakpointKey = 'lg' | 'md' | 'sm' | 'xs';

const BREAKPOINT_COLS = {
  lg: 4,
  md: 2,
  sm: 1,
  xs: 1
};

export const validateLayout = (layout: Layout[]): LayoutValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const overlaps: Array<{ item1: string; item2: string }> = [];
  const outOfBounds: Array<{ item: string; reason: string }> = [];

  // Check for overlaps
  for (let i = 0; i < layout.length; i++) {
    for (let j = i + 1; j < layout.length; j++) {
      const item1 = layout[i];
      const item2 = layout[j];
      
      // Check if items overlap
      if (
        item1.x < item2.x + item2.w &&
        item1.x + item1.w > item2.x &&
        item1.y < item2.y + item2.h &&
        item1.y + item1.h > item2.y
      ) {
        overlaps.push({ item1: item1.i, item2: item2.i });
      }
    }
  }

  // Check for out of bounds (simplified)
  layout.forEach(item => {
    if (item.x < 0 || item.y < 0) {
      outOfBounds.push({ item: item.i, reason: 'Negative position' });
    }
    if (item.w <= 0 || item.h <= 0) {
      outOfBounds.push({ item: item.i, reason: 'Invalid dimensions' });
    }
  });

  // Calculate health score
  const totalIssues = overlaps.length + outOfBounds.length + errors.length;
  const healthScore = Math.max(0, 100 - (totalIssues * 10));

  return {
    isValid: errors.length === 0 && overlaps.length === 0 && outOfBounds.length === 0,
    errors,
    warnings,
    overlaps,
    outOfBounds,
    healthScore
  };
};

export const repairLayout = (layout: Layout[], breakpoint?: BreakpointKey): Layout[] => {
  const cols = breakpoint ? BREAKPOINT_COLS[breakpoint] : 4;
  const repairedLayout = [...layout];

  // Fix out of bounds items
  repairedLayout.forEach(item => {
    // Ensure positive dimensions
    if (item.w <= 0) item.w = 1;
    if (item.h <= 0) item.h = 1;
    
    // Ensure within bounds
    if (item.x < 0) item.x = 0;
    if (item.y < 0) item.y = 0;
    if (item.x + item.w > cols) {
      item.x = Math.max(0, cols - item.w);
    }
  });

  // Simple overlap resolution - move overlapping items down
  const sorted = repairedLayout.sort((a, b) => a.y - b.y || a.x - b.x);
  const occupied: { [key: string]: boolean } = {};

  sorted.forEach(item => {
    let newY = item.y;
    let found = false;

    while (!found) {
      let hasOverlap = false;
      
      for (let x = item.x; x < item.x + item.w; x++) {
        for (let y = newY; y < newY + item.h; y++) {
          if (occupied[`${x},${y}`]) {
            hasOverlap = true;
            break;
          }
        }
        if (hasOverlap) break;
      }

      if (!hasOverlap) {
        item.y = newY;
        // Mark spaces as occupied
        for (let x = item.x; x < item.x + item.w; x++) {
          for (let y = newY; y < newY + item.h; y++) {
            occupied[`${x},${y}`] = true;
          }
        }
        found = true;
      } else {
        newY++;
      }
    }
  });

  return repairedLayout;
};

export const preventOutOfBounds = (item: Layout, breakpoint: BreakpointKey): Layout => {
  const cols = BREAKPOINT_COLS[breakpoint];
  const boundedItem = { ...item };

  // Ensure positive dimensions
  if (boundedItem.w <= 0) boundedItem.w = 1;
  if (boundedItem.h <= 0) boundedItem.h = 1;
  
  // Ensure within horizontal bounds
  if (boundedItem.x < 0) boundedItem.x = 0;
  if (boundedItem.x + boundedItem.w > cols) {
    boundedItem.x = Math.max(0, cols - boundedItem.w);
  }
  
  // Ensure within vertical bounds
  if (boundedItem.y < 0) boundedItem.y = 0;

  return boundedItem;
};

export const optimizeSpacing = (layout: Layout[], breakpoint?: BreakpointKey): Layout[] => {
  const optimizedLayout = [...layout];
  
  // Sort by Y position, then X position
  optimizedLayout.sort((a, b) => a.y - b.y || a.x - b.x);
  
  // Compact vertically - move items up to fill gaps
  const occupied: { [key: string]: boolean } = {};
  
  optimizedLayout.forEach(item => {
    let newY = 0;
    let canPlace = false;
    
    while (!canPlace && newY <= item.y) {
      let hasOverlap = false;
      
      // Check if we can place the item at this Y position
      for (let x = item.x; x < item.x + item.w && !hasOverlap; x++) {
        for (let y = newY; y < newY + item.h && !hasOverlap; y++) {
          if (occupied[`${x},${y}`]) {
            hasOverlap = true;
          }
        }
      }
      
      if (!hasOverlap) {
        item.y = newY;
        canPlace = true;
        
        // Mark spaces as occupied
        for (let x = item.x; x < item.x + item.w; x++) {
          for (let y = newY; y < newY + item.h; y++) {
            occupied[`${x},${y}`] = true;
          }
        }
      } else {
        newY++;
      }
    }
  });
  
  return optimizedLayout;
};
