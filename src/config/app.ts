
export const APP_CONFIG = {
  name: 'muutto',
  tagline: 'Dein smarter Umzugsbegleiter',
  version: '1.0.0',
  
  // Colors & Themes
  colors: {
    primary: 'blue',
    secondary: 'indigo',
    success: 'green',
    warning: 'yellow',
    danger: 'red'
  },

  // Module Configuration
  modules: {
    haushalte: { enabled: true, icon: '🏠', color: 'blue' },
    checklisten: { enabled: true, icon: '📋', color: 'green' },
    rechtliches: { enabled: true, icon: '⚖️', color: 'yellow' },
    vertraege: { enabled: true, icon: '💳', color: 'red' },
    langzeit: { enabled: true, icon: '🔄', color: 'purple' },
    inventar: { enabled: true, icon: '📦', color: 'orange' },
    ki_assistent: { enabled: true, icon: '🤖', color: 'indigo' }
  },

  // Default Settings
  defaults: {
    householdSize: 1,
    childrenCount: 0,
    petsCount: 0,
    reminderDaysBefore: [30, 14, 7, 3, 1],
    maxMembersPerHousehold: 10
  },

  // Progress Calculation
  progress: {
    daysForFullProgress: 90, // 90 Tage bis Umzug = 0% Progress
    completionWeight: 0.7,   // 70% basiert auf erledigten Aufgaben
    timeWeight: 0.3          // 30% basiert auf verbleibender Zeit
  },

  // Feature Flags
  features: {
    guestAccess: true,
    socialLogin: true,
    bankApiIntegration: false,
    qrCodeGeneration: true,
    pushNotifications: true,
    offlineMode: false
  }
};

export const PROPERTY_TYPES = [
  { key: 'miete', label: 'Mietwohnung', icon: '🏠' },
  { key: 'eigentum', label: 'Eigentum', icon: '🏡' }
] as const;

export const TIPS_OF_THE_DAY = [
  "Beginne mit der Kündigung deines alten Mietvertrags mindestens 3 Monate vor dem geplanten Auszug.",
  "Sammle alle wichtigen Dokumente in einem Ordner: Mietvertrag, Personalausweis, Versicherungen.",
  "Plane den Umzugstag wie ein Event: Helfer organisieren, Verpflegung, Zeitplan erstellen.",
  "Fotografiere wertvolle Gegenstände vor dem Verpacken für die Versicherung.",
  "Nutze alte Kleidung und Handtücher als Polstermaterial - spart Geld und Platz!",
  "Markiere Kartons mit Zimmern UND Priorität: 'Sofort', 'Erste Woche', 'Später'.",
  "Informiere deine Bank, Versicherung und deinen Arbeitgeber mindestens 4 Wochen vorher.",
];

export const getRandomTip = () => {
  return TIPS_OF_THE_DAY[Math.floor(Math.random() * TIPS_OF_THE_DAY.length)];
};
