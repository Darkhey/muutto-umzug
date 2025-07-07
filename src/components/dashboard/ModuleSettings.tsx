import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Settings, Sparkles } from 'lucide-react';
import { DashboardModule } from '@/hooks/useEnhancedDashboardModules';

interface ModuleSettingsProps {
  modules: DashboardModule[];
  onToggleModule: (id: string) => void;
  onResetLayout: () => void;
}

export const ModuleSettings = ({ modules, onToggleModule, onResetLayout }: ModuleSettingsProps) => {
  const categories = [
    { id: 'primary', name: 'Primäre Module', description: 'Hauptfunktionen der Anwendung' },
    { id: 'secondary', name: 'Sekundäre Module', description: 'Zusätzliche Funktionen' },
    { id: 'utility', name: 'Utility Module', description: 'Hilfreiche Extras' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          Verfügbare Module
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {categories.map(category => (
            <div key={category.id}>
              <h3 className="font-semibold mb-3">{category.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{category.description}</p>
              <div className="space-y-2">
                {modules
                  .filter(module => module.category === category.id)
                  .map(module => (
                    <div key={module.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {module.icon}
                        <div>
                          <p className="font-medium">{module.title}</p>
                          <p className="text-sm text-gray-600">{module.description}</p>
                        </div>
                      </div>
                      <Switch 
                        checked={module.enabled} 
                        onCheckedChange={() => onToggleModule(module.id)} 
                        id={`toggle-list-${module.id}`}
                      />
                    </div>
                  ))}
              </div>
              {category.id !== 'utility' && <Separator className="my-4" />}
            </div>
          ))}

          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={onResetLayout}>
              <Settings className="h-4 w-4 mr-2" />
              Standardlayout wiederherstellen
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};