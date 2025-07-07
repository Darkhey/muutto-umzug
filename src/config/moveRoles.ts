import { ReactNode } from 'react'
import { Users, Briefcase, Handshake, Truck, CalendarCheck } from 'lucide-react'

export interface MoveRoleConfig {
  key: 'gesamtkoordination' | 'umzugslogistik' | 'vertragsabstimmung' | 'finanzuebersicht' | 'kommunikation';
  name: string;
  icon: React.ElementType;
  description: string;
  responsibilities: string[];
}

export const MOVE_ROLES: MoveRoleConfig[] = [
  {
    key: 'gesamtkoordination',
    name: 'Gesamtkoordination',
    icon: Users,
    description: 'Verantwortlich für die übergeordnete Planung und Koordination aller beteiligten Haushalte und Aufgaben.',
    responsibilities: [
      'Gesamtzeitplan erstellen und überwachen',
      'Kommunikation zwischen allen Haushalten sicherstellen',
      'Konflikte lösen und Entscheidungen treffen',
      'Fortschritt des gesamten Umzugs verfolgen',
      'Abschluss des Umzugs koordinieren'
    ]
  },
  {
    key: 'umzugslogistik',
    name: 'Umzugslogistik',
    icon: Truck,
    description: 'Organisiert den Transport, die Helfer und alle logistischen Aspekte des Umzugs.',
    responsibilities: [
      'Umzugsunternehmen/Transporter buchen',
      'Helfer rekrutieren und einweisen',
      'Parkgenehmigungen und Halteverbote organisieren',
      'Transportrouten planen',
      'Verpflegung für Helfer organisieren'
    ]
  },
  {
    key: 'vertragsabstimmung',
    name: 'Vertragsabstimmung',
    icon: Briefcase,
    description: 'Stimmt Verträge und Ummeldungen zwischen den Haushalten ab.',
    responsibilities: [
      'Doppelte Verträge identifizieren und klären',
      'Gemeinsame Verträge neu abschließen/ummeldungen',
      'Versicherungen anpassen',
      'Bankkonten und Adressen aktualisieren'
    ]
  },
  {
    key: 'finanzuebersicht',
    name: 'Finanzübersicht',
    icon: Handshake,
    description: 'Behält den Überblick über die gemeinsamen Finanzen des Umzugs.',
    responsibilities: [
      'Gemeinsames Umzugsbudget verwalten',
      'Kosten aufteilen und abrechnen',
      'Rechnungen für gemeinsame Ausgaben sammeln',
      'Kautionen und Rückzahlungen koordinieren'
    ]
  },
  {
    key: 'kommunikation',
    name: 'Kommunikation',
    icon: CalendarCheck,
    description: 'Verantwortlich für die externe Kommunikation und wichtige Termine.',
    responsibilities: [
      'Nachbarn informieren',
      'Postnachsendeauftrag einrichten',
      'Freunde und Familie über den Umzug informieren',
      'Wichtige Termine (Übergaben, Anmeldungen) koordinieren'
    ]
  }
];

export const getMoveRoleByKey = (key: string) => {
  return MOVE_ROLES.find(role => role.key === key);
};
