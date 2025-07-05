export type TimeOfDay = "morning" | "day" | "evening" | "night"

export const getTimeOfDay = (): TimeOfDay => {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 11) return "morning"
  if (hour >= 11 && hour < 17) return "day"
  if (hour >= 17 && hour < 22) return "evening"
  return "night"
}

export const loadingMessages: Record<TimeOfDay, string[]> = {
  morning: [
    "Brüht den dritten Kaffee auf…",
    "Sucht Motivation im Toaster.",
    "Holt Luft zwischen zwei Kartons.",
    "Druckt Etiketten auf Toastbrot.",
    "Stellt sich vor, wie der neue Balkon aussieht.",
    "Plant mentale Flucht ins Gartenhäuschen.",
    "Zählt Schrauben aus der Besteckschublade."
  ],
  day: [
    "Sortiert 73 identische Ladekabel…",
    "Faltet Umzugskartons mit Origami-Anspruch.",
    "Markiert Kisten mit der Aufschrift: ‚Möglich wichtig‘.",
    "Schließt zehn Verträge ab. Versehentlich doppelt.",
    "Entdeckt das WLAN-Kabel. War nie weg.",
    "Räumt die Küche. Zum vierten Mal.",
    "Schleppt die letzte Kiste. Angeblich."
  ],
  evening: [
    "Bestellt Pizza. In die alte Wohnung.",
    "Redet mit dem Klebeband.",
    "Verliert sich in Möbelaufbauplänen.",
    "Zweifelt am Sinn von Einräumen.",
    "Diskutiert mit Mitbewohnern über Socken im Wohnzimmer.",
    "Plant Umzugs-Karaoke im Treppenhaus.",
    "Zählt Umzugshelfer. Und wird traurig."
  ],
  night: [
    "Wärmt Kaltwitzer in der Mikrowelle auf.",
    "Spricht mit dem Wischmopp über Sinnfragen.",
    "Verkleidet sich als Karton.",
    "Sucht das WLAN unter der Matratze.",
    "Schreibt Zettel an sich selbst. Und ignoriert sie.",
    "Lädt die Kaffeemaschine für den Notfall.",
    "Glaubt fest daran, bald fertig zu sein. Fast."
  ]
}