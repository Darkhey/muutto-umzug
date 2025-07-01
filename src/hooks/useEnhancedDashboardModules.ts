
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

// Optimized module grid sizes for better layout
const getModuleGridSize = (size: 'small' | 'medium' | 'large') => {
  switch (size) {
    case 'small': return { w: 1, h: 2 };
    case 'medium': return { w: 1, h: 3 };
    case 'large': return { w: 2, h: 4 }; // Increased height for large modules
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

  // Improved layout generation with better collision detection
  const generateDefaultLayouts = useCallback((modulesToLayout: DashboardModule[]) => {
    const enabledModules = modulesToLayout.filter(m => m.enabled);
    const newLayouts: Layouts = { lg: [], md: [], sm: [], xs: [] };

    // Generate layouts for each breakpoint
    const breakpointConfigs = [
      { breakpoint: 'lg', cols: 3, key: 'lg' },
      { breakpoint: 'md', cols: 2, key: 'md' },
      { breakpoint: 'sm', cols: 1, key: 'sm' },
      { breakpoint: 'xs', cols: 1, key: 'xs' }
    ];

    breakpointConfigs.forEach(({ breakpoint, cols, key }) => {
      const grid: boolean[][] = [];
      const layoutItems: Layout[] = [];

      enabledModules.forEach(module => {
        const gridSize = getModuleGridSize(module.size);
        let width = Math.min(gridSize.w, cols);
        let height = gridSize.h;

        // For single column layouts, ensure full width
        if (cols === 1) {
          width = 1;
        }

        // Find the best position for this module
        let bestX = 0;
        let bestY = 0;
        let found = false;

        // Try to find a position that doesn't overlap
        for (let y = 0; y < 50 && !found; y++) {
          for (let x = 0; x <= cols - width && !found; x++) {
            // Check if this position is free
            let canPlace = true;
            for (let dy = 0; dy < height && canPlace; dy++) {
              for (let dx = 0; dx < width && canPlace; dx++) {
                const gridY = y + dy;
                const gridX = x + dx;
                
                // Initialize grid row if needed
                if (!grid[gridY]) {
                  grid[gridY] = new Array(cols).fill(false);
                }
                
                if (grid[gridY][gridX]) {
                  canPlace = false;
                }
              }
            }

            if (canPlace) {
              bestX = x;
              bestY = y;
              found = true;

              // Mark grid cells as occupied
              for (let dy = 0; dy < height; dy++) {
                for (let dx = 0; dx < width; dx++) {
                  const gridY = y + dy;
                  const gridX = x + dx;
                  
                  if (!grid[gridY]) {
                    grid[gridY] = new Array(cols).fill(false);
                  }
                  grid[gridY][gridX] = true;
                }
              }
            }
          }
        }

        layoutItems.push({
          i: module.id,
          x: bestX,
          y: bestY,
          w: width,
          h: height,
        });
      });

      newLayouts[key as keyof Layouts] = layoutItems;
    });

    setLayouts(newLayouts);
  }, []);

  const handleLayoutChange = useCallback((layout: Layout[], allLayouts: Layouts) => {
    // Validate layouts before setting
    const validatedLayouts = { ...allLayouts };
    
    Object.keys(validatedLayouts).forEach(breakpoint => {
      const layoutArray = validatedLayouts[breakpoint as keyof Layouts];
      if (layoutArray) {
        // Remove any invalid layouts
        validatedLayouts[breakpoint as keyof Layouts] = layoutArray.filter(item => 
          item.w > 0 && item.h > 0 && item.x >= 0 && item.y >= 0
        );
      }
    });

    setLayouts(validatedLayouts);
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
      setTimeout(() => generateDefaultLayouts(updated), 100);
      
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
