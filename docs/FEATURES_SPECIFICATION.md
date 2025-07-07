
# muutto - Feature Spezifikationen

## 🏠 Modul 1: Haushaltsmanagement

### Kernfunktionen
- **Haushalt erstellen**: Name, Umzugsdatum, Größe, Eigenschaften
- **Mitgliederverwaltung**: Einladungen, Rollen, Berechtigungen
- **Rollensystem**: 5 vordefinierte Rollen mit spezifischen Verantwortlichkeiten

### Rollen im Detail
```typescript
// Aus src/config/roles.ts
1. Vertragsmanager (🧠)
   - Mietvertrag kündigen
   - Verträge ummelden
   - Kündigungsfristen überwachen

2. Packbeauftragte (📦)
   - Kartons besorgen
   - Inventar erstellen
   - Packen organisieren

3. Finanzperson (💰)
   - Umzugsbudget planen
   - Rechnungen verwalten
   - Kautionen organisieren

4. Renovierer (🧽)
   - Schönheitsreparaturen
   - Handwerker koordinieren
   - Materialien besorgen

5. Haustierverantwortliche (🐾)
   - Haustiere ummelden
   - Tierarzt wechseln
   - Transport organisieren
```

### Datenmodell Haushalte
```sql
-- Households Table
households {
  id: UUID (PK)
  name: TEXT
  move_date: DATE
  household_size: INTEGER
  children_count: INTEGER
  pets_count: INTEGER
  property_type: ENUM('miete', 'eigentum')
  postal_code: TEXT
  created_by: UUID (FK zu auth.users)
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
}

-- Household Members Table
household_members {
  id: UUID (PK)
  household_id: UUID (FK)
  user_id: UUID (FK zu auth.users, nullable)
  name: TEXT
  email: TEXT
  role: ENUM(household_roles)
  is_owner: BOOLEAN
  invited_at: TIMESTAMP
  joined_at: TIMESTAMP
  created_at: TIMESTAMP
}
```

### Sicherheitsmodell (RLS Policies)
- Nutzer sehen nur Haushalte, in denen sie Mitglied sind
- Nur Haushalts-Owner können Mitglieder verwalten
- Mitglieder können ihre eigenen Daten bearbeiten
- Automatische Trennung zwischen Haushalten

## 📋 Modul 2: Checklisten & Aufgaben (geplant)

### Phasen-basierte Organisation
```
Vor dem Umzug (8-12 Wochen vorher)
├── Verträge kündigen
├── Neue Wohnung organisieren
├── Ummeldungen vorbereiten
└── Umzugsfirma buchen

Umzugstag
├── Altwohnung übergeben
├── Transport koordinieren
├── Neuwohnung übernehmen
└── Erste Einrichtung

Nach dem Umzug (0-12 Monate)
├── Ummeldungen abschließen
├── Kaution zurückfordern
├── Nachbarn kennenlernen
└── Langfristige Anpassungen
```

### Aufgaben-Datenmodell (geplant)
```sql
tasks {
  id: UUID (PK)
  household_id: UUID (FK)
  title: TEXT
  description: TEXT
  phase: ENUM('vor_umzug', 'umzugstag', 'nach_umzug')
  assigned_to: UUID (FK zu household_members)
  due_date: DATE
  completed: BOOLEAN
  completed_at: TIMESTAMP
  priority: ENUM('niedrig', 'mittel', 'hoch', 'kritisch')
  category: TEXT
  created_at: TIMESTAMP
}
```

## 🤖 Modul 3: KI-Assistent (muuttoBot) - geplant

### Funktionen
- **Persönlicher Kontext**: Kennt Haushaltsdaten und Fortschritt
- **Wöchentliche Tipps**: Passend zur Umzugsphase
- **Rechtsinformationen**: Fristen, Gesetze, Bestimmungen
- **Aufgabenvorschläge**: Automatische Prioritätensetzung

### Technische Umsetzung
- Supabase Edge Function mit OpenAI Integration
- Kontext-Speicherung in der Datenbank
- Chat-Interface mit Verlauf
- Sprachein-/ausgabe (optional)

## 💳 Modul 4: Vertragsmanagement - geplant

### Banking API Integration
- **Optionale Verknüpfung**: FinAPI, Tink oder ähnliche
- **Automatische Erkennung**: Laufende Verträge aus Kontodaten
- **Kündigungsfristen**: Automatische Berechnung und Erinnerungen
- **Schreiben-Generator**: Vorlagen für Kündigungen und Ummeldungen

### Datenschutz & Sicherheit
- Ende-zu-Ende Verschlüsselung für Bankdaten
- Minimale Datenspeicherung
- DSGVO-konforme Verarbeitung
- Opt-in für Banking-Integration

## 📦 Modul 5: Inventar & Packing - geplant

### QR-Code System
- **Karton-Etiketten**: Automatisch generierte QR-Codes
- **Mobile App**: Scannen und Zuordnen
- **Raum-Mapping**: Digitale Grundrisse
- **Foto-Dokumentation**: Wertgegenstände für Versicherung

## 🔔 Benachrichtigungssystem

### Erinnerungstypen
```typescript
reminder_types = {
  deadline: "Frist läuft ab",
  task: "Aufgabe fällig",
  weekly_tip: "Wöchentlicher Tipp",
  milestone: "Meilenstein erreicht",
  invitation: "Neue Einladung"
}
```

### Kanäle
- **In-App**: Toast-Benachrichtigungen
- **E-Mail**: Zusammenfassungen und kritische Fristen
- **Push**: Mobile Benachrichtigungen (geplant)
- **SMS**: Optional für kritische Fristen (geplant)

## 🎨 Design System

### Farb-Kodierung nach Modulen
```typescript
module_colors = {
  households: "blue",      // 🏠 Haushaltsverwaltung
  checklists: "green",     // 📋 Checklisten & Aufgaben
  legal: "yellow",         // ⚖️ Rechtliches & Behörden
  contracts: "red",        // 💳 Verträge & Finanzen
  inventory: "orange",     // 📦 Inventar & Packing
  longterm: "purple",      // 🔄 Langzeit-Erinnerungen
  ai_assistant: "indigo"   // 🤖 KI-Assistent
}
```

### Responsive Design
- **Mobile First**: Optimiert für Smartphone-Nutzung
- **Progressive Web App**: Installierbar, offline-fähig
- **Tablet**: Erweiterte Ansichten für größere Screens
- **Desktop**: Vollständige Feature-Palette

## 🔐 Sicherheit & Datenschutz

### Authentifizierung
- **Supabase Auth**: E-Mail/Passwort, Social Login
- **JWT Tokens**: Sichere Session-Verwaltung
- **RLS Policies**: Datentrennung auf DB-Ebene
- **Rate Limiting**: Schutz vor Missbrauch

### Datenschutz
- **DSGVO-konform**: Deutsche Rechtslage beachtet
- **Minimale Datensammlung**: Nur notwendige Informationen
- **Transparenz**: Klare Datenschutzerklärung
- **Nutzer-Kontrolle**: Daten exportieren/löschen
