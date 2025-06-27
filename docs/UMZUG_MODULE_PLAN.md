# Plan: Umzugs-Modul

## Ziel
Das bestehende System aus den Bausteinen **Haushalt** und **Haushaltsmitglieder** soll um den neuen Baustein **Umzug** erweitert werden. Damit lassen sich mehrere Haushalte leichter zu einem gemeinsamen Haushalt zusammenführen. Gleichzeitig wird das Rollensystem ausgebaut, sodass mehr Rollen vergeben werden können.

## Aktueller Stand
- **Haushalt** speichert den aktuellen Zustand eines Haushalts (Größe, Haustiere, Eigentumsart usw.).
- **Haushaltsmitglieder** verwalten Nutzer inklusive Rollen und Berechtigungen.

## Neuer Baustein: Umzug
Der Baustein **Umzug** definiert das Ziel eines anstehenden Zusammenzugs. Er enthält unter anderem:
- Referenz auf den Quell‑Haushalt (oder mehrere, falls Haushalte zusammengelegt werden).
- Ziel‑Informationen (z.B. geplante Haushaltsgröße, Anzahl der Haustiere, neue Adresse).
- Gewünschter Umzugstermin und Status.
- Optionale Anmerkungen oder Checklisten‑Verweise.

### Merger Helper
Ein geplanter **Merger Helper** unterstützt beim Zusammenführen mehrerer Haushalte in einen Zielhaushalt. Dabei werden vorhandene Daten (Mitglieder, Rollen, Haustiere) automatisch übernommen und Konflikte sichtbar gemacht.

## Erweiterung des Rollensystems
- Neue Rollen können im File `src/config/roles.ts` definiert werden.
- Das System soll beliebig viele Rollen zulassen, die anschließend über die Mitgliederverwaltung zugewiesen werden können.
- Beispiele für zusätzliche Rollen:
  - "Umzugsplaner" für die gesamte Koordination
  - "Kommunikationsbeauftragte" für Behördengänge und Nachbarn

## Migrations‑ und Datenfluss
1. **Haushalte auswählen**: Nutzer wählen die Haushalte aus, die zusammenziehen sollen.
2. **Umzug erstellen**: Der neue Baustein speichert Zielgröße, Haustieranzahl und weitere Daten.
3. **Merger Helper ausführen**: Dieser übernimmt Mitglieder und Rollen in den Zielhaushalt und erstellt bei Bedarf neue Einträge.
4. **Aktuellen Haushalt schließen**: Nach erfolgreichem Umzug werden die Quell‑Haushalte archiviert oder gelöscht.

## Vorteile
- Klare Trennung zwischen aktuellem Zustand (Haushalt) und zukünftigem Ziel (Umzug).
- Flexibles Rollensystem erleichtert die Zuweisung spezifischer Verantwortlichkeiten.
- Durch den Merger Helper lassen sich Haushalte langfristig einfacher zusammenführen.

