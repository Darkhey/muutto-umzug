
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { DashboardModule } from './ModularDashboard';

interface GridPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface MagneticDraggableModuleProps {
  module: DashboardModule;
  position?: GridPosition;
  onToggle: (id: string) => void;
  onPositionChange: (id: string, x: number, y: number) => void;
}

export const MagneticDraggableModule = ({ 
  module, 
  position, 
  onToggle, 
  onPositionChange 
}: MagneticDraggableModuleProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: module.id,
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
    gridColumn: position ? `${position.x + 1} / span ${position.width}` : 'auto',
    gridRow: position ? `${position.y + 1} / span ${position.height}` : 'auto',
  };

  const [open, setOpen] = useState(false);

  // Handle drag end to update position
  const handleDragEnd = () => {
    if (transform && position) {
      // Calculate new grid position based on transform
      const GRID_CELL_SIZE = 200; // Approximate cell size
      const deltaX = Math.round(transform.x / GRID_CELL_SIZE);
      const deltaY = Math.round(transform.y / GRID_CELL_SIZE);
      
      const newX = Math.max(0, position.x + deltaX);
      const newY = Math.max(0, position.y + deltaY);
      
      onPositionChange(module.id, newX, newY);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        transition-all duration-200 ease-out
        ${isDragging ? 'rotate-1 shadow-2xl' : 'shadow-lg'}
        ${!module.enabled ? 'opacity-60' : ''}
      `}
      onMouseUp={handleDragEnd}
      onTouchEnd={handleDragEnd}
    >
      <Collapsible open={open} onOpenChange={setOpen} className="h-full">
        <Card className="bg-white h-full border-2 border-transparent hover:border-blue-200 transition-colors flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <div
                className="cursor-move touch-none p-1 rounded hover:bg-gray-100 transition-colors"
                {...attributes}
                {...listeners}
              >
                <GripVertical className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </div>
              <CardTitle className="text-lg flex items-center gap-2">
                {module.icon}
                {module.title}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={module.enabled}
                onCheckedChange={() => onToggle(module.id)}
                id={`toggle-${module.id}`}
              />
              <Label htmlFor={`toggle-${module.id}`} className="text-xs text-gray-500">
                {module.enabled ? 'Aktiv' : 'Inaktiv'}
              </Label>
              <CollapsibleTrigger asChild className="sm:hidden">
                <button className="p-1 rounded hover:bg-gray-100">
                  {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </CollapsibleTrigger>
            </div>
          </CardHeader>
          <CollapsibleContent className="sm:block">
            <CardContent>
              {module.enabled ? (
                module.component
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
                  <p className="mb-4">Dieses Modul ist deaktiviert</p>
                  <button
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    onClick={() => onToggle(module.id)}
                  >
                    Aktivieren
                  </button>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
};
