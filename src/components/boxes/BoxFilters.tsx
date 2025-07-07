import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Filter, 
  SortAsc, 
  SortDesc,
  X
} from 'lucide-react';
import { BoxFilters as BoxFiltersType, BoxSort, BoxStatus, BoxCategory } from '@/types/box';

interface BoxFiltersProps {
  filters: BoxFiltersType;
  onFiltersChange: (filters: BoxFiltersType) => void;
  sort: BoxSort;
  onSortChange: (sort: BoxSort) => void;
}

const statusOptions: { value: BoxStatus; label: string; color: string }[] = [
  { value: 'leer', label: 'Leer', color: 'bg-gray-100 text-gray-800' },
  { value: 'gepackt', label: 'Gepackt', color: 'bg-blue-100 text-blue-800' },
  { value: 'versiegelt', label: 'Versiegelt', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'transportiert', label: 'Transportiert', color: 'bg-purple-100 text-purple-800' },
  { value: 'ausgepackt', label: 'Ausgepackt', color: 'bg-green-100 text-green-800' }
];

const categoryOptions: { value: BoxCategory; label: string; icon: string }[] = [
  { value: 'küche', label: 'Küche', icon: '🍳' },
  { value: 'wohnzimmer', label: 'Wohnzimmer', icon: '🛋️' },
  { value: 'schlafzimmer', label: 'Schlafzimmer', icon: '🛏️' },
  { value: 'bad', label: 'Bad', icon: '🚿' },
  { value: 'keller', label: 'Keller', icon: '🏠' },
  { value: 'dachboden', label: 'Dachboden', icon: '🏠' },
  { value: 'büro', label: 'Büro', icon: '💼' },
  { value: 'kinderzimmer', label: 'Kinderzimmer', icon: '🧸' },
  { value: 'garten', label: 'Garten', icon: '🌱' },
  { value: 'sonstiges', label: 'Sonstiges', icon: '📦' }
];

const sortOptions = [
  { value: 'box_number', label: 'Kartonsnummer' },
  { value: 'name', label: 'Name' },
  { value: 'created_at', label: 'Erstellt am' },
  { value: 'updated_at', label: 'Aktualisiert am' },
  { value: 'status', label: 'Status' },
  { value: 'category', label: 'Kategorie' }
];

type SortField = 'box_number' | 'name' | 'created_at' | 'updated_at' | 'status' | 'category';

export function BoxFilters({ filters, onFiltersChange, sort, onSortChange }: BoxFiltersProps) {
  const handleStatusChange = (status: BoxStatus, checked: boolean) => {
    const currentStatuses = filters.status || [];
    const newStatuses = checked
      ? [...currentStatuses, status]
      : currentStatuses.filter(s => s !== status);
    
    onFiltersChange({
      ...filters,
      status: newStatuses.length > 0 ? newStatuses : undefined
    });
  };

  const handleCategoryChange = (category: BoxCategory, checked: boolean) => {
    const currentCategories = filters.category || [];
    const newCategories = checked
      ? [...currentCategories, category]
      : currentCategories.filter(c => c !== category);
    
    onFiltersChange({
      ...filters,
      category: newCategories.length > 0 ? newCategories : undefined
    });
  };

  const handleRoomChange = (room: string, checked: boolean) => {
    const currentRooms = filters.room || [];
    const newRooms = checked
      ? [...currentRooms, room]
      : currentRooms.filter(r => r !== room);
    
    onFiltersChange({
      ...filters,
      room: newRooms.length > 0 ? newRooms : undefined
    });
  };

  const handleBooleanFilterChange = (key: keyof BoxFiltersType, value: boolean | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = () => {
    return !!(
      filters.status?.length ||
      filters.category?.length ||
      filters.room?.length ||
      filters.has_photos !== undefined ||
      filters.has_comments !== undefined ||
      filters.is_fragile !== undefined ||
      filters.search_term
    );
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.status?.length) count += filters.status.length;
    if (filters.category?.length) count += filters.category.length;
    if (filters.room?.length) count += filters.room.length;
    if (filters.has_photos !== undefined) count++;
    if (filters.has_comments !== undefined) count++;
    if (filters.is_fragile !== undefined) count++;
    if (filters.search_term) count++;
    return count;
  };

  return (
    <div className="space-y-6">
      {/* Aktive Filter */}
      {hasActiveFilters() && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Aktive Filter ({getActiveFilterCount()})</CardTitle>
              <Button variant="outline" size="sm" onClick={clearAllFilters}>
                <X className="h-4 w-4 mr-2" />
                Alle löschen
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {filters.status?.map(status => (
                <Badge key={status} variant="secondary" className="flex items-center gap-1">
                  Status: {statusOptions.find(s => s.value === status)?.label}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleStatusChange(status, false)}
                  />
                </Badge>
              ))}
              {filters.category?.map(category => (
                <Badge key={category} variant="secondary" className="flex items-center gap-1">
                  {categoryOptions.find(c => c.value === category)?.icon}
                  {categoryOptions.find(c => c.value === category)?.label}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleCategoryChange(category, false)}
                  />
                </Badge>
              ))}
              {filters.room?.map(room => (
                <Badge key={room} variant="secondary" className="flex items-center gap-1">
                  Raum: {room}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleRoomChange(room, false)}
                  />
                </Badge>
              ))}
              {filters.has_photos !== undefined && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {filters.has_photos ? 'Mit Fotos' : 'Ohne Fotos'}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleBooleanFilterChange('has_photos', undefined)}
                  />
                </Badge>
              )}
              {filters.has_comments !== undefined && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {filters.has_comments ? 'Mit Kommentaren' : 'Ohne Kommentare'}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleBooleanFilterChange('has_comments', undefined)}
                  />
                </Badge>
              )}
              {filters.is_fragile !== undefined && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {filters.is_fragile ? 'Zerbrechlich' : 'Nicht zerbrechlich'}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleBooleanFilterChange('is_fragile', undefined)}
                  />
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter-Optionen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statusOptions.map((status) => (
                <div key={status.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${status.value}`}
                    checked={filters.status?.includes(status.value) || false}
                    onCheckedChange={(checked) => handleStatusChange(status.value, checked as boolean)}
                  />
                  <Label htmlFor={`status-${status.value}`} className="flex items-center gap-2">
                    <Badge className={status.color} variant="outline">
                      {status.label}
                    </Badge>
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Kategorie Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Kategorie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categoryOptions.map((category) => (
                <div key={category.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.value}`}
                    checked={filters.category?.includes(category.value) || false}
                    onCheckedChange={(checked) => handleCategoryChange(category.value, checked as boolean)}
                  />
                  <Label htmlFor={`category-${category.value}`} className="flex items-center gap-2">
                    <span>{category.icon}</span>
                    <span>{category.label}</span>
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Zusätzliche Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Zusätzliche Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has-photos"
                  checked={filters.has_photos || false}
                  onCheckedChange={(checked) => handleBooleanFilterChange('has_photos', checked as boolean)}
                />
                <Label htmlFor="has-photos">Nur Kartons mit Fotos</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has-comments"
                  checked={filters.has_comments || false}
                  onCheckedChange={(checked) => handleBooleanFilterChange('has_comments', checked as boolean)}
                />
                <Label htmlFor="has-comments">Nur Kartons mit Kommentaren</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is-fragile"
                  checked={filters.is_fragile || false}
                  onCheckedChange={(checked) => handleBooleanFilterChange('is_fragile', checked as boolean)}
                />
                <Label htmlFor="is-fragile">Nur Kartons mit zerbrechlichen Gegenständen</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sortierung */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {sort.direction === 'asc' ? <SortAsc className="h-5 w-5" /> : <SortDesc className="h-5 w-5" />}
              Sortierung
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Sortieren nach</Label>
                <Select
                  value={sort.field}
                  onValueChange={(value: SortField) => onSortChange({ ...sort, field: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Richtung</Label>
                <div className="flex gap-2">
                  <Button
                    variant={sort.direction === 'asc' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onSortChange({ ...sort, direction: 'asc' })}
                  >
                    <SortAsc className="h-4 w-4 mr-2" />
                    Aufsteigend
                  </Button>
                  <Button
                    variant={sort.direction === 'desc' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onSortChange({ ...sort, direction: 'desc' })}
                  >
                    <SortDesc className="h-4 w-4 mr-2" />
                    Absteigend
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 