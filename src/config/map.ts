export type Category = 'kita' | 'arzt' | 'supermarkt' | 'verwaltung'

export interface CategoryConfig {
  key: Category
  label: string
  query: string
  color: string
}

export const CATEGORY_CONFIG: CategoryConfig[] = [
  { key: 'kita', label: 'Kitas', query: 'amenity=kindergarten', color: 'blue' },
  { key: 'arzt', label: 'Ärzte', query: 'amenity=doctors', color: 'green' },
  { key: 'supermarkt', label: 'Supermärkte', query: 'shop=supermarket', color: 'orange' },
  { key: 'verwaltung', label: 'Stadtverwaltung', query: 'amenity=townhall', color: 'purple' }
]

export interface RadiusOption {
  key: 'foot' | 'bike' | 'car'
  label: string
  radius: number // in meters
}

export const RADIUS_OPTIONS: RadiusOption[] = [
  { key: 'foot', label: 'Fußläufig erreichbar', radius: 1000 },
  { key: 'bike', label: 'Mit dem Fahrrad', radius: 3000 },
  { key: 'car', label: 'Mit dem Auto', radius: 10000 }
]
