import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { GripVertical } from 'lucide-react';
import { DashboardModule } from './ModularDashboard';

interface DraggableModuleProps {
  module: DashboardModule;
  onToggle: (id: string) => void;
}

export const DraggableModule = ({ module, onToggle }: DraggableModuleProps) => {
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
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`mb-6 ${
        module.size === 'large' ? 'col-span-3' : 
        module.size === 'medium' ? 'col-span-2' : 
        'col-span-1'
      }`}
    >
      <Card className={`bg-white shadow-lg h-full ${!module.enabled ? 'opacity-60' : ''}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <div 
              className="cursor-move touch-none" 
              {...attributes} 
              {...listeners}
            >
              <GripVertical className="h-5 w-5 text-gray-400 hover:text-gray-600" />
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
          </div>
        </CardHeader>
        <CardContent>
          {module.enabled ? (
            module.component
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
              <p className="mb-4">Dieses Modul ist deaktiviert</p>
              <button 
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                onClick={() => onToggle(module.id)}
              >
                Aktivieren
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};