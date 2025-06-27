
# KI-Agent Anweisungen für muutto

## 🤖 Zweck dieses Dokuments

Diese Datei enthält spezifische Anweisungen für KI-Agents (wie ChatGPT, Claude, etc.), die bei der Weiterentwicklung von muutto helfen. Sie definiert Konventionen, Best Practices und Projektkontext.

## 🏗️ Projekt-Kontext

### Was ist muutto?
muutto ist ein **deutscher Umzugsbegleiter** mit folgenden Kernprinzipien:
- **Modular**: Jede Funktion ist als eigenständiges Modul implementiert
- **Kollaborativ**: Mehrere Nutzer können in Haushalten zusammenarbeiten
- **KI-gestützt**: Intelligente Empfehlungen und Automatisierung
- **Sicher**: DSGVO-konform mit strikter Datentrennung
- **Skalierbar**: Von 1-Person Haushalten bis zu Großfamilien

### Technologie-Stack
```typescript
Frontend: React + TypeScript + Vite + Tailwind + shadcn/ui
Backend: Supabase (PostgreSQL + Auth + Edge Functions)
State: Tanstack Query + React Context
Routing: React Router
UI: Mobile-First, Responsive Design
```

## 📋 Entwicklungsrichtlinien

### 1. Code-Organisation
```
✅ DO:
- Zentrale Konfigurationsdateien nutzen (src/config/)
- Komponenten klein und fokussiert halten (< 200 Zeilen)
- Hooks für wiederverwendbare Logik erstellen
- TypeScript strikt verwenden

❌ DON'T:
- Hardcoded Strings oder Werte verwenden  
- Monolithische Komponenten erstellen
- Business Logic in UI-Komponenten
- any-Types verwenden
```

### 2. Datenbank-Design
```sql
✅ DO:
- Row Level Security (RLS) für alle Tabellen
- UUID als Primary Keys
- Timestamps (created_at, updated_at) überall
- Soft Deletes wo sinnvoll
- Indizes für häufige Queries

❌ DON'T:
- Direkte Foreign Keys zu auth.users
- Fehlende RLS Policies
- NULL-Werte ohne Grund
- Fehlende Validierung
```

### 3. Sicherheit
```typescript
✅ DO:
- RLS Policies testen
- User Input validieren
- Error Handling implementieren
- Minimum Privilege Principle

❌ DON'T:
- Sensitive Daten im Frontend
- Admin-Funktionen ohne Prüfung
- Unvalidierte DB-Queries
- Fehlende Error Boundaries
```

## 🎯 Feature-Entwicklung Guidelines

### Neues Modul hinzufügen
```typescript
1. Konfiguration in src/config/app.ts erweitern
2. Datenmodell mit RLS Policies erstellen
3. TypeScript Interfaces definieren
4. Custom Hooks für API-Interaktion
5. UI-Komponenten (atomic design)
6. Integration in Dashboard/Navigation
7. Tests schreiben (falls erforderlich)
8. Dokumentation aktualisieren
```

### Rollensystem erweitern
```typescript
// Neue Rolle in src/config/roles.ts hinzufügen
{
  key: 'neue_rolle',
  name: 'Display Name',
  icon: '🔧',
  description: 'Was macht diese Rolle',
  color: 'bg-color-100 text-color-800',
  responsibilities: [
    'Verantwortung 1',
    'Verantwortung 2'
  ]
}

// Enum in database.ts erweitern
// Migration für DB-Enum erstellen
// UI-Komponenten automatisch unterstützen neue Rolle
```

### Checklisten erweitern
```typescript
// Template-System nutzen
interface TaskTemplate {
  title: string
  description: string
  phase: 'vor_umzug' | 'umzugstag' | 'nach_umzug'
  assignedRole?: HouseholdRole
  daysBeforeMove: number
  priority: 'niedrig' | 'mittel' | 'hoch' | 'kritisch'
  category: string
  conditions?: {
    children?: boolean
    pets?: boolean
    propertyType?: 'miete' | 'eigentum'
    region?: string
  }
}
```

## 🚀 Performance Guidelines

### Frontend Optimierung
```typescript
✅ DO:
- React.memo für teure Komponenten
- useMemo/useCallback für komplexe Berechnungen
- Lazy Loading für große Module
- Optimistic Updates für bessere UX

❌ DON'T:
- Unnötige Re-Renders
- Zu viele useEffect Dependencies
- Blocking UI Operations
- Memory Leaks
```

### Backend Optimierung
```sql
✅ DO:
- Indizes für häufige Queries
- Batch Operations wo möglich
- Pagination für große Datensets
- Query Optimization

❌ DON'T:
- N+1 Query Problems
- Fehlende Joins
- Übertragung ungenutzter Daten
- Blocking Operations
```

## 🎨 UI/UX Guidelines

### Design System
```typescript
// Farben pro Modul (src/config/app.ts)
module_colors = {
  households: 'blue',
  checklists: 'green', 
  legal: 'yellow',
  contracts: 'red',
  inventory: 'orange',
  longterm: 'purple',
  ai_assistant: 'indigo'
}

// Konsistente Iconographie
icons = {
  household: '🏠',
  member: '👤', 
  task: '📋',
  deadline: '⏰',
  success: '✅',
  warning: '⚠️',
  error: '❌'
}
```

### Responsive Design
```css
/* Mobile First Approach */
.component {
  /* Mobile Styles (default) */
}

@media (min-width: 768px) {
  .component {
    /* Tablet Styles */
  }
}

@media (min-width: 1024px) {
  .component {
    /* Desktop Styles */
  }
}
```

## 🔄 Workflow Integration

### Git Workflow
```bash
# Feature Development
1. git checkout -b feature/neue-funktion
2. Entwicklung mit häufigen Commits
3. Tests durchführen
4. Pull Request mit ausführlicher Beschreibung
5. Code Review
6. Merge nach Approval

# Hotfixes
1. git checkout -b hotfix/kritischer-bug
2. Minimale Änderung
3. Sofortiger Test
4. Merge + Deploy
```

### Deployment
```yaml
# Automatisch über Lovable
Staging: Bei jedem Push
Production: Manuell über Publish
Database: Automatische Migrations
Edge Functions: Automatisch deployed
```

## 🧪 Testing Guidelines

### Unit Tests (falls erforderlich)
```typescript
// Hooks testen
import { renderHook } from '@testing-library/react'
import { useHouseholds } from '@/hooks/useHouseholds'

test('should fetch households', async () => {
  const { result } = renderHook(() => useHouseholds())
  // Assertions
})

// Komponenten testen  
import { render, screen } from '@testing-library/react'
import { Dashboard } from '@/components/Dashboard'

test('should render dashboard', () => {
  render(<Dashboard />)
  expect(screen.getByText('Dashboard')).toBeInTheDocument()
})
```

### Integration Tests
```typescript
// Database Integration
test('should create household with RLS', async () => {
  // Setup test user
  // Create household
  // Verify isolation
  // Cleanup
})

// API Integration
test('should handle auth flow', async () => {
  // Mock Supabase
  // Test login/logout
  // Verify session
})
```

## 📚 Dokumentation

### Code Dokumentation
```typescript
/**
 * Hook für Haushaltsverwaltung
 * 
 * @param userId - ID des aktuellen Users
 * @returns {Object} - Haushalte, Loading State, CRUD Funktionen
 * 
 * @example
 * const { households, loading, createHousehold } = useHouseholds()
 * 
 * Sicherheit:
 * - Nutzt RLS für Datentrennung
 * - Validiert User-Berechtigung
 * - Error Handling integriert
 */
export function useHouseholds(userId?: string) {
  // Implementation
}
```

### API Dokumentation
```typescript
/**
 * Supabase Edge Function: household-invite
 * 
 * POST /functions/v1/household-invite
 * 
 * Body:
 * {
 *   householdId: string,
 *   email: string, 
 *   role?: HouseholdRole,
 *   message?: string
 * }
 * 
 * Returns:
 * {
 *   success: boolean,
 *   inviteId: string,
 *   inviteLink: string
 * }
 * 
 * Errors:
 * - 400: Invalid input
 * - 401: Unauthorized  
 * - 403: Not household owner
 * - 500: Server error
 */
```

## 🎯 Feature Prioritäten

### Aktuelle Priorität (Phase 1)
1. **Checklisten-Modul** - Aufgaben mit Rollenzuweisung
2. **KI-Assistent** - Grundfunktionen 
3. **Vertragsmanagement** - Basis-Features
4. **Mobile Optimierung** - PWA Features

### Mittelfristig (Phase 2)
1. **Rechtliches Modul** - Behördengänge
2. **Inventar System** - QR-Codes
3. **Kalender Integration** - Termine sync
4. **Push Notifications** - Erinnerungen

### Langfristig (Phase 3)
1. **Banking API** - Vertragserkennung
2. **Community Features** - Bewertungen, Tipps
3. **Marketplace** - Dienstleister
4. **Analytics** - Umzugs-Insights

## 🔍 Debugging & Monitoring

### Logging Strategy
```typescript
// Frontend Logging
console.log('[muutto:debug]', context, data)
console.warn('[muutto:warn]', warning, context)  
console.error('[muutto:error]', error, stack)

// Backend Logging (Edge Functions)
console.log(`[${functionName}] ${message}`, metadata)
```

### Error Handling
```typescript
// Global Error Boundary
<ErrorBoundary fallback={ErrorFallback}>
  <App />
</ErrorBoundary>

// API Error Handling
try {
  const result = await apiCall()
} catch (error) {
  console.error('[API Error]', error)
  toast.error('Etwas ist schiefgelaufen')
  // Fallback behavior
}
```

---

## 🚀 Quick Start für KI-Agents

Wenn du als KI-Agent an muutto arbeitest:

1. **Kontext verstehen**: Lies diese Dokumentation vollständig
2. **Aktuelle Codebase prüfen**: Verstehe implementierte Features
3. **Konfiguration beachten**: Nutze zentrale Config-Dateien
4. **Sicherheit first**: RLS Policies für alle DB-Änderungen
5. **Mobile-optimiert**: Responsive Design von Anfang an
6. **Modular denken**: Kleine, fokussierte Komponenten
7. **Deutsche Sprache**: UI-Texte und Dokumentation
8. **Testing**: Grundlegende Tests für kritische Pfade

Bei Fragen oder Unklarheiten: Frage nach spezifischen Details anstatt Annahmen zu treffen.
