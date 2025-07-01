
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
  const cols = { lg: 4, md: 2, sm: 1, xs: 1 }; // Increased lg to 4 columns

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

  return (
    <div className="relative">
      <ResponsiveGridLayout
        className={className}
        layouts={layouts}
        breakpoints={breakpoints}
        cols={cols}
        rowHeight={100} // Reduced for better granularity
        onLayoutChange={handleLayoutChange}
        onDragStop={handleDragStop}
        onResizeStop={handleResizeStop}
        compactType="vertical" // Changed back to vertical for predictable behavior
        preventCollision={true} // Enable collision prevention
        allowOverlap={false} // Prevent overlapping
        margin={[12, 12]} // Optimized spacing
        containerPadding={[16, 16]}
        draggableHandle=".drag-handle"
        resizeHandles={['se']}
        useCSSTransforms={true}
        isDraggable={isDraggable}
        isResizable={isResizable}
        autoSize={true}
        verticalCompact={true}
        measureBeforeMount={false}
        style={{ minHeight: '600px' }}
        // Enhanced drag and resize behavior
        isBounded={true} // Keep items within bounds
        transformScale={1}
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
