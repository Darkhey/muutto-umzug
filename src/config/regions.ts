
export interface RegionConfig {
  postalCode: string;
  city: string;
  state: string;
  registrationOffice: {
    name: string;
    address: string;
    phone: string;
    hours: string;
    online: boolean;
  };
  specialRules: string[];
  deadlines: {
    registration: number; // Tage nach Einzug
    deregistration: number; // Tage vor Auszug
    vehicle: number; // Tage für Kfz-Ummeldung
  };
}

// Beispiel-Konfiguration für verschiedene Regionen
export const REGION_CONFIGS: Record<string, RegionConfig> = {
  '10': { // Berlin (Postleitzahlen beginnen mit 10)
    postalCode: '10xxx',
    city: 'Berlin',
    state: 'Berlin',
    registrationOffice: {
      name: 'Bürgeramt Berlin',
      address: 'Verschiedene Standorte',
      phone: '030 115',
      hours: 'Mo-Fr 8:00-18:00',
      online: true
    },
    specialRules: [
      'Online-Anmeldung möglich',
      'Termin erforderlich',
      'Wohnungsgeberbestätigung notwendig'
    ],
    deadlines: {
      registration: 14,
      deregistration: 7,
      vehicle: 14
    }
  },
  '80': { // München
    postalCode: '80xxx',
    city: 'München',
    state: 'Bayern',
    registrationOffice: {
      name: 'Kreisverwaltungsreferat München',
      address: 'Ruppertstraße 19, 80337 München',
      phone: '089 233-0',
      hours: 'Mo-Fr 7:30-12:00, Do bis 18:00',
      online: false
    },
    specialRules: [
      'Persönliche Anwesenheit erforderlich',
      'Alle Haushaltsmitglieder müssen anwesend sein',
      'Bei Kindern: Geburtsurkunde mitbringen'
    ],
    deadlines: {
      registration: 14,
      deregistration: 14,
      vehicle: 14
    }
  },
  '20': { // Hamburg
    postalCode: '20xxx',
    city: 'Hamburg',
    state: 'Hamburg',
    registrationOffice: {
      name: 'Kundenzentrum Hamburg',
      address: 'Verschiedene Standorte',
      phone: '040 115',
      hours: 'Mo-Fr 7:00-19:00, Sa 10:00-14:00',
      online: true
    },
    specialRules: [
      'Samstags geöffnet',
      'Online-Services verfügbar',
      'Express-Service gegen Aufpreis'
    ],
    deadlines: {
      registration: 14,
      deregistration: 7,
      vehicle: 14
    }
  }
};

export const getRegionConfig = (postalCode: string): RegionConfig | null => {
  if (!postalCode || postalCode.length < 2) return null;
  
  const prefix = postalCode.substring(0, 2);
  return REGION_CONFIGS[prefix] || null;
};

export const getRegistrationDeadline = (postalCode: string, moveDate: string): Date | null => {
  const config = getRegionConfig(postalCode);
  if (!config) return null;
  
  const moveDateObj = new Date(moveDate);
  const deadline = new Date(moveDateObj);
  deadline.setDate(deadline.getDate() + config.deadlines.registration);
  
  return deadline;
};
