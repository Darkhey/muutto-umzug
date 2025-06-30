
import * as React from 'react';
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

const isValidPartialModule = (obj: any): obj is Partial<DashboardModule> => {
  return typeof obj === 'object' && obj !== null &&
    (typeof obj.id === 'string' || obj.id === undefined);
};

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
        const parsed = JSON.parse(savedModules);
        if (Array.isArray(parsed) && parsed.every(isValidPartialModule)) {
          const restoredModules = parsed
            .map((saved) => {
              const initial = initialModules.find(m => m.id === saved.id);
              return initial ? { ...initial, ...saved } : null;
            })
            .filter((m): m is DashboardModule => m !== null);
          if (restoredModules.length > 0) {
            setModules(restoredModules);
          } else {
            setModules(initialModules);
          }
        } else {
          console.error('Invalid saved modules structure');
          setModules(initialModules);
        }
      } catch (error) {
        console.error('Error parsing saved modules:', error);
        setModules(initialModules);
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
      const serializableModules = modules.map((m) => ({
        id: m.id,
        title: m.title,
        enabled: m.enabled,
        category: m.category,
        description: m.description,
        size: m.size,
      }));
      localStorage.setItem('dashboard_modules_v2', JSON.stringify(serializableModules));
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

    // Prepare empty layouts and column height trackers for masonry like placement
    const newLayouts: Layouts = { lg: [], md: [], sm: [], xs: [] };
    const lgHeights = [0, 0, 0, 0];
    const mdHeights = [0, 0];
    let smHeight = 0;
    let xsHeight = 0;

    enabledModules.forEach(module => {
      const gridSize = getModuleGridSize(module.size);

      // ----- Large breakpoint (4 columns) -----
      let bestX = 0;
      let minHeight = Number.MAX_SAFE_INTEGER;
      for (let x = 0; x <= 4 - gridSize.w; x++) {
        const colHeight = Math.max(...lgHeights.slice(x, x + gridSize.w));
        if (colHeight < minHeight) {
          minHeight = colHeight;
          bestX = x;
        }
      }
      newLayouts.lg.push({
        i: module.id,
        x: bestX,
        y: minHeight,
        w: gridSize.w,
        h: gridSize.h,
      });
      for (let i = bestX; i < bestX + gridSize.w; i++) {
        lgHeights[i] = minHeight + gridSize.h;
      }

      // ----- Medium breakpoint (2 columns) -----
      const mdWidth = Math.min(gridSize.w, 2);
      let mdBestX = 0;
      let mdMinHeight = Number.MAX_SAFE_INTEGER;
      for (let x = 0; x <= 2 - mdWidth; x++) {
        const colHeight = Math.max(...mdHeights.slice(x, x + mdWidth));
        if (colHeight < mdMinHeight) {
          mdMinHeight = colHeight;
          mdBestX = x;
        }
      }
      newLayouts.md.push({
        i: module.id,
        x: mdBestX,
        y: mdMinHeight,
        w: mdWidth,
        h: gridSize.h,
      });
      for (let i = mdBestX; i < mdBestX + mdWidth; i++) {
        mdHeights[i] = mdMinHeight + gridSize.h;
      }

      // ----- Small breakpoint (1 column) -----
      newLayouts.sm.push({
        i: module.id,
        x: 0,
        y: smHeight,
        w: 1,
        h: gridSize.h,
      });
      smHeight += gridSize.h;

      // ----- Extra small breakpoint (1 column) -----
      newLayouts.xs.push({
        i: module.id,
        x: 0,
        y: xsHeight,
        w: 1,
        h: gridSize.h,
      });
      xsHeight += gridSize.h;
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
