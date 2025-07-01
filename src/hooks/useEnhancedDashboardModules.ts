
import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Layout, Layouts } from 'react-grid-layout';
import { useToast } from '@/hooks/use-toast';
import { validateLayout, repairLayout, optimizeSpacing } from '@/utils/layoutValidator';

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

// Enhanced module grid sizes with better constraints
const getModuleGridSize = (size: 'small' | 'medium' | 'large') => {
  switch (size) {
    case 'small': return { w: 1, h: 2 };
    case 'medium': return { w: 1, h: 3 };
    case 'large': return { w: 2, h: 4 };
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
    autoRepair: true, // New setting for automatic layout repair
  });

  // Load saved data from localStorage
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
        // Validate layouts before setting
        const validatedLayouts = validateAndRepairLayouts(parsedLayouts);
        setLayouts(validatedLayouts);
      } catch (error) {
        console.error('Error parsing saved layouts:', error);
      }
    }
    
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings({ ...settings, ...parsedSettings });
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

  // Save data to localStorage
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

  useEffect(() => {
    localStorage.setItem('dashboard_layouts_v2', JSON.stringify(layouts));
  }, [layouts]);

  useEffect(() => {
    localStorage.setItem('dashboard_settings_v2', JSON.stringify(settings));
  }, [settings]);

  // Validate and repair layouts utility
  const validateAndRepairLayouts = useCallback((layouts: Layouts): Layouts => {
    const repairedLayouts: Layouts = {};
    const breakpoints = ['lg', 'md', 'sm', 'xs'] as const;
    
    breakpoints.forEach(bp => {
      const layout = layouts[bp] || [];
      const validation = validateLayout(layout, bp);
      
      if (!validation.isValid && settings.autoRepair) {
        repairedLayouts[bp] = repairLayout(layout, bp);
        console.log(`Auto-repaired layout for ${bp}: fixed ${validation.overlaps.length} overlaps and ${validation.outOfBounds.length} out-of-bounds items`);
      } else {
        repairedLayouts[bp] = layout;
      }
    });
    
    return repairedLayouts;
  }, [settings.autoRepair]);

  // Enhanced layout generation with collision prevention
  const generateDefaultLayouts = useCallback((modulesToLayout: DashboardModule[]) => {
    const enabledModules = modulesToLayout.filter(m => m.enabled);
    const newLayouts: Layouts = { lg: [], md: [], sm: [], xs: [] };

    const breakpointConfigs = [
      { breakpoint: 'lg', cols: 4, key: 'lg' },
      { breakpoint: 'md', cols: 2, key: 'md' },
      { breakpoint: 'sm', cols: 1, key: 'sm' },
      { breakpoint: 'xs', cols: 1, key: 'xs' }
    ];

    breakpointConfigs.forEach(({ breakpoint, cols, key }) => {
      const layoutItems: Layout[] = [];
      const occupiedCells = new Map<string, boolean>();

      // Sort modules by priority (primary first, then by size)
      const sortedModules = [...enabledModules].sort((a, b) => {
        const priorityOrder = { primary: 0, secondary: 1, utility: 2 };
        const aPriority = priorityOrder[a.category];
        const bPriority = priorityOrder[b.category];
        
        if (aPriority !== bPriority) return aPriority - bPriority;
        
        const sizeOrder = { large: 0, medium: 1, small: 2 };
        return sizeOrder[a.size] - sizeOrder[b.size];
      });

      sortedModules.forEach(module => {
        const gridSize = getModuleGridSize(module.size);
        let width = Math.min(gridSize.w, cols);
        let height = gridSize.h;

        // For single column layouts, ensure full width
        if (cols === 1) {
          width = 1;
        }

        // Find optimal position using enhanced algorithm
        let bestX = 0;
        let bestY = 0;
        let found = false;

        for (let y = 0; y < 50 && !found; y++) {
          for (let x = 0; x <= cols - width && !found; x++) {
            let canPlace = true;
            
            // Check if this position is free
            for (let dy = 0; dy < height && canPlace; dy++) {
              for (let dx = 0; dx < width && canPlace; dx++) {
                const cellKey = `${x + dx},${y + dy}`;
                if (occupiedCells.has(cellKey)) {
                  canPlace = false;
                }
              }
            }

            if (canPlace) {
              bestX = x;
              bestY = y;
              found = true;

              // Mark cells as occupied
              for (let dy = 0; dy < height; dy++) {
                for (let dx = 0; dx < width; dx++) {
                  const cellKey = `${x + dx},${y + dy}`;
                  occupiedCells.set(cellKey, true);
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

    // Validate and repair generated layouts
    const validatedLayouts = validateAndRepairLayouts(newLayouts);
    setLayouts(validatedLayouts);
  }, [validateAndRepairLayouts]);

  // Enhanced layout change handler with validation
  const handleLayoutChange = useCallback((layout: Layout[], allLayouts: Layouts) => {
    // Validate layouts before setting
    const validatedLayouts = validateAndRepairLayouts(allLayouts);
    
    setLayouts(validatedLayouts);
    
    // Show toast if repairs were made
    const hasChanges = Object.keys(allLayouts).some(bp => {
      const original = allLayouts[bp as keyof Layouts] || [];
      const repaired = validatedLayouts[bp as keyof Layouts] || [];
      return JSON.stringify(original) !== JSON.stringify(repaired);
    });
    
    if (hasChanges) {
      toast({
        title: 'Layout optimiert',
        description: 'Überlappungen und ungültige Positionen wurden automatisch korrigiert',
      });
    }
  }, [validateAndRepairLayouts, toast]);

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

  // New repair function
  const repairLayouts = useCallback((repairedLayouts: Layouts) => {
    setLayouts(repairedLayouts);
    toast({
      title: 'Layout repariert',
      description: 'Alle Überlappungen und Positionsfehler wurden behoben',
    });
  }, [toast]);

  // New optimize function
  const optimizeLayouts = useCallback((optimizedLayouts: Layouts) => {
    setLayouts(optimizedLayouts);
    toast({
      title: 'Layout optimiert',
      description: 'Spacing und Anordnung wurden verbessert',
    });
  }, [toast]);

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
    repairLayouts,
    optimizeLayouts,
    updateSetting,
    saveSettings
  };
};
