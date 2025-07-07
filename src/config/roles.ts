
import { HouseholdRole } from '@/types/household';
import { Users, Package, DollarSign, Wrench, Heart } from 'lucide-react';

export interface RoleConfig {
  key: HouseholdRole;
  name: string;
  description: string;
  icon: typeof Users;
  color: string;
  responsibilities: string[];
}

export const HOUSEHOLD_ROLES: RoleConfig[] = [
  {
    key: 'vertragsmanager',
    name: 'Vertragsmanager',
    description: 'Verwaltet alle Verträge und Kündigungen',
    icon: Users,
    color: 'blue',
    responsibilities: [
      'Verträge kündigen und ummelden',
      'Neue Verträge abschließen',
      'Fristen überwachen',
      'Dokumente verwalten'
    ]
  },
  {
    key: 'packbeauftragte',
    name: 'Packbeauftragte/r',
    description: 'Organisiert das Packen und den Transport',
    icon: Package,
    color: 'green',
    responsibilities: [
      'Kartons organisieren',
      'Packlisten erstellen',
      'Umzugshelfer koordinieren',
      'Transport planen'
    ]
  },
  {
    key: 'finanzperson',
    name: 'Finanzperson',
    description: 'Überwacht Budget und Kosten',
    icon: DollarSign,
    color: 'yellow',
    responsibilities: [
      'Budget planen',
      'Kosten überwachen',
      'Rechnungen verwalten',
      'Kostenvoranschläge einholen'
    ]
  },
  {
    key: 'renovierer',
    name: 'Renovierer/in',
    description: 'Kümmert sich um Renovierung und Reparaturen',
    icon: Wrench,
    color: 'purple',
    responsibilities: [
      'Renovierungsarbeiten planen',
      'Handwerker koordinieren',
      'Materialien organisieren',
      'Reparaturen durchführen'
    ]
  },
  {
    key: 'haustierverantwortliche',
    name: 'Haustierverantwortliche/r',
    description: 'Organisiert den Umzug für Haustiere',
    icon: Heart,
    color: 'pink',
    responsibilities: [
      'Tierarzt koordinieren',
      'Transport organisieren',
      'Neue Umgebung vorbereiten',
      'Stress minimieren'
    ]
  }
];

export function getRoleByKey(key: HouseholdRole): RoleConfig | undefined {
  return HOUSEHOLD_ROLES.find(role => role.key === key);
}

export function getRoleColor(key: HouseholdRole): string {
  return getRoleByKey(key)?.color || 'gray';
}

export function getRoleName(key: HouseholdRole): string {
  return getRoleByKey(key)?.name || key;
}

export const getRoleIcon = (role: string): string => {
  const roleConfig = HOUSEHOLD_ROLES.find(r => r.key === role);
  return roleConfig?.icon ? '👤' : '👤'; // Fallback icon
};
