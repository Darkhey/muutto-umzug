
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
  const breakpoints = { lg: 1200, md: 768, sm: 480, xs: 0 };
  const cols = { lg: 4, md: 2, sm: 1, xs: 1 };

  return (
    <ResponsiveGridLayout
      className={className}
      layouts={layouts}
      breakpoints={breakpoints}
      cols={cols}
      rowHeight={180}
      onLayoutChange={onLayoutChange}
      compactType="vertical"
      preventCollision={false}
      margin={[16, 16]}
      containerPadding={[0, 0]}
      draggableHandle=".drag-handle"
      resizeHandles={['se']}
      useCSSTransforms={true}
    >
      {children}
    </ResponsiveGridLayout>
  );
};
