import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { GripVertical, Maximize2, Minimize2 } from 'lucide-react';
import { useState } from 'react';
import { DashboardModule } from '@/hooks/useEnhancedDashboardModules';

interface ModuleCardProps {
  module: DashboardModule;
  onToggle: (id: string) => void;
  isDraggable?: boolean;
  dragHandleProps?: Record<string, any>;
}

export const ModuleCard = ({ 
  module, 
  onToggle, 
  isDraggable = false,
  dragHandleProps = {}
}: ModuleCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className={`bg-white shadow-lg transition-all duration-300 ${
      !module.enabled ? 'opacity-60' : ''
    } ${
      isExpanded
        ? 'fixed inset-4 z-50 overflow-y-auto max-h-[calc(100dvh-2rem)]'
        : ''
    }`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          {isDraggable && (
            <div className="cursor-move" {...dragHandleProps}>
              <GripVertical className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </div>
          )}
          <CardTitle className="text-lg flex items-center gap-2">
            {module.icon}
            {module.title}
          </CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
          <Switch 
            checked={module.enabled} 
            onCheckedChange={() => onToggle(module.id)} 
            id={`toggle-${module.id}`}
          />
          <Label htmlFor={`toggle-${module.id}`} className="text-xs text-gray-500">
            {module.enabled ? 'Aktiv' : 'Inaktiv'}
          </Label>
        </div>
      </CardHeader>
      <CardContent>
        {module.enabled ? (
          module.component
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
            <p className="mb-4">Dieses Modul ist deaktiviert</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onToggle(module.id)}
            >
              Aktivieren
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};