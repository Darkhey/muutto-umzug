
# muutto - Projektübersicht

## 🏠 Was ist muutto?

**muutto** ist ein KI-gestützter, modularer Umzugsbegleiter für den deutschen Markt. Die App hilft Nutzern bei der Planung, Durchführung und Nachbereitung ihres Wohnungswechsels – inklusive Fristen, Verträgen, Teamorganisation und langfristigen Aufgaben.

## 🎯 Zielgruppe

- Privatpersonen, Paare & Familien mit Umzugsplänen
- Menschen mit Kindern, Haustieren oder komplexen Umzugsbedarfen
- Nutzer mit wenig Zeit oder Überblick über Umzugsprozesse
- Digitalaffine Haushalte, die Struktur und Automatisierung suchen

## 🏗️ Technische Architektur

### Frontend
- **React 18** mit TypeScript
- **Vite** als Build-Tool
- **Tailwind CSS** für Styling
- **shadcn/ui** für UI-Komponenten
- **React Router** für Navigation
- **Tanstack Query** für State Management

### Backend
- **Supabase** als Backend-as-a-Service
- **PostgreSQL** Datenbank mit Row Level Security (RLS)
- **Supabase Auth** für Authentifizierung
- **Edge Functions** für serverlose Funktionen

### Datenmodell
```
Users (Supabase Auth)
├── Profiles (public.profiles)
├── Households (public.households)
│   ├── Members (public.household_members)
│   ├── Tasks (geplant)
│   ├── Contracts (geplant)
│   └── Reminders (geplant)
```

## 📋 Aktueller Entwicklungsstand

### ✅ Implementiert (Core Module)
1. **Authentifizierung**
   - E-Mail/Passwort Login/Registration
   - Automatische Profilerstellung
   - Session Management
   - Sichere RLS Policies

2. **Haushaltsverwaltung**
   - Haushalte erstellen mit vollständigen Details
   - Mitglieder einladen per E-Mail
   - Beitritt über individuellen Einladungslink
   - Rollenzuweisung (5 vordefinierte Rollen)
   - Owner-Rechte und Berechtigungssystem
   - Sichere Datentrennung zwischen Haushalten

3. **Onboarding Flow**
   - 5-Schritte Einrichtungsprozess
   - Haushaltsdaten erfassen
   - Mitglieder hinzufügen
   - Automatische Ersteinrichtung

4. **Dashboard**
   - Übersicht aller Haushalte
   - Fortschrittsanzeige
   - Schnellzugriff auf Funktionen
   - Responsive Design

### 🚧 In Entwicklung
- Checklisten-Modul mit rollenbasierten Aufgaben
- KI-Assistent (muuttoBot)
- Vertragsmanagement

### 📅 Geplant
- Rechtliches & Behördenmodul
- Inventar & Packmodul
- Langzeit-Erinnerungsmodul
- Kalenderintegration
- Push-Benachrichtigungen

## 🔧 Konfiguration & Einstellungen

Alle konfigurierbaren Einstellungen befinden sich in zentralen Dateien:

- `src/config/app.ts` - Haupt-App-Konfiguration
- `src/config/roles.ts` - Rollendefinitionen
- `src/config/regions.ts` - Regionale Einstellungen
- `src/utils/progressCalculator.ts` - Fortschrittsberechnungen

## 🚀 Deployment

- **Staging**: Automatisch über Lovable
- **Production**: Über Lovable Publish
- **Database**: Supabase (automatisch skalierend)
- **Edge Functions**: Automatisch deployed
