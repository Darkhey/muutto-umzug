
import { useState, useEffect, useCallback } from 'react';
import { DashboardModule } from '@/hooks/useEnhancedDashboardModules';
import { useToast } from '@/hooks/use-toast';

interface GridPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const useDashboardModules = (initialModules: DashboardModule[]) => {
  const { toast } = useToast();
  const [modules, setModules] = useState<DashboardModule[]>(initialModules);
  const [modulePositions, setModulePositions] = useState<Record<string, GridPosition>>({});
  const [settings, setSettings] = useState({
    compactLayout: false,
    autoSort: false,
    emailNotifications: true,
    pushNotifications: false,
    usageStats: true,
    aiPersonalization: true,
    magneticGrid: true,
  });

  // Load saved modules and positions from localStorage
  useEffect(() => {
    const savedModules = localStorage.getItem('dashboard_modules');
    const savedPositions = localStorage.getItem('dashboard_positions');
    const savedSettings = localStorage.getItem('dashboard_settings');
    
    if (savedModules) {
      try {
        const parsedModules = JSON.parse(savedModules);
        setModules(parsedModules);
      } catch (error) {
        console.error('Error parsing saved modules:', error);
      }
    }

    if (savedPositions) {
      try {
        const parsedPositions = JSON.parse(savedPositions);
        setModulePositions(parsedPositions);
      } catch (error) {
        console.error('Error parsing saved positions:', error);
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

  // Apply initial modules when they change (e.g., after async loading)
  useEffect(() => {
    if (initialModules.length && modules.length === 0) {
      setModules(initialModules);
      setModulePositions({});
    }
  }, [initialModules, modules.length]);

  // Save modules to localStorage when they change
  useEffect(() => {
    if (modules.length > 0) {
      localStorage.setItem('dashboard_modules', JSON.stringify(modules));
    }
  }, [modules]);

  // Save positions to localStorage when they change
  useEffect(() => {
    localStorage.setItem('dashboard_positions', JSON.stringify(modulePositions));
  }, [modulePositions]);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('dashboard_settings', JSON.stringify(settings));
  }, [settings]);

  // Magnetic grid calculation
  const calculateMagneticPosition = useCallback((moduleId: string, targetX: number, targetY: number) => {
    const GRID_SIZE = 4; // 4 columns
    const SNAP_THRESHOLD = 0.3; // 30% overlap required to snap

    // Convert screen coordinates to grid coordinates
    const gridX = Math.round(targetX);
    const gridY = Math.round(targetY);

    // Get module size
    const module = modules.find(m => m.id === moduleId);
    const moduleWidth = module?.size === 'large' ? 2 : 1;
    const moduleHeight = 1;

    // Find available position using magnetic snapping
    const bestX = Math.max(0, Math.min(gridX, GRID_SIZE - moduleWidth));
    const bestY = gridY;

    // Check for collisions and snap to available positions
    const occupiedPositions = Object.entries(modulePositions)
      .filter(([id]) => id !== moduleId)
      .map(([, pos]) => pos);

    // Find the topmost available position (magnetic effect)
    for (let y = 0; y <= bestY + 5; y++) {
      for (let x = 0; x <= GRID_SIZE - moduleWidth; x++) {
        const position = { x, y, width: moduleWidth, height: moduleHeight };
        
        // Check if this position conflicts with existing modules
        const hasCollision = occupiedPositions.some(occupied => 
          !(position.x + position.width <= occupied.x || 
            position.x >= occupied.x + occupied.width ||
            position.y + position.height <= occupied.y || 
            position.y >= occupied.y + occupied.height)
        );

        if (!hasCollision) {
          return position;
        }
      }
    }

    return { x: bestX, y: bestY, width: moduleWidth, height: moduleHeight };
  }, [modules, modulePositions]);

  const updateModulePosition = useCallback((moduleId: string, x: number, y: number) => {
    if (settings.magneticGrid) {
      const magneticPosition = calculateMagneticPosition(moduleId, x, y);
      setModulePositions(prev => ({
        ...prev,
        [moduleId]: magneticPosition
      }));
    } else {
      const module = modules.find(m => m.id === moduleId);
      const moduleWidth = module?.size === 'large' ? 2 : 1;
      setModulePositions(prev => ({
        ...prev,
        [moduleId]: { x, y, width: moduleWidth, height: 1 }
      }));
    }
  }, [settings.magneticGrid, calculateMagneticPosition, modules]);

  const toggleModule = (id: string) => {
    setModules(prev => {
      const updated = prev.map(module => 
        module.id === id ? { ...module, enabled: !module.enabled } : module
      );
      
      // If enabling a module, find a good position for it
      const module = updated.find(m => m.id === id);
      if (module?.enabled && !modulePositions[id]) {
        const position = calculateMagneticPosition(id, 0, 0);
        setModulePositions(prev => ({
          ...prev,
          [id]: position
        }));
      }
      
      return updated;
    });
    
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
    setModulePositions({});
    toast({
      title: 'Layout zurückgesetzt',
      description: 'Das Dashboard wurde auf die Standardeinstellungen zurückgesetzt',
    });
  };

  const compactLayout = useCallback(() => {
    const enabledModules = modules.filter(m => m.enabled);
    const newPositions: Record<string, GridPosition> = {};
    
    // Sort modules by current Y position, then X position
    const sortedModules = enabledModules.sort((a, b) => {
      const posA = modulePositions[a.id] || { x: 0, y: 0 };
      const posB = modulePositions[b.id] || { x: 0, y: 0 };
      return posA.y - posB.y || posA.x - posB.x;
    });

    // Place modules in a compact grid
    let currentY = 0;
    const GRID_SIZE = 4;
    
    for (const module of sortedModules) {
      const moduleWidth = module.size === 'large' ? 2 : 1;
      
      // Find the topmost available position
      let placed = false;
      for (let y = 0; y <= currentY + 2; y++) {
        for (let x = 0; x <= GRID_SIZE - moduleWidth; x++) {
          const position = { x, y, width: moduleWidth, height: 1 };
          
          // Check if this position conflicts with already placed modules
          const hasCollision = Object.values(newPositions).some(occupied => 
            !(position.x + position.width <= occupied.x || 
              position.x >= occupied.x + occupied.width ||
              position.y + position.height <= occupied.y || 
              position.y >= occupied.y + occupied.height)
          );

          if (!hasCollision) {
            newPositions[module.id] = position;
            currentY = Math.max(currentY, y);
            placed = true;
            break;
          }
        }
        if (placed) break;
      }
    }

    setModulePositions(newPositions);
    toast({
      title: 'Layout komprimiert',
      description: 'Alle Module wurden magnetisch nach oben ausgerichtet',
    });
  }, [modules, modulePositions, toast]);

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
    modulePositions,
    settings,
    toggleModule,
    updateModuleOrder,
    updateModulePosition,
    resetLayout,
    compactLayout,
    updateSetting,
    saveSettings
  };
};
