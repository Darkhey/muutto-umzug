
export interface RoleConfig {
  key: 'vertragsmanager' | 'packbeauftragte' | 'finanzperson' | 'renovierer' | 'haustierverantwortliche';
  name: string;
  icon: string;
  description: string;
  color: string;
  responsibilities: string[];
}

export const HOUSEHOLD_ROLES: RoleConfig[] = [
  {
    key: 'vertragsmanager',
    name: 'Vertragsmanager',
    icon: '🧠',
    description: 'Verträge kündigen und verwalten',
    color: 'bg-blue-100 text-blue-800',
    responsibilities: [
      'Mietvertrag kündigen',
      'Verträge ummelden',
      'Neue Verträge abschließen',
      'Kündigungsfristen überwachen'
    ]
  },
  {
    key: 'packbeauftragte',
    name: 'Packbeauftragte',
    icon: '📦',
    description: 'Kartons und Inventar organisieren',
    color: 'bg-green-100 text-green-800',
    responsibilities: [
      'Kartons besorgen',
      'Inventar erstellen',
      'Packen organisieren',
      'Umzugsgut beschriften'
    ]
  },
  {
    key: 'finanzperson',
    name: 'Finanzperson',
    icon: '💰',
    description: 'Budget und Kosten verwalten',
    color: 'bg-yellow-100 text-yellow-800',
    responsibilities: [
      'Umzugsbudget planen',
      'Rechnungen verwalten',
      'Kostenschätzungen einholen',
      'Kautionen organisieren'
    ]
  },
  {
    key: 'renovierer',
    name: 'Renovierer',
    icon: '🧽',
    description: 'Renovierung und Instandsetzung',
    color: 'bg-purple-100 text-purple-800',
    responsibilities: [
      'Schönheitsreparaturen',
      'Renovierungsarbeiten',
      'Handwerker koordinieren',
      'Materialien besorgen'
    ]
  },
  {
    key: 'haustierverantwortliche',
    name: 'Haustierverantwortliche',
    icon: '🐾',
    description: 'Haustiere beim Umzug betreuen',
    color: 'bg-pink-100 text-pink-800',
    responsibilities: [
      'Haustiere ummelden',
      'Tierarzt wechseln',
      'Hundesteuer ummelden',
      'Transport organisieren'
    ]
  }
];

export const getRoleByKey = (key: string) => {
  return HOUSEHOLD_ROLES.find(role => role.key === key);
};

export const getRoleIcon = (roleKey: string) => {
  const role = getRoleByKey(roleKey);
  return role?.icon || '👤';
};

export const getRoleColor = (roleKey: string) => {
  const role = getRoleByKey(roleKey);
  return role?.color || 'bg-gray-100 text-gray-800';
};
