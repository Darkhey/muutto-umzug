import React from 'react'

const AGB = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold mb-4">
        Allgemeine Geschäftsbedingungen (AGB) für die Nutzung der App „muutto“
      </h1>

      <h2 className="text-xl font-semibold mt-4 mb-2">1. Geltungsbereich</h2>
      <p className="mb-2">
        Diese AGB regeln die Nutzung der mobilen und webbasierten Anwendung
        „muutto“. Die App dient als KI-gestützter Umzugsassistent für den
        deutschen Markt und unterstützt Nutzer bei der Planung, Durchführung und
        Nachbereitung ihres Wohnungswechsels. Sie bietet unter anderem
        Haushaltsverwaltung, Aufgabenlisten sowie (zukünftig) Module für
        Vertragsmanagement und weitere Funktionen.
      </p>
      <p className="mb-2">
        Anbieter der App ist der jeweilige Betreiber (nachfolgend „wir“). Mit
        der Registrierung bzw. Nutzung der App erklären Sie sich mit diesen
        Bedingungen einverstanden.
      </p>

      <h2 className="text-xl font-semibold mt-4 mb-2">2. Registrierung und Nutzerkonto</h2>
      <p className="mb-2">
        Für die Nutzung der App ist eine Registrierung per E-Mail und Passwort
        erforderlich. Dabei wird automatisch ein Nutzerprofil erstellt und in
        unserer Datenbank gespeichert.
      </p>
      <p className="mb-2">
        Nach der Registrierung können Sie Haushalte anlegen und weitere
        Mitglieder per E-Mail einladen. Hierfür stehen fünf vordefinierte Rollen
        mit unterschiedlichen Berechtigungen zur Verfügung.
      </p>
      <p className="mb-2">
        Sie sind für die Sicherheit Ihrer Zugangsdaten verantwortlich und dürfen
        diese nicht an Dritte weitergeben.
      </p>

      <h2 className="text-xl font-semibold mt-4 mb-2">3. Leistungsumfang</h2>
      <p className="mb-2">Die Kernfunktionen umfassen derzeit:</p>
      <ul className="list-disc list-inside mb-2 space-y-1">
        <li>Authentifizierung mit sicherer Sitzungsverwaltung</li>
        <li>Haushaltsverwaltung inklusive Mitglieder- und Rollenmanagement</li>
        <li>Onboarding-Flow mit Einrichtung eines Haushalts und Mitglieder-Einladung</li>
        <li>Dashboard mit Überblick über Ihre Haushalte und Fortschrittsanzeige</li>
      </ul>
      <p className="mb-2">
        Weitere Module befinden sich in Entwicklung oder Planung, z.&nbsp;B.
        Checklisten, KI-Assistent („muuttoBot“), Vertragsmanagement und
        Push-Benachrichtigungen. Wir behalten uns vor, Funktionsumfang, Layout
        und Technik jederzeit zu ändern, weiterzuentwickeln oder einzuschränken.
      </p>

      <h2 className="text-xl font-semibold mt-4 mb-2">4. Pflichten der Nutzer</h2>
      <p className="mb-2">Sie verpflichten sich, die App nur im gesetzlichen Rahmen und für private Zwecke zu nutzen.</p>
      <p className="mb-2">Es ist untersagt, sicherheitsrelevante Mechanismen zu umgehen oder die App zu manipulieren.</p>
      <p className="mb-2">Sie sind dafür verantwortlich, dass die von Ihnen eingegebenen Daten (z.&nbsp;B. Haushalts- und Vertragsinformationen) korrekt sind und keine Rechte Dritter verletzen.</p>

      <h2 className="text-xl font-semibold mt-4 mb-2">5. Datenspeicherung und Datenschutz</h2>
      <p className="mb-2">Ihre Daten werden in unserer Supabase-Datenbank gespeichert. Dabei nutzen wir unter anderem Row Level Security (RLS), um Ihre Daten gegen unbefugte Zugriffe zu schützen.</p>
      <p className="mb-2">Wir erheben nur diejenigen Daten, die für die Bereitstellung der App notwendig sind, und beachten die Vorgaben der Datenschutz-Grundverordnung (DSGVO).</p>
      <p className="mb-2">Weitere Informationen finden Sie in unserer Datenschutzerklärung.</p>

      <h2 className="text-xl font-semibold mt-4 mb-2">6. Verfügbarkeit</h2>
      <p className="mb-2">Wir bemühen uns, die App ohne Unterbrechungen bereitzustellen, können jedoch keine permanente Verfügbarkeit garantieren. Wartungsarbeiten, technische Störungen oder höhere Gewalt können zu zeitweisen Einschränkungen führen.</p>
      <p className="mb-2">Ansprüche aufgrund vorübergehender Nichtverfügbarkeit sind ausgeschlossen.</p>

      <h2 className="text-xl font-semibold mt-4 mb-2">7. Haftung</h2>
      <p className="mb-2">Wir haften nicht für indirekte Schäden, Folgeschäden oder entgangene Gewinne, es sei denn, diese beruhen auf Vorsatz oder grober Fahrlässigkeit.</p>
      <p className="mb-2">Für kostenlose Dienste gilt: Wir übernehmen keine Haftung für leichte Fahrlässigkeit.</p>
      <p className="mb-2">Unsere Haftung bei Datenverlust ist auf den Wiederherstellungsaufwand beschränkt, der auch bei regelmäßiger Datensicherung durch Sie angefallen wäre.</p>

      <h2 className="text-xl font-semibold mt-4 mb-2">8. Rechte an Inhalten</h2>
      <p className="mb-2">Sämtliche Inhalte der App (Texte, Grafiken, Quellcode etc.) sind urheberrechtlich geschützt.</p>
      <p className="mb-2">Sie erhalten nur das einfache, nicht übertragbare Recht zur Nutzung der App für eigene Zwecke. Eine kommerzielle Weiterverwertung oder Vervielfältigung ist ohne vorherige schriftliche Zustimmung unzulässig.</p>

      <h2 className="text-xl font-semibold mt-4 mb-2">9. Beendigung der Nutzung</h2>
      <p className="mb-2">Sie können Ihr Nutzerkonto jederzeit löschen. Dadurch werden Ihre personenbezogenen Daten gemäß unserer Datenschutzerklärung entfernt, soweit keine gesetzlichen Aufbewahrungspflichten entgegenstehen.</p>
      <p className="mb-2">Wir behalten uns vor, bei Verstößen gegen diese AGB oder gegen geltendes Recht Ihr Nutzerkonto zu sperren oder zu löschen.</p>

      <h2 className="text-xl font-semibold mt-4 mb-2">10. Änderungen der AGB</h2>
      <p className="mb-2">Wir können diese AGB künftig anpassen, wenn dies aufgrund technischer Entwicklungen, rechtlicher Anforderungen oder Weiterentwicklung der App notwendig wird.</p>
      <p className="mb-2">Über wesentliche Änderungen werden wir Sie innerhalb der App oder per E-Mail informieren. Sofern Sie nicht innerhalb von 30 Tagen widersprechen, gelten die neuen AGB als akzeptiert.</p>

      <h2 className="text-xl font-semibold mt-4 mb-2">11. Schlussbestimmungen</h2>
      <p className="mb-2">Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts.</p>
      <p className="mb-2">Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.</p>
      <p className="mb-2">Gerichtsstand ist – soweit gesetzlich zulässig – der Sitz des Anbieters.</p>

      <p className="mb-2">
        Diese AGB wurden auf Basis des aktuellen Entwicklungsstandes der App
        „muutto“ verfasst und sollen die Nutzung transparent und verständlich
        regeln. Viel Erfolg beim Planen Ihres Umzugs!
      </p>
    </div>
  )
}

export default AGB
