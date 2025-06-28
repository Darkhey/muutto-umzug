# Immo-Link-Import Workflow

Dieses Dokument beschreibt den geplanten Ablauf für den Import von Wohnungsanzeigen per URL im Onboarding eines Haushalts. Ziel ist es, möglichst viele Daten einer Immobilie automatisch zu erkennen und so die Einrichtung eines neuen Haushalts zu vereinfachen.

## Schritte

| Nr. | Was passiert? | Technik / Hinweise |
| --- | ------------- | ------------------ |
| **1** | **Link-Eingabe** &ndash; der Nutzer fügt die URL einer Immobilienanzeige ein (z.&nbsp;B. von ImmoScout oder eBay Kleinanzeigen). | UI-Feld mit URL-Prüfung, z.&nbsp;B. RegEx `http(s)://...` |
| **2** | **Headless-Fetch** &ndash; der Backend-Service ruft die Seite im Headless-Browser auf und ignoriert Cookie-Banner. | Supabase Edge Function bzw. Cloudflare Worker, Timeout ca. 8&nbsp;s |
| **3** | **HTML-Snapshot → Text** &ndash; das HTML wird bereinigt und zu reinem Text umgewandelt. | Readability.js oder Trafilatura |
| **4** | **KI-Extraktion** &ndash; OpenAI wird mit einem Prompt zur Extraktion der wichtigsten Felder aufgerufen. | GPT-4o, reiner JSON-Output |
| **5** | **Daten-Mapping** &ndash; die KI-Rückgabe wird auf die DB-Spalten des Entwurfs (`households_new_home_draft`) gemappt. | TypeScript Post-Processing |
| **6** | **Nutzer-Review** &ndash; der Nutzer bekommt eine Vorschau und kann erkannte Werte ändern. | Frontend-Formular mit Diff-Highlight |
| **7** | **Alt-vs-Neu-Vergleich** &ndash; aktueller Haushalt wird mit dem neuen Entwurf verglichen und das Delta berechnet. | TS-Utility oder PL/pgSQL View |
| **8** | **Automatische Tasks** &ndash; für jedes relevante Delta werden Aufgaben erstellt. | Eintrag in `tasks` mit `source='immo_import'` |
| **9** | **Erinnerungen & Push** &ndash; z.&nbsp;B. bei geringerer Wohnfläche werden Erinnerungen erzeugt. | Trigger nach `INSERT` auf `tasks` |
| **10** | **Monitoring & Fallback** &ndash; Fehler oder unsichere KI-Ergebnisse werden geloggt und als manuelle Eingabe markiert. | Tabelle `scraper_logs` in Supabase |

## Datenschutz und Fair Use

- Es wird nur ein HTML-Snapshot gespeichert, kein Screenshot.
- Die `robots.txt` der Anbieter wird respektiert.
- Domain-Whitelist und Rate-Limit (1&nbsp;Fetch pro Minute und IP).

## Ressourcen-Sparsamkeit

- Analyse erfolgt nur während des Onboardings.
- Kleine Anzeigen (bis ca. 50&nbsp;kB) gehen direkt an OpenAI; größere Texte werden zuvor gekürzt.

## Langfristiger Ausbau

- Bilder-OCR für Grundrisse
- Parsing von PDF-Exposés
- Anfrage offizieller Partner-APIs (z.&nbsp;B. ImmoScout REST)

