import React from 'react'

const Datenschutz = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Datenschutzerklärung</h1>

      <p>
        Wir freuen uns über Ihr Interesse an <strong>muutto</strong>. Der Schutz
        Ihrer personenbezogenen Daten hat für uns einen hohen Stellenwert. Im
        Folgenden informieren wir Sie darüber, welche Daten wir erheben, wie wir
        sie nutzen und welche Rechte Sie haben.
      </p>

      <h2 className="text-xl font-semibold mt-4">1. Verantwortlicher</h2>
      <p>
        Muutto GmbH — Musterstraße 1, 12345 Berlin, Deutschland,<br />
        E-Mail: info@muutto.de
      </p>

      <h2 className="text-xl font-semibold mt-4">2. Erhobene Daten</h2>
      <p>
        Bei der Registrierung erfassen wir Ihren Namen, Ihre E-Mail-Adresse und
        ein Passwort. Innerhalb der Anwendung können Sie weitere Angaben zu Ihrem
        Haushalt und geplanten Umzug machen (z. B. Umzugsdatum,
        Haushaltsgröße, Aufgaben und Notizen).
      </p>

      <h2 className="text-xl font-semibold mt-4">3. Zweck der Verarbeitung</h2>
      <p>
        Wir verarbeiten Ihre Daten ausschließlich, um Ihnen die Funktionen
        von muutto bereitzustellen: Verwaltung Ihres Haushalts, gemeinsames
        Planen von Aufgaben sowie optionale Nutzung des KI-Assistenten. Eine
        Nutzung zu Werbezwecken oder ein Verkauf Ihrer Daten findet nicht statt.
      </p>

      <h2 className="text-xl font-semibold mt-4">4. Speicherung</h2>
      <p>
        Ihre Daten werden in einer von Supabase bereitgestellten Datenbank
        in der EU gespeichert. Wir bewahren sie nur so lange auf, wie es für
        die Bereitstellung unseres Dienstes erforderlich ist.
      </p>

      <h2 className="text-xl font-semibold mt-4">5. Eingesetzte Dienste</h2>
      <ul className="list-disc ml-6 space-y-1">
        <li>
          <strong>Supabase</strong> für Authentifizierung und Speicherung
          Ihrer Kontodaten.
        </li>
        <li>
          <strong>OpenAI API</strong> zur Bereitstellung des KI-Assistenten. Dazu
          werden Ihre Chatnachrichten an OpenAI übermittelt und dort
          verarbeitet.
        </li>
        <li>
          <strong>Nominatim</strong> und <strong>Overpass API</strong> von
          OpenStreetMap für Adresssuche und Points of Interest. Bei der
          Abfrage werden Ihre Suchbegriffe sowie Ihre IP-Adresse an die jeweiligen
          Dienste übertragen.
        </li>
        <li>
          <strong>OpenStreetMap Tile Server</strong> zum Laden der Kartendaten.
          Auch hier wird Ihre IP-Adresse an OpenStreetMap übermittelt.
        </li>
        <li>
          <strong>Google Fonts</strong> zum Einbinden von Schriftarten. Beim
          Seitenaufruf wird Ihre IP-Adresse an Google übertragen.
        </li>
        <li>
          <strong>WhatsApp</strong> nur dann, wenn Sie einen Einladungslink per
          WhatsApp teilen möchten. Wir erhalten dabei keine Daten von
          WhatsApp.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-4">6. Lokale Speicherung</h2>
      <p>
        Zur Verbesserung der Benutzerfreundlichkeit speichert die Anwendung
        bestimmte Einstellungen (z. B. Modulpositionen) lokal in Ihrem
        Browser (localStorage). Diese Informationen werden nicht an uns
        übermittelt.
      </p>

      <h2 className="text-xl font-semibold mt-4">7. Ihre Rechte</h2>
      <p>
        Sie haben das Recht auf Auskunft, Berichtigung, Löschung sowie auf
        Einschränkung der Verarbeitung Ihrer personenbezogenen Daten. Kontaktieren
        Sie uns hierzu gern unter den oben genannten Angaben.
      </p>

      <h2 className="text-xl font-semibold mt-4">8. Kontakt</h2>
      <p>
        Bei Fragen zum Datenschutz können Sie sich jederzeit an uns wenden:
        info@muutto.de
      </p>

      <h2 className="text-xl font-semibold mt-4">9. Aktualität</h2>
      <p>
        Diese Datenschutzerklärung hat den Stand Juni 2025. Durch die
        Weiterentwicklung unserer Website oder gesetzliche Änderungen kann
        eine Anpassung erforderlich werden.
      </p>
    </div>
  )
}

export default Datenschutz
