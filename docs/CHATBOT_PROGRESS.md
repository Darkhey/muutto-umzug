# Fortschritt KI-Integration

## 2025-06-30
- Chatbot kann jetzt direkt Aufgaben aus Nachrichten anlegen.
- Dazu wurde ein Dialog *AddTaskFromChatDialog* implementiert.
- Nachrichten lassen sich per Button in eine Aufgabe umwandeln; ein Datum wird mittels `chrono-node` aus dem Text erkannt.
- Die Aufgabe wird in der Supabase-Tabelle `tasks` gespeichert und erscheint in Erinnerungen und Timeline.

## Weitere Ideen
- Automatische Erkennung von Terminen und Erstellen von Kalender-Einträgen (iCal Export).
- Vorlagen für häufige Schreiben (z.B. Kündigungen) direkt aus dem Chat anbieten.
- Sprachsteuerung für noch schnellere Eingabe.
