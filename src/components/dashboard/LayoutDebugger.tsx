
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Grid, Eye, EyeOff, RefreshCw, AlertTriangle, CheckCircle, Wrench, Activity } from 'lucide-react';
import { Layout, Layouts } from 'react-grid-layout';
import { validateLayout, repairLayout, optimizeSpacing, LayoutValidationResult } from '@/utils/layoutValidator';

interface LayoutDebuggerProps {
  layouts: Layouts;
  modules: Array<{ id: string; title: string; enabled: boolean; size: string }>;
  onCompactLayout: () => void;
  onResetLayout: () => void;
  onRepairLayout?: (layouts: Layouts) => void;
  onOptimizeLayout?: (layouts: Layouts) => void;
  debugMode?: boolean;
  onToggleDebug?: () => void;
}

export const LayoutDebugger: React.FC<LayoutDebuggerProps> = ({
  layouts,
  modules,
  onCompactLayout,
  onResetLayout,
  onRepairLayout,
  onOptimizeLayout,
  debugMode = false,
  onToggleDebug
}) => {
  const getLayoutValidation = (breakpoint: keyof Layouts): LayoutValidationResult => {
    const layout = layouts[breakpoint] || [];
    return validateLayout(layout, breakpoint as any);
  };

  const getAllValidations = () => {
    const breakpoints = ['lg', 'md', 'sm', 'xs'] as const;
    return breakpoints.map(bp => ({
      breakpoint: bp,
      validation: getLayoutValidation(bp)
    }));
  };

  const getOverallHealthScore = () => {
    const validations = getAllValidations();
    const totalScore = validations.reduce((sum, { validation }) => sum + validation.healthScore, 0);
    return Math.round(totalScore / validations.length);
  };

  const getTotalIssues = () => {
    const validations = getAllValidations();
    return validations.reduce((total, { validation }) => 
      total + validation.overlaps.length + validation.outOfBounds.length, 0
    );
  };

  const handleRepairLayout = () => {
    if (!onRepairLayout) return;
    
    const repairedLayouts: Layouts = {};
    
    Object.keys(layouts).forEach(breakpoint => {
      const bp = breakpoint as keyof Layouts;
      const layout = layouts[bp] || [];
      repairedLayouts[bp] = repairLayout(layout, bp as any);
    });
    
    onRepairLayout(repairedLayouts);
  };

  const handleOptimizeLayout = () => {
    if (!onOptimizeLayout) return;
    
    const optimizedLayouts: Layouts = {};
    
    Object.keys(layouts).forEach(breakpoint => {
      const bp = breakpoint as keyof Layouts;
      const layout = layouts[bp] || [];
      optimizedLayouts[bp] = optimizeSpacing(layout, bp as any);
    });
    
    onOptimizeLayout(optimizedLayouts);
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthIcon = (score: number) => {
    if (score >= 80) return CheckCircle;
    if (score >= 60) return AlertTriangle;
    return AlertTriangle;
  };

  if (!debugMode) {
    const overallHealth = getOverallHealthScore();
    const totalIssues = getTotalIssues();
    
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleDebug}
          className={`bg-white shadow-lg ${totalIssues > 0 ? 'border-orange-300 text-orange-700' : ''}`}
        >
          <Grid className="h-4 w-4 mr-2" />
          Debug
          {totalIssues > 0 && (
            <Badge variant="destructive" className="ml-2 h-5 px-2 text-xs">
              {totalIssues}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  const overallHealth = getOverallHealthScore();
  const HealthIcon = getHealthIcon(overallHealth);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-96 bg-white shadow-lg border-2">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Grid className="h-4 w-4" />
              Layout Debugger
              <Badge 
                variant="outline" 
                className={`${getHealthColor(overallHealth)} border-current`}
              >
                <HealthIcon className="h-3 w-3 mr-1" />
                {overallHealth}%
              </Badge>
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
        <CardContent className="space-y-4">
          {/* Overall Health Status */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Layout Health</span>
              <div className={`flex items-center gap-1 ${getHealthColor(overallHealth)}`}>
                <Activity className="h-3 w-3" />
                <span className="font-bold">{overallHealth}%</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  overallHealth >= 80 ? 'bg-green-500' : 
                  overallHealth >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${overallHealth}%` }}
              />
            </div>
          </div>

          {/* Breakpoint Analysis */}
          <div>
            <h4 className="text-xs font-medium mb-2">Breakpoint Analysis</h4>
            <div className="space-y-1">
              {getAllValidations().map(({ breakpoint, validation }) => (
                <div key={breakpoint} className="flex justify-between items-center text-xs">
                  <span className="uppercase font-mono">{breakpoint}:</span>
                  <div className="flex gap-1">
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      {(layouts[breakpoint] || []).length} items
                    </Badge>
                    {validation.overlaps.length > 0 && (
                      <Badge variant="destructive" className="text-xs px-1 py-0">
                        {validation.overlaps.length} overlaps
                      </Badge>
                    )}
                    {validation.outOfBounds.length > 0 && (
                      <Badge variant="destructive" className="text-xs px-1 py-0">
                        {validation.outOfBounds.length} OOB
                      </Badge>
                    )}
                    <Badge 
                      variant="outline" 
                      className={`text-xs px-1 py-0 ${getHealthColor(validation.healthScore)}`}
                    >
                      {validation.healthScore}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Issue Details */}
          {getTotalIssues() > 0 && (
            <div className="p-2 bg-red-50 border border-red-200 rounded">
              <div className="flex items-center gap-1 mb-1">
                <AlertTriangle className="h-3 w-3 text-red-600" />
                <span className="text-xs font-medium text-red-800">Issues Detected</span>
              </div>
              <div className="text-xs text-red-700 space-y-1">
                {getAllValidations().map(({ breakpoint, validation }) => (
                  <div key={breakpoint}>
                    {validation.overlaps.length > 0 && (
                      <div>{breakpoint.toUpperCase()}: {validation.overlaps.length} overlapping modules</div>
                    )}
                    {validation.outOfBounds.length > 0 && (
                      <div>{breakpoint.toUpperCase()}: {validation.outOfBounds.length} out-of-bounds modules</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Module Status */}
          <div>
            <h4 className="text-xs font-medium mb-2">Module Status</h4>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {modules.slice(0, 6).map(module => (
                <div key={module.id} className="flex items-center justify-between text-xs">
                  <span className="truncate flex-1">{module.title}</span>
                  <div className="flex gap-1 items-center">
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
              {modules.length > 6 && (
                <div className="text-xs text-gray-500 text-center">
                  +{modules.length - 6} more modules
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            {getTotalIssues() > 0 && onRepairLayout && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRepairLayout}
                className="text-xs bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
              >
                <Wrench className="h-3 w-3 mr-1" />
                Auto-Repair
              </Button>
            )}
            {onOptimizeLayout && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleOptimizeLayout}
                className="text-xs bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
              >
                <Activity className="h-3 w-3 mr-1" />
                Optimize
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onCompactLayout}
              className="text-xs"
            >
              <Grid className="h-3 w-3 mr-1" />
              Compact
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onResetLayout}
              className="text-xs"
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
