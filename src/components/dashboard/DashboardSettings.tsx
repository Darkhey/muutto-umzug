import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

interface DashboardSettingsProps {
  settings: {
    compactLayout: boolean;
    autoSort: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
    usageStats: boolean;
    aiPersonalization: boolean;
  };
  onSettingChange: (setting: string, value: boolean) => void;
  onSaveSettings: () => void;
}

export const DashboardSettings = ({ 
  settings, 
  onSettingChange, 
  onSaveSettings 
}: DashboardSettingsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-gray-600" />
          Dashboard-Einstellungen
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="font-semibold">Layout-Einstellungen</h3>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Kompaktes Layout</p>
                <p className="text-sm text-gray-600">Zeigt mehr Module auf einmal an</p>
              </div>
              <Switch 
                id="compact-layout" 
                checked={settings.compactLayout}
                onCheckedChange={(checked) => onSettingChange('compactLayout', checked)}
              />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Automatisches Sortieren</p>
                <p className="text-sm text-gray-600">Sortiert Module nach Priorität</p>
              </div>
              <Switch 
                id="auto-sort" 
                checked={settings.autoSort}
                onCheckedChange={(checked) => onSettingChange('autoSort', checked)}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h3 className="font-semibold">Benachrichtigungen</h3>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">E-Mail-Benachrichtigungen</p>
                <p className="text-sm text-gray-600">Erhalte wichtige Updates per E-Mail</p>
              </div>
              <Switch 
                id="email-notifications" 
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => onSettingChange('emailNotifications', checked)}
              />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Push-Benachrichtigungen</p>
                <p className="text-sm text-gray-600">Erhalte Echtzeit-Updates im Browser</p>
              </div>
              <Switch 
                id="push-notifications" 
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => onSettingChange('pushNotifications', checked)}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h3 className="font-semibold">Daten & Privatsphäre</h3>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Anonyme Nutzungsstatistiken</p>
                <p className="text-sm text-gray-600">Hilf uns, die App zu verbessern</p>
              </div>
              <Switch 
                id="usage-stats" 
                checked={settings.usageStats}
                onCheckedChange={(checked) => onSettingChange('usageStats', checked)}
              />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">KI-Personalisierung</p>
                <p className="text-sm text-gray-600">Personalisierte Tipps vom KI-Assistenten</p>
              </div>
              <Switch 
                id="ai-personalization" 
                checked={settings.aiPersonalization}
                onCheckedChange={(checked) => onSettingChange('aiPersonalization', checked)}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={onSaveSettings}
            >
              Einstellungen speichern
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};