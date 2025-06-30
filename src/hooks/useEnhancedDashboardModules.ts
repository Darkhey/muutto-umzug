
import { useState, useEffect, useCallback } from 'react';
import { Layout, Layouts } from 'react-grid-layout';
import { useToast } from '@/hooks/use-toast';

export interface DashboardModule {
  id: string;
  title: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  enabled: boolean;
  category: 'primary' | 'secondary' | 'utility';
  description: string;
  size: 'small' | 'medium' | 'large';
}

const getModuleGridSize = (size: 'small' | 'medium' | 'large') => {
  switch (size) {
    case 'small': return { w: 1, h: 2 };
    case 'medium': return { w: 1, h: 3 };
    case 'large': return { w: 2, h: 3 };
    default: return { w: 1, h: 3 };
  }
};

export const useEnhancedDashboardModules = (initialModules: DashboardModule[]) => {
  const { toast } = useToast();
  const [modules, setModules] = useState<DashboardModule[]>(initialModules);
  const [layouts, setLayouts] = useState<Layouts>({ lg: [], md: [], sm: [], xs: [] });
  const [settings, setSettings] = useState({
    compactLayout: true,
    autoSort: false,
    magneticGrid: true,
    showCategoryBadges: true,
  });

  // Load saved modules and layouts from localStorage
  useEffect(() => {
    const savedModules = localStorage.getItem('dashboard_modules_v2');
    const savedLayouts = localStorage.getItem('dashboard_layouts_v2');
    const savedSettings = localStorage.getItem('dashboard_settings_v2');
    
    if (savedModules) {
      try {
        const parsedModules = JSON.parse(savedModules);
        setModules(parsedModules);
      } catch (error) {
        console.error('Error parsing saved modules:', error);
      }
    }

    if (savedLayouts) {
      try {
        const parsedLayouts = JSON.parse(savedLayouts);
        setLayouts(parsedLayouts);
      } catch (error) {
        console.error('Error parsing saved layouts:', error);
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

  // Apply initial modules when they change
  useEffect(() => {
    if (initialModules.length && modules.length === 0) {
      setModules(initialModules);
      generateDefaultLayouts(initialModules);
    }
  }, [initialModules, modules.length]);

  // Save modules to localStorage when they change
  useEffect(() => {
    if (modules.length > 0) {
      localStorage.setItem('dashboard_modules_v2', JSON.stringify(modules));
    }
  }, [modules]);

  // Save layouts to localStorage when they change
  useEffect(() => {
    localStorage.setItem('dashboard_layouts_v2', JSON.stringify(layouts));
  }, [layouts]);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('dashboard_settings_v2', JSON.stringify(settings));
  }, [settings]);

  const generateDefaultLayouts = useCallback((modulesToLayout: DashboardModule[]) => {
    const enabledModules = modulesToLayout.filter(m => m.enabled);
    
    // Generate layout for each breakpoint
    const newLayouts: Layouts = {
      lg: [], // 4 columns
      md: [], // 2 columns  
      sm: [], // 1 column
      xs: []  // 1 column
    };

    enabledModules.forEach((module, index) => {
      const gridSize = getModuleGridSize(module.size);
      
      // Large screens (4 columns)
      newLayouts.lg.push({
        i: module.id,
        x: (index * gridSize.w) % 4,
        y: Math.floor((index * gridSize.w) / 4) * gridSize.h,
        w: gridSize.w,
        h: gridSize.h,
      });

      // Medium screens (2 columns)
      newLayouts.md.push({
        i: module.id,
        x: (index * Math.min(gridSize.w, 2)) % 2,
        y: Math.floor((index * Math.min(gridSize.w, 2)) / 2) * gridSize.h,
        w: Math.min(gridSize.w, 2),
        h: gridSize.h,
      });

      // Small screens (1 column)
      newLayouts.sm.push({
        i: module.id,
        x: 0,
        y: index * gridSize.h,
        w: 1,
        h: gridSize.h,
      });

      // Extra small screens (1 column)
      newLayouts.xs.push({
        i: module.id,
        x: 0,
        y: index * gridSize.h,
        w: 1,
        h: gridSize.h,
      });
    });

    setLayouts(newLayouts);
  }, []);

  const handleLayoutChange = useCallback((layout: Layout[], allLayouts: Layouts) => {
    setLayouts(allLayouts);
    toast({
      title: 'Layout gespeichert',
      description: 'Die Anordnung der Module wurde aktualisiert',
    });
  }, [toast]);

  const toggleModule = useCallback((id: string) => {
    setModules(prev => {
      const updated = prev.map(module => 
        module.id === id ? { ...module, enabled: !module.enabled } : module
      );
      
      // Regenerate layouts when modules change
      setTimeout(() => generateDefaultLayouts(updated), 0);
      
      const module = prev.find(m => m.id === id);
      if (module) {
        toast({
          title: module.enabled ? `${module.title} deaktiviert` : `${module.title} aktiviert`,
          description: module.enabled 
            ? `Das Modul wurde ausgeblendet` 
            : `Das Modul wurde zum Dashboard hinzugefügt`,
        });
      }
      
      return updated;
    });
  }, [generateDefaultLayouts, toast]);

  const compactLayout = useCallback(() => {
    // Trigger re-generation of layouts to compact them
    generateDefaultLayouts(modules);
    toast({
      title: 'Layout komprimiert',
      description: 'Alle Module wurden optimal angeordnet',
    });
  }, [modules, generateDefaultLayouts, toast]);

  const resetLayout = useCallback(() => {
    setModules(initialModules);
    generateDefaultLayouts(initialModules);
    toast({
      title: 'Layout zurückgesetzt',
      description: 'Das Dashboard wurde auf die Standardeinstellungen zurückgesetzt',
    });
  }, [initialModules, generateDefaultLayouts, toast]);

  const updateSetting = useCallback((setting: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  }, []);

  const saveSettings = useCallback(() => {
    toast({
      title: 'Einstellungen gespeichert',
      description: 'Deine Dashboard-Einstellungen wurden aktualisiert',
    });
  }, [toast]);

  return {
    modules,
    layouts,
    settings,
    toggleModule,
    handleLayoutChange,
    compactLayout,
    resetLayout,
    updateSetting,
    saveSettings
  };
};
