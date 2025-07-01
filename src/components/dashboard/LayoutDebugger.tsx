
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Grid, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { Layout, Layouts } from 'react-grid-layout';

interface LayoutDebuggerProps {
  layouts: Layouts;
  modules: Array<{ id: string; title: string; enabled: boolean; size: string }>;
  onCompactLayout: () => void;
  onResetLayout: () => void;
  debugMode?: boolean;
  onToggleDebug?: () => void;
}

export const LayoutDebugger: React.FC<LayoutDebuggerProps> = ({
  layouts,
  modules,
  onCompactLayout,
  onResetLayout,
  debugMode = false,
  onToggleDebug
}) => {
  const getLayoutStats = (breakpoint: keyof Layouts) => {
    const layout = layouts[breakpoint] || [];
    const overlaps = detectOverlaps(layout);
    const totalArea = layout.reduce((sum, item) => sum + (item.w * item.h), 0);
    return { items: layout.length, overlaps: overlaps.length, totalArea };
  };

  const detectOverlaps = (layout: Layout[]) => {
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

  if (!debugMode) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleDebug}
          className="bg-white shadow-lg"
        >
          <Grid className="h-4 w-4 mr-2" />
          Debug
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 bg-white shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Grid className="h-4 w-4" />
              Layout Debugger
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleDebug}
              className="h-6 w-6 p-0"
            >
              <EyeOff className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Layout Statistics */}
          <div>
            <h4 className="text-xs font-medium mb-2">Layout-Statistiken</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {(['lg', 'md', 'sm', 'xs'] as const).map(breakpoint => {
                const stats = getLayoutStats(breakpoint);
                return (
                  <div key={breakpoint} className="flex justify-between">
                    <span className="uppercase">{breakpoint}:</span>
                    <div className="flex gap-1">
                      <Badge variant="outline" className="text-xs px-1">
                        {stats.items}
                      </Badge>
                      {stats.overlaps > 0 && (
                        <Badge variant="destructive" className="text-xs px-1">
                          {stats.overlaps} ⚠️
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Module Status */}
          <div>
            <h4 className="text-xs font-medium mb-2">Module-Status</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {modules.map(module => (
                <div key={module.id} className="flex items-center justify-between text-xs">
                  <span className="truncate">{module.title}</span>
                  <div className="flex gap-1">
                    <Badge 
                      variant={module.enabled ? "default" : "secondary"} 
                      className="text-xs px-1"
                    >
                      {module.size}
                    </Badge>
                    {module.enabled ? (
                      <Eye className="h-3 w-3 text-green-600" />
                    ) : (
                      <EyeOff className="h-3 w-3 text-gray-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onCompactLayout}
              className="flex-1 text-xs"
            >
              <Grid className="h-3 w-3 mr-1" />
              Komprimieren
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onResetLayout}
              className="flex-1 text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
