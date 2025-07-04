
import { Layout } from 'react-grid-layout'

type BreakpointKey = 'lg' | 'md' | 'sm' | 'xs'

export const validateLayout = (layout: Layout[], breakpoint: BreakpointKey) => {
  const errors: string[] = []
  
  // Basic validation logic
  layout.forEach(item => {
    if (item.x < 0 || item.y < 0) {
      errors.push(`Item ${item.i} has negative position`)
    }
    if (item.w <= 0 || item.h <= 0) {
      errors.push(`Item ${item.i} has invalid dimensions`)
    }
  })
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export const repairLayout = (layout: Layout[], breakpoint: BreakpointKey): Layout[] => {
  return layout.map(item => ({
    ...item,
    x: Math.max(0, item.x),
    y: Math.max(0, item.y),
    w: Math.max(1, item.w),
    h: Math.max(1, item.h)
  }))
}

export const preventOutOfBounds = (item: Layout, breakpoint: BreakpointKey): Layout => {
  const cols = { lg: 4, md: 2, sm: 1, xs: 1 }
  const maxCols = cols[breakpoint]
  
  return {
    ...item,
    x: Math.min(item.x, maxCols - item.w),
    y: Math.max(0, item.y),
    w: Math.min(item.w, maxCols),
    h: Math.max(1, item.h)
  }
}
