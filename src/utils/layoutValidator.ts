
import { Layout, Layouts } from 'react-grid-layout';

export interface LayoutValidationResult {
  isValid: boolean;
  overlaps: Array<{ item1: string; item2: string }>;
  outOfBounds: string[];
  gaps: number;
  healthScore: number;
}

export interface GridConstraints {
  maxCols: { lg: number; md: number; sm: number; xs: number };
  maxRows: number;
  minItemSize: { w: number; h: number };
  maxItemSize: { w: number; h: number };
}

const DEFAULT_CONSTRAINTS: GridConstraints = {
  maxCols: { lg: 4, md: 2, sm: 1, xs: 1 },
  maxRows: 20,
  minItemSize: { w: 1, h: 2 },
  maxItemSize: { w: 2, h: 4 }
};

export const detectOverlaps = (layout: Layout[]): Array<{ item1: string; item2: string }> => {
  const overlaps: Array<{ item1: string; item2: string }> = [];
  
  for (let i = 0; i < layout.length; i++) {
    for (let j = i + 1; j < layout.length; j++) {
      const item1 = layout[i];
      const item2 = layout[j];
      
      const item1Right = item1.x + item1.w;
      const item1Bottom = item1.y + item1.h;
      const item2Right = item2.x + item2.w;
      const item2Bottom = item2.y + item2.h;
      
      // Check for overlap
      if (!(item1Right <= item2.x || item2Right <= item1.x || 
            item1Bottom <= item2.y || item2Bottom <= item1.y)) {
        overlaps.push({ 
          item1: item1.i, 
          item2: item2.i 
        });
      }
    }
  }
  
  return overlaps;
};

export const detectOutOfBounds = (
  layout: Layout[], 
  breakpoint: keyof GridConstraints['maxCols'],
  constraints: GridConstraints = DEFAULT_CONSTRAINTS
): string[] => {
  const maxCols = constraints.maxCols[breakpoint];
  const maxRows = constraints.maxRows;
  
  return layout
    .filter(item => 
      item.x < 0 || 
      item.y < 0 || 
      item.x + item.w > maxCols || 
      item.y + item.h > maxRows
    )
    .map(item => item.i);
};

export const validateLayout = (
  layout: Layout[], 
  breakpoint: keyof GridConstraints['maxCols'],
  constraints: GridConstraints = DEFAULT_CONSTRAINTS
): LayoutValidationResult => {
  const overlaps = detectOverlaps(layout);
  const outOfBounds = detectOutOfBounds(layout, breakpoint, constraints);
  
  // Calculate gaps (empty spaces that could be filled)
  const occupiedCells = new Set<string>();
  layout.forEach(item => {
    for (let x = item.x; x < item.x + item.w; x++) {
      for (let y = item.y; y < item.y + item.h; y++) {
        occupiedCells.add(`${x},${y}`);
      }
    }
  });
  
  const maxCols = constraints.maxCols[breakpoint];
  const maxY = Math.max(...layout.map(item => item.y + item.h), 0);
  const totalCells = maxCols * maxY;
  const gaps = totalCells - occupiedCells.size;
  
  // Calculate health score (0-100)
  let healthScore = 100;
  healthScore -= overlaps.length * 20; // -20 points per overlap
  healthScore -= outOfBounds.length * 15; // -15 points per out-of-bounds item
  healthScore -= Math.min(gaps * 2, 30); // -2 points per gap, max -30
  
  return {
    isValid: overlaps.length === 0 && outOfBounds.length === 0,
    overlaps,
    outOfBounds,
    gaps,
    healthScore: Math.max(0, healthScore)
  };
};

export const repairLayout = (
  layout: Layout[], 
  breakpoint: keyof GridConstraints['maxCols'],
  constraints: GridConstraints = DEFAULT_CONSTRAINTS
): Layout[] => {
  const maxCols = constraints.maxCols[breakpoint];
  const repairedLayout = [...layout];
  
  // Fix out-of-bounds items first
  repairedLayout.forEach(item => {
    // Ensure item fits within bounds
    if (item.x + item.w > maxCols) {
      item.x = Math.max(0, maxCols - item.w);
    }
    if (item.x < 0) {
      item.x = 0;
    }
    if (item.y < 0) {
      item.y = 0;
    }
    
    // Enforce size constraints
    item.w = Math.max(constraints.minItemSize.w, Math.min(item.w, constraints.maxItemSize.w));
    item.h = Math.max(constraints.minItemSize.h, Math.min(item.h, constraints.maxItemSize.h));
  });
  
  // Fix overlaps using a simple algorithm
  const sortedItems = repairedLayout.sort((a, b) => {
    if (a.y === b.y) return a.x - b.x;
    return a.y - b.y;
  });
  
  const occupiedCells = new Map<string, string>();
  
  sortedItems.forEach(item => {
    let placed = false;
    let attempts = 0;
    const maxAttempts = 100;
    
    while (!placed && attempts < maxAttempts) {
      let hasCollision = false;
      
      // Check if current position has collision
      for (let x = item.x; x < item.x + item.w && !hasCollision; x++) {
        for (let y = item.y; y < item.y + item.h && !hasCollision; y++) {
          const cellKey = `${x},${y}`;
          if (occupiedCells.has(cellKey) && occupiedCells.get(cellKey) !== item.i) {
            hasCollision = true;
          }
        }
      }
      
      if (!hasCollision) {
        // Mark cells as occupied
        for (let x = item.x; x < item.x + item.w; x++) {
          for (let y = item.y; y < item.y + item.h; y++) {
            occupiedCells.set(`${x},${y}`, item.i);
          }
        }
        placed = true;
      } else {
        // Move item to next available position
        item.x++;
        if (item.x + item.w > maxCols) {
          item.x = 0;
          item.y++;
        }
      }
      
      attempts++;
    }
  });
  
  return repairedLayout;
};

export const optimizeSpacing = (
  layout: Layout[], 
  breakpoint: keyof GridConstraints['maxCols'],
  constraints: GridConstraints = DEFAULT_CONSTRAINTS
): Layout[] => {
  const optimizedLayout = [...layout];
  const maxCols = constraints.maxCols[breakpoint];
  
  // Sort by position (top-left to bottom-right)
  optimizedLayout.sort((a, b) => {
    if (a.y === b.y) return a.x - b.x;
    return a.y - b.y;
  });
  
  // Compact vertically - move items up to fill gaps
  const occupiedRows = new Array(100).fill(null).map(() => new Array(maxCols).fill(false));
  
  optimizedLayout.forEach(item => {
    // Find the highest available position for this item
    let targetY = 0;
    let canPlace = false;
    
    while (!canPlace && targetY < 50) {
      canPlace = true;
      
      // Check if item can be placed at targetY
      for (let x = item.x; x < item.x + item.w && canPlace; x++) {
        for (let y = targetY; y < targetY + item.h && canPlace; y++) {
          if (occupiedRows[y]?.[x]) {
            canPlace = false;
          }
        }
      }
      
      if (canPlace) {
        item.y = targetY;
        // Mark cells as occupied
        for (let x = item.x; x < item.x + item.w; x++) {
          for (let y = targetY; y < targetY + item.h; y++) {
            if (occupiedRows[y]) {
              occupiedRows[y][x] = true;
            }
          }
        }
      } else {
        targetY++;
      }
    }
  });
  
  return optimizedLayout;
};

export const preventOutOfBounds = (
  item: Layout,
  breakpoint: keyof GridConstraints['maxCols'],
  constraints: GridConstraints = DEFAULT_CONSTRAINTS
): Layout => {
  const maxCols = constraints.maxCols[breakpoint];
  const bounded = { ...item };
  
  // Ensure item doesn't go out of bounds
  bounded.x = Math.max(0, Math.min(bounded.x, maxCols - bounded.w));
  bounded.y = Math.max(0, bounded.y);
  
  // Ensure item size is within constraints
  bounded.w = Math.max(constraints.minItemSize.w, Math.min(bounded.w, constraints.maxItemSize.w));
  bounded.h = Math.max(constraints.minItemSize.h, Math.min(bounded.h, constraints.maxItemSize.h));
  
  // If item is still too wide, reduce width
  if (bounded.x + bounded.w > maxCols) {
    bounded.w = maxCols - bounded.x;
  }
  
  return bounded;
};
