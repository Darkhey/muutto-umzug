
import React from 'react';
import { Responsive, WidthProvider, Layout, Layouts } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface ResponsiveGridLayoutProps {
  children: React.ReactNode[];
  layouts: Layouts;
  onLayoutChange: (layout: Layout[], layouts: Layouts) => void;
  className?: string;
}

export const EnhancedResponsiveGrid: React.FC<ResponsiveGridLayoutProps> = ({
  children,
  layouts,
  onLayoutChange,
  className = "layout"
}) => {
  // Optimized breakpoints and columns for better responsive behavior
  const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480 };
  const cols = { lg: 3, md: 2, sm: 1, xs: 1 }; // Reduced lg from 4 to 3 for better spacing

  return (
    <div className="relative">
      <ResponsiveGridLayout
        className={className}
        layouts={layouts}
        breakpoints={breakpoints}
        cols={cols}
        rowHeight={120} // Reduced from 180px for better granularity
        onLayoutChange={onLayoutChange}
        compactType="horizontal" // Changed from "vertical" for better space utilization
        preventCollision={true} // Enable collision prevention
        margin={[16, 16]}
        containerPadding={[16, 16]} // Added container padding
        draggableHandle=".drag-handle"
        resizeHandles={['se']}
        useCSSTransforms={true}
        isDraggable={true}
        isResizable={true}
        autoSize={true}
        verticalCompact={true}
        measureBeforeMount={false}
        style={{ minHeight: '600px' }}
      >
        {children}
      </ResponsiveGridLayout>
    </div>
  );
};
