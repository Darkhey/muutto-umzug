
export interface LayoutValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  healthScore: number;
  overlaps: Array<{
    item1: string;
    item2: string;
    area: number;
  }>;
  outOfBounds: Array<{
    item: string;
    bounds: { x: number; y: number; w: number; h: number };
  }>;
}

export type BreakpointKey = 'lg' | 'md' | 'sm' | 'xs' | 'xxs';

export function validateLayout(layout: any[]): LayoutValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const overlaps: Array<{ item1: string; item2: string; area: number }> = [];
  const outOfBounds: Array<{ item: string; bounds: { x: number; y: number; w: number; h: number } }> = [];
  
  // Grundlegende Validierung
  if (!Array.isArray(layout)) {
    errors.push('Layout muss ein Array sein');
    return {
      isValid: false,
      errors,
      warnings,
      healthScore: 0,
      overlaps,
      outOfBounds
    };
  }

  // Überprüfe Überlappungen
  for (let i = 0; i < layout.length; i++) {
    for (let j = i + 1; j < layout.length; j++) {
      const item1 = layout[i];
      const item2 = layout[j];
      
      if (isOverlapping(item1, item2)) {
        overlaps.push({
          item1: item1.i,
          item2: item2.i,
          area: calculateOverlapArea(item1, item2)
        });
      }
    }
  }

  // Berechne Health Score
  const healthScore = Math.max(0, 100 - (errors.length * 20) - (warnings.length * 10) - (overlaps.length * 15));

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    healthScore,
    overlaps,
    outOfBounds
  };
}

export function repairLayout(layout: any[]): any[] {
  const repairedLayout = [...layout];
  
  // Einfache Reparatur: Verschiebe überlappende Items
  for (let i = 0; i < repairedLayout.length; i++) {
    for (let j = i + 1; j < repairedLayout.length; j++) {
      if (isOverlapping(repairedLayout[i], repairedLayout[j])) {
        repairedLayout[j].y = repairedLayout[i].y + repairedLayout[i].h;
      }
    }
  }
  
  return repairedLayout;
}

export function optimizeSpacing(layout: any[]): any[] {
  return layout.map(item => ({
    ...item,
    y: Math.max(0, item.y)
  }));
}

export function preventOutOfBounds(layout: any[]): any[] {
  return layout.map(item => ({
    ...item,
    x: Math.max(0, Math.min(item.x, 12 - item.w)),
    y: Math.max(0, item.y)
  }));
}

function isOverlapping(item1: any, item2: any): boolean {
  return !(item1.x + item1.w <= item2.x || 
           item2.x + item2.w <= item1.x || 
           item1.y + item1.h <= item2.y || 
           item2.y + item2.h <= item1.y);
}

function calculateOverlapArea(item1: any, item2: any): number {
  const left = Math.max(item1.x, item2.x);
  const right = Math.min(item1.x + item1.w, item2.x + item2.w);
  const top = Math.max(item1.y, item2.y);
  const bottom = Math.min(item1.y + item1.h, item2.y + item2.h);
  
  if (left < right && top < bottom) {
    return (right - left) * (bottom - top);
  }
  return 0;
}
