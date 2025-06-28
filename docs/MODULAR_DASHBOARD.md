# Modulares Dashboard System

## Übersicht

Das modulare Dashboard-System ermöglicht es Benutzern, ihre Benutzeroberfläche individuell anzupassen, indem sie Module hinzufügen, entfernen, neu anordnen und konfigurieren können. Das System ist vollständig responsiv und passt sich verschiedenen Bildschirmgrößen an.

## Widget-Integration

### Neue Module hinzufügen

Um ein neues Modul zum Dashboard hinzuzufügen, müssen Sie die `initialModules`-Array in der `ModularDashboard.tsx`-Datei erweitern:

```typescript
const initialModules: DashboardModule[] = [
  // Bestehende Module...
  
  // Neues Modul
  {
    id: 'unique-module-id',
    title: 'Modul-Titel',
    icon: <Icon className="h-5 w-5 text-color-600" />,
    component: <YourComponent />, // Die Komponente, die im Modul angezeigt wird
    enabled: true, // Ob das Modul standardmäßig aktiviert ist
    category: 'primary', // 'primary', 'secondary' oder 'utility'
    description: 'Beschreibung des Moduls',
    size: 'medium' // 'small', 'medium' oder 'large'
  }
];
```

### Modul-Eigenschaften

| Eigenschaft | Typ | Beschreibung |
|-------------|-----|-------------|
| `id` | `string` | Eindeutige ID des Moduls |
| `title` | `string` | Anzeigename des Moduls |
| `icon` | `ReactNode` | Icon-Komponente für das Modul |
| `component` | `ReactNode` | Die Hauptkomponente des Moduls |
| `enabled` | `boolean` | Ob das Modul aktiv ist |
| `category` | `'primary' \| 'secondary' \| 'utility'` | Kategorie des Moduls |
| `description` | `string` | Kurze Beschreibung des Moduls |
| `size` | `'small' \| 'medium' \| 'large'` | Größe des Moduls im Grid |

## Layout-Konfiguration

Das Dashboard verwendet ein responsives Grid-Layout mit verschiedenen Spaltenanzahlen je nach Bildschirmgröße:

- **Desktop**: 3 Spalten
- **Tablet**: 2 Spalten
- **Mobil**: 1 Spalte

### Modul-Größen

- **small**: Nimmt 1 Spalte ein
- **medium**: Nimmt 1 Spalte auf Desktop, volle Breite auf Tablet/Mobil
- **large**: Nimmt 2 Spalten auf Desktop, volle Breite auf Tablet/Mobil

### Drag & Drop

Module können per Drag & Drop neu angeordnet werden. Die Anordnung wird automatisch in `localStorage` gespeichert und beim nächsten Besuch wiederhergestellt.

## Styling-Guidelines

### Modul-Karten

Alle Module sollten dem folgenden Styling folgen:

```tsx
<Card className="bg-white shadow-lg">
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-lg flex items-center gap-2">
      {icon}
      {title}
    </CardTitle>
    {/* Optional: Aktionen */}
  </CardHeader>
  <CardContent>
    {/* Modul-Inhalt */}
  </CardContent>
</Card>
```

### Farben

- Verwenden Sie die Farbpalette aus dem Design-System
- Jedes Modul sollte eine eigene Akzentfarbe haben
- Verwenden Sie `text-{color}-600` für Icons und Überschriften
- Verwenden Sie `bg-{color}-50 text-{color}-800` für Badges und Hervorhebungen

### Responsive Design

- Alle Module müssen responsiv sein
- Verwenden Sie Flexbox oder Grid für das Layout innerhalb eines Moduls
- Testen Sie auf verschiedenen Bildschirmgrößen

## Best Practices für neue Widget-Entwicklung

### Allgemeine Richtlinien

1. **Minimale interne Zustandsverwaltung**: Verwenden Sie Hooks für die Zustandsverwaltung und halten Sie den internen Zustand minimal.
2. **Responsive Design**: Stellen Sie sicher, dass Ihr Widget auf allen Bildschirmgrößen gut aussieht.
3. **Konsistentes Styling**: Folgen Sie den Styling-Guidelines für ein einheitliches Erscheinungsbild.
4. **Leistungsoptimierung**: Vermeiden Sie unnötige Neuberechnungen und Renderings.
5. **Fehlerbehandlung**: Implementieren Sie eine robuste Fehlerbehandlung und Fallback-UI.

### Beispiel für ein neues Widget

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from 'lucide-react';

export const MyNewWidget = () => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Widget-Titel</h3>
        <Badge variant="outline" className="bg-blue-50 text-blue-800">
          Status
        </Badge>
      </div>
      
      <div className="space-y-2">
        {/* Widget-Inhalt */}
      </div>
      
      <Button variant="outline" className="w-full">
        Aktion
      </Button>
    </div>
  );
};
```

## Persistenz und Benutzereinstellungen

Das Dashboard speichert die folgenden Informationen in `localStorage`:

- Aktivierte/deaktivierte Module
- Anordnung der Module
- Benutzereinstellungen (Layout, Benachrichtigungen, etc.)

Die Daten werden automatisch geladen und gespeichert, wenn sich der Zustand ändert.

## Erweiterung des Systems

Das modulare Dashboard-System kann leicht erweitert werden, um zusätzliche Funktionen zu unterstützen:

- **Benutzerdefinierte Module**: Ermöglichen Sie Benutzern, eigene Module zu erstellen
- **Module-Marketplace**: Implementieren Sie einen Marketplace für Module
- **Erweiterte Konfiguration**: Fügen Sie erweiterte Konfigurationsoptionen für Module hinzu
- **Daten-Synchronisierung**: Synchronisieren Sie Dashboard-Layouts zwischen Geräten

## Fehlerbehebung

### Häufige Probleme

- **Module werden nicht angezeigt**: Überprüfen Sie, ob das Modul aktiviert ist und die richtige Größe hat
- **Layout wird nicht gespeichert**: Überprüfen Sie, ob `localStorage` verfügbar ist und funktioniert
- **Drag & Drop funktioniert nicht**: Stellen Sie sicher, dass die Module korrekt konfiguriert sind

### Debugging

- Überprüfen Sie die Browser-Konsole auf Fehler
- Inspizieren Sie den `localStorage`-Inhalt
- Überprüfen Sie die Modul-Konfiguration