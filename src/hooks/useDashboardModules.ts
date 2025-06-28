import { useState, useEffect } from 'react';
import { DashboardModule } from '@/components/dashboard/ModularDashboard';
import { useToast } from '@/hooks/use-toast';

export const useDashboardModules = (initialModules: DashboardModule[]) => {
  const { toast } = useToast();
  const [modules, setModules] = useState<DashboardModule[]>(initialModules);
  const [settings, setSettings] = useState({
    compactLayout: false,
    autoSort: false,
    emailNotifications: true,
    pushNotifications: false,
    usageStats: true,
    aiPersonalization: true,
  });

  // Load saved modules from localStorage
  useEffect(() => {
    const savedModules = localStorage.getItem('dashboard_modules');
    const savedSettings = localStorage.getItem('dashboard_settings');
    
    if (savedModules) {
      try {
        const parsedModules = JSON.parse(savedModules);
        setModules(parsedModules);
      } catch (error) {
        console.error('Error parsing saved modules:', error);
      }
    }
    
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
      } catch (error) {
        console.error('Error parsing saved settings:', error);
      }
    }
  }, []);

  // Save modules to localStorage when they change
  useEffect(() => {
    if (modules.length > 0) {
      localStorage.setItem('dashboard_modules', JSON.stringify(modules));
    }
  }, [modules]);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('dashboard_settings', JSON.stringify(settings));
  }, [settings]);

  const toggleModule = (id: string) => {
    setModules(prev => 
      prev.map(module => 
        module.id === id ? { ...module, enabled: !module.enabled } : module
      )
    );
    
    const module = modules.find(m => m.id === id);
    if (module) {
      toast({
        title: module.enabled ? `${module.title} deaktiviert` : `${module.title} aktiviert`,
        description: module.enabled 
          ? `Das Modul wurde ausgeblendet` 
          : `Das Modul wurde zum Dashboard hinzugefügt`,
      });
    }
  };

  const updateModuleOrder = (newModules: DashboardModule[]) => {
    setModules(newModules);
    toast({
      title: 'Dashboard angepasst',
      description: 'Die Anordnung der Module wurde gespeichert',
    });
  };

  const resetLayout = () => {
    setModules(initialModules);
    toast({
      title: 'Layout zurückgesetzt',
      description: 'Das Dashboard wurde auf die Standardeinstellungen zurückgesetzt',
    });
  };

  const updateSetting = (setting: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const saveSettings = () => {
    toast({
      title: 'Einstellungen gespeichert',
      description: 'Deine Dashboard-Einstellungen wurden aktualisiert',
    });
  };

  return {
    modules,
    settings,
    toggleModule,
    updateModuleOrder,
    resetLayout,
    updateSetting,
    saveSettings
  };
};