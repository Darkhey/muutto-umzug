
import React from 'react';
import { Responsive, WidthProvider, Layout, Layouts } from 'react-grid-layout';
import { validateLayout, repairLayout, preventOutOfBounds } from '@/utils/layoutValidator';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface ResponsiveGridLayoutProps {
  children: React.ReactNode[];
  layouts: Layouts;
  onLayoutChange: (layout: Layout[], layouts: Layouts) => void;
  className?: string;
  isDraggable?: boolean;
  isResizable?: boolean;
}

export const EnhancedResponsiveGrid: React.FC<ResponsiveGridLayoutProps> = ({
  children,
  layouts,
  onLayoutChange,
  className = "layout",
  isDraggable = true,
  isResizable = true
}) => {
  // Enhanced breakpoints for better responsive behavior
  const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480 };
  const cols = { lg: 4, md: 2, sm: 1, xs: 1 };
  
  // Responsive margins and row heights for better spacing
  const responsiveConfig = {
    lg: { margin: [16, 16], rowHeight: 120, containerPadding: [20, 20] },
    md: { margin: [14, 14], rowHeight: 110, containerPadding: [18, 18] },
    sm: { margin: [12, 12], rowHeight: 100, containerPadding: [16, 16] },
    xs: { margin: [10, 10], rowHeight: 90, containerPadding: [12, 12] }
  };

  // Enhanced layout change handler with validation
  const handleLayoutChange = (layout: Layout[], allLayouts: Layouts) => {
    // Validate and repair layouts for each breakpoint
    const repairedLayouts: Layouts = {};
    
    Object.keys(allLayouts).forEach(breakpoint => {
      const bp = breakpoint as keyof Layouts;
      const currentLayout = allLayouts[bp] || [];
      
      // Validate layout
      const validation = validateLayout(currentLayout, bp as any);
      
      if (!validation.isValid) {
        // Repair layout if invalid
        repairedLayouts[bp] = repairLayout(currentLayout, bp as any);
      } else {
        repairedLayouts[bp] = currentLayout;
      }
    });
    
    onLayoutChange(layout, repairedLayouts);
  };

  // Enhanced drag stop handler with boundary checking
  const handleDragStop = (layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, e: MouseEvent, element: HTMLElement) => {
    // Get current breakpoint
    const width = window.innerWidth;
    let currentBreakpoint: keyof typeof cols = 'lg';
    
    if (width < breakpoints.xs) currentBreakpoint = 'xs';
    else if (width < breakpoints.sm) currentBreakpoint = 'sm';
    else if (width < breakpoints.md) currentBreakpoint = 'md';
    else if (width < breakpoints.lg) currentBreakpoint = 'lg';
    
    // Prevent out of bounds
    const boundedItem = preventOutOfBounds(newItem, currentBreakpoint);
    
    // Update the layout with the bounded item
    const updatedLayout = layout.map(item => 
      item.i === boundedItem.i ? boundedItem : item
    );
    
    // Trigger layout change with validation
    const currentLayouts = { ...layouts };
    currentLayouts[currentBreakpoint] = updatedLayout;
    handleLayoutChange(updatedLayout, currentLayouts);
  };

  // Enhanced resize stop handler
  const handleResizeStop = (layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, e: MouseEvent, element: HTMLElement) => {
    // Get current breakpoint
    const width = window.innerWidth;
    let currentBreakpoint: keyof typeof cols = 'lg';
    
    if (width < breakpoints.xs) currentBreakpoint = 'xs';
    else if (width < breakpoints.sm) currentBreakpoint = 'sm';
    else if (width < breakpoints.md) currentBreakpoint = 'md';
    else if (width < breakpoints.lg) currentBreakpoint = 'lg';
    
    // Prevent out of bounds and enforce size constraints
    const boundedItem = preventOutOfBounds(newItem, currentBreakpoint);
    
    // Update the layout with the bounded item
    const updatedLayout = layout.map(item => 
      item.i === boundedItem.i ? boundedItem : item
    );
    
    // Trigger layout change with validation
    const currentLayouts = { ...layouts };
    currentLayouts[currentBreakpoint] = updatedLayout;
    handleLayoutChange(updatedLayout, currentLayouts);
  };

  // Get current config based on screen size
  const getCurrentConfig = () => {
    const width = window.innerWidth;
    if (width < breakpoints.xs) return responsiveConfig.xs;
    if (width < breakpoints.sm) return responsiveConfig.sm;
    if (width < breakpoints.md) return responsiveConfig.md;
    return responsiveConfig.lg;
  };

  const currentConfig = getCurrentConfig();

  return (
    <div className="relative w-full">
      <ResponsiveGridLayout
        className={className}
        layouts={layouts}
        breakpoints={breakpoints}
        cols={cols}
        rowHeight={currentConfig.rowHeight}
        onLayoutChange={handleLayoutChange}
        onDragStop={handleDragStop}
        onResizeStop={handleResizeStop}
        compactType="vertical"
        preventCollision={true}
        allowOverlap={false}
        margin={currentConfig.margin}
        containerPadding={currentConfig.containerPadding}
        draggableHandle=".drag-handle"
        resizeHandles={['se']}
        useCSSTransforms={true}
        isDraggable={isDraggable}
        isResizable={isResizable}
        autoSize={true}
        verticalCompact={false} // Disable for better spacing control
        measureBeforeMount={false}
        style={{ minHeight: '400px', width: '100%' }}
        isBounded={true}
        // Animation settings
        css={{
          '.react-grid-item.react-grid-placeholder': {
            background: 'rgba(59, 130, 246, 0.15)',
            border: '2px dashed rgb(59, 130, 246)',
            borderRadius: '8px',
            opacity: 0.8,
            transition: 'all 200ms ease',
          },
          '.react-grid-item.cssTransforms': {
            transition: 'transform 200ms ease',
          },
          '.react-grid-item.react-draggable-dragging': {
            transition: 'none',
            zIndex: 1000,
            opacity: 0.8,
          },
          '.react-grid-item.resizing': {
            opacity: 0.8,
            transition: 'none',
          }
        } as any}
      >
        {children}
      </ResponsiveGridLayout>
    </div>
  );
};
