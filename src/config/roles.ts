
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
    description: 'Verantwortlich für alle Verträge und Ummeldungen.',
    color: 'bg-blue-100 text-blue-800',
    responsibilities: [
      'Mietvertrag kündigen',
      'Strom, Gas, Wasser ummelden',
      'Internet- und Telefonverträge anpassen',
      'Versicherungen überprüfen und anpassen',
      'Kündigungsfristen überwachen'
    ]
  },
  {
    key: 'packbeauftragte',
    name: 'Packbeauftragte',
    icon: '📦',
    description: 'Organisiert das Packen und die Inventarisierung des Umzugsguts.',
    color: 'bg-green-100 text-green-800',
    responsibilities: [
      'Kartons und Packmaterial besorgen',
      'Inventarliste erstellen',
      'Packstrategie festlegen (Raum für Raum)',
      'Umzugsgut beschriften und kategorisieren',
      'Notfall-Karton packen'
    ]
  },
  {
    key: 'finanzperson',
    name: 'Finanzperson',
    icon: '💰',
    description: 'Verwaltet das Umzugsbudget und alle finanziellen Angelegenheiten.',
    color: 'bg-yellow-100 text-yellow-800',
    responsibilities: [
      'Umzugsbudget planen und überwachen',
      'Angebote für Umzugsunternehmen einholen und vergleichen',
      'Rechnungen und Belege sammeln',
      'Kautionen und Rückzahlungen im Blick behalten',
      'Kosten für Renovierungen kalkulieren'
    ]
  },
  {
    key: 'renovierer',
    name: 'Renovierer',
    icon: '🧽',
    description: 'Kümmert sich um Renovierungsarbeiten und die Übergabe der alten Wohnung.',
    color: 'bg-purple-100 text-purple-800',
    responsibilities: [
      'Schönheitsreparaturen planen und durchführen',
      'Handwerker koordinieren',
      'Wohnungsübergabe vorbereiten (alte und neue Wohnung)',
      'Reinigung der alten Wohnung organisieren',
      'Mängelprotokoll erstellen'
    ]
  },
  {
    key: 'haustierverantwortliche',
    name: 'Haustierverantwortliche',
    icon: '🐾',
    description: 'Sorgt für das Wohl der Haustiere während des Umzugs.',
    color: 'bg-pink-100 text-pink-800',
    responsibilities: [
      'Tierarztbesuch vor dem Umzug',
      'Transport der Haustiere planen',
      'Ruhigen Ort für Haustiere am Umzugstag schaffen',
      'Ummeldung bei Behörden (Hundesteuer etc.)',
      'Neue Tierärzte und Tierpensionen recherchieren'
    ]
  },
  {
    key: 'logistik_transport',
    name: 'Logistik & Transport',
    icon: '🚚',
    description: 'Koordiniert den Transport und die Logistik am Umzugstag.',
    color: 'bg-orange-100 text-orange-800',
    responsibilities: [
      'Umzugsfahrzeug organisieren (Miete, Größe)',
      'Parkgenehmigungen beantragen',
      'Helfer koordinieren und einweisen',
      'Transportwege planen',
      'Werkzeug und Hilfsmittel bereitstellen'
    ]
  },
  {
    key: 'kinderbetreuung',
    name: 'Kinderbetreuung',
    icon: '👶',
    description: 'Plant und organisiert die Betreuung der Kinder während des Umzugs.',
    color: 'bg-cyan-100 text-cyan-800',
    responsibilities: [
      'Kinder auf den Umzug vorbereiten',
      'Betreuung am Umzugstag organisieren',
      'Neue Schule/Kindergarten recherchieren und anmelden',
      'Spielzeug und wichtige Gegenstände separat packen',
      'Rückzugsort für Kinder in der neuen Wohnung schaffen'
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
