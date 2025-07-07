
import { Layout } from 'react-grid-layout';

export type BreakpointKey = 'lg' | 'md' | 'sm' | 'xs';

export interface LayoutValidationResult {
  isValid: boolean;
  overlaps: Array<{ item1: string; item2: string }>;
  outOfBounds: string[];
  healthScore: number;
}

const BREAKPOINT_COLS = {
  lg: 4,
  md: 2,
  sm: 1,
  xs: 1
} as const;

export function validateLayout(layout: Layout[]): LayoutValidationResult {
  const overlaps: Array<{ item1: string; item2: string }> = [];
  const outOfBounds: string[] = [];
  
  // Check for overlaps
  for (let i = 0; i < layout.length; i++) {
    for (let j = i + 1; j < layout.length; j++) {
      const item1 = layout[i];
      const item2 = layout[j];
      
      if (
        item1.x < item2.x + item2.w &&
        item1.x + item1.w > item2.x &&
        item1.y < item2.y + item2.h &&
        item1.y + item1.h > item2.y
      ) {
        overlaps.push({ 
          item1: item1.i || `item-${i}`, 
          item2: item2.i || `item-${j}` 
        });
      }
    }
  }
  
  // Check for out of bounds (assuming 4 columns max)
  layout.forEach((item) => {
    if (item.x + item.w > 4 || item.x < 0 || item.y < 0) {
      outOfBounds.push(item.i || 'unknown');
    }
  });
  
  const healthScore = Math.max(0, 100 - (overlaps.length * 20) - (outOfBounds.length * 15));
  
  return {
    isValid: overlaps.length === 0 && outOfBounds.length === 0,
    overlaps,
    outOfBounds,
    healthScore
  };
}

export function repairLayout(layout: Layout[]): Layout[] {
  const repairedLayout = [...layout];
  
  // Sort by y position to maintain visual order
  repairedLayout.sort((a, b) => a.y - b.y);
  
  // Fix each item position
  repairedLayout.forEach((item, index) => {
    // Ensure minimum bounds
    item.x = Math.max(0, item.x);
    item.y = Math.max(0, item.y);
    item.w = Math.max(1, Math.min(4, item.w));
    item.h = Math.max(1, item.h);
    
    // Ensure it fits within grid
    if (item.x + item.w > 4) {
      item.x = Math.max(0, 4 - item.w);
    }
  });
  
  return repairedLayout;
}

export function preventOutOfBounds(item: Layout): Layout {
  const fixed = { ...item };
  
  // Ensure it stays within bounds
  fixed.x = Math.max(0, Math.min(fixed.x, 4 - fixed.w));
  fixed.y = Math.max(0, fixed.y);
  fixed.w = Math.max(1, Math.min(4, fixed.w));
  fixed.h = Math.max(1, fixed.h);
  
  return fixed;
}

export function optimizeSpacing(layout: Layout[]): Layout[] {
  const optimized = [...layout];
  
  // Sort by y position
  optimized.sort((a, b) => a.y - b.y);
  
  // Compact layout by removing gaps
  let currentY = 0;
  optimized.forEach((item) => {
    item.y = currentY;
    currentY += item.h;
  });
  
  return optimized;
}
