
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { GripVertical, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface ModuleCardProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  enabled: boolean;
  category: 'primary' | 'secondary' | 'utility';
  description: string;
  size: 'small' | 'medium' | 'large';
  onToggle: (id: string) => void;
  onRemove?: (id: string) => void;
}

export const EnhancedModuleCard: React.FC<ModuleCardProps> = ({
  id,
  title,
  icon,
  component,
  enabled,
  category,
  description,
  size,
  onToggle,
  onRemove
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'primary': return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'secondary': return 'bg-green-50 text-green-800 border-green-200';
      case 'utility': return 'bg-purple-50 text-purple-800 border-purple-200';
      default: return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  return (
    <div data-grid-id={id} className="h-full">
      <Collapsible open={!isCollapsed} onOpenChange={setIsCollapsed}>
        <Card className={`
          h-full flex flex-col overflow-hidden transition-all duration-200 ease-out
          ${enabled ? 'bg-white border-2 border-transparent hover:border-blue-200' : 'bg-gray-50 opacity-60'}
        `}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 flex-shrink-0">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="drag-handle cursor-move touch-none p-1 rounded hover:bg-gray-100 transition-colors flex-shrink-0">
                <GripVertical className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </div>
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {icon}
                <CardTitle className="text-sm font-medium truncate">{title}</CardTitle>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Badge variant="outline" className={`text-xs px-2 py-0.5 ${getCategoryColor(category)}`}>
                {category === 'primary' ? 'Haupt' : category === 'secondary' ? 'Zusatz' : 'Tool'}
              </Badge>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  {isCollapsed ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
                </Button>
              </CollapsibleTrigger>
              <div className="flex items-center gap-1">
                <Switch
                  checked={enabled}
                  onCheckedChange={() => onToggle(id)}
                  id={`toggle-${id}`}
                  className="scale-75"
                />
                {onRemove && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0 text-red-500 hover:bg-red-50"
                    onClick={() => onRemove(id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CollapsibleContent className="flex-1 flex flex-col">
            <CardContent className="flex-1 overflow-hidden">
              {enabled ? (
                <div className="h-full overflow-auto">
                  {component}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500 h-full">
                  <p className="mb-4 text-sm">Dieses Modul ist deaktiviert</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onToggle(id)}
                  >
                    Aktivieren
                  </Button>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
};
