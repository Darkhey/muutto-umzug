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
        Muutto GmbH &ndash; Musterstraße 1, 12345 Berlin, Deutschland,<br />
        E-Mail: info@muutto.de
      </p>

      <h2 className="text-xl font-semibold mt-4">2. Erhobene Daten</h2>
      <p>
        Bei der Registrierung erfassen wir Ihren Namen, Ihre E-Mail-Adresse und
        ein Passwort. Innerhalb der Anwendung können Sie weitere Angaben zu Ihrem
        Haushalt und geplanten Umzug machen (z.&nbsp;B. Umzugsdatum,
        Haushaltsgröße, Aufgaben und Notizen).
      </p>

      <h2 className="text-xl font-semibold mt-4">3. Zweck der Verarbeitung</h2>
      <p>
        Wir verarbeiten Ihre Daten ausschlie&szlig;lich, um Ihnen die Funktionen
        von muutto bereitzustellen: Verwaltung Ihres Haushalts, gemeinsames
        Planen von Aufgaben sowie optionale Nutzung des KI-Assistenten. Eine
        Nutzung zu Werbezwecken oder ein Verkauf Ihrer Daten findet nicht statt.
      </p>

      <h2 className="text-xl font-semibold mt-4">4. Speicherung</h2>
      <p>
        Ihre Daten werden in einer von&nbsp;Supabase bereitgestellten Datenbank
        in der EU gespeichert. Wir bewahren sie nur so lange auf, wie es f&uuml;r
        die Bereitstellung unseres Dienstes erforderlich ist.
      </p>

      <h2 className="text-xl font-semibold mt-4">5. Eingesetzte Dienste</h2>
      <ul className="list-disc ml-6 space-y-1">
        <li>
          <strong>Supabase</strong> f&uuml;r Authentifizierung und Speicherung
          Ihrer Kontodaten.
        </li>
        <li>
          <strong>OpenAI API</strong> zur Bereitstellung des KI-Assistenten. Dazu
          werden Ihre Chatnachrichten an OpenAI &uuml;bermittelt und dort
          verarbeitet.
        </li>
        <li>
          <strong>Nominatim</strong> und <strong>Overpass API</strong> von
          OpenStreetMap f&uuml;r Adresssuche und Points of Interest. Bei der
          Abfrage werden Ihre Suchbegriffe sowie Ihre IP-Adresse an die jeweiligen
          Dienste &uuml;bertragen.
        </li>
        <li>
          <strong>OpenStreetMap Tile Server</strong> zum Laden der Kartendaten.
          Auch hier wird Ihre IP-Adresse an OpenStreetMap &uuml;bermittelt.
        </li>
        <li>
          <strong>Google Fonts</strong> zum Einbinden von Schriftarten. Beim
          Seitenaufruf wird Ihre IP-Adresse an Google &uuml;bertragen.
        </li>
        <li>
          <strong>WhatsApp</strong> nur dann, wenn Sie einen Einladungslink per
          WhatsApp teilen m&ouml;chten. Wir erhalten dabei keine Daten von
          WhatsApp.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-4">6. Lokale Speicherung</h2>
      <p>
        Zur Verbesserung der Benutzerfreundlichkeit speichert die Anwendung
        bestimmte Einstellungen (z.&nbsp;B. Modulpositionen) lokal in Ihrem
        Browser&nbsp;(localStorage). Diese Informationen werden nicht an uns
        &uuml;bermittelt.
      </p>

      <h2 className="text-xl font-semibold mt-4">7. Ihre Rechte</h2>
      <p>
        Sie haben das Recht auf Auskunft, Berichtigung, L&ouml;schung sowie auf
        Einschr&auml;nkung der Verarbeitung Ihrer personenbezogenen Daten. Kontaktieren
        Sie uns hierzu gern unter den oben genannten Angaben.
      </p>

      <h2 className="text-xl font-semibold mt-4">8. Kontakt</h2>
      <p>
        Bei Fragen zum Datenschutz k&ouml;nnen Sie sich jederzeit an uns wenden:
        info@muutto.de
      </p>

      <h2 className="text-xl font-semibold mt-4">9. Aktualit&auml;t</h2>
      <p>
        Diese Datenschutzerkl&auml;rung hat den Stand Juni&nbsp;2024. Durch die
        Weiterentwicklung unserer Website oder gesetzliche &Auml;nderungen kann
        eine Anpassung erforderlich werden.
      </p>
    </div>
  )
}

export default Datenschutz
