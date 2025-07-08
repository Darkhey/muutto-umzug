export const funFacts: string[] = [
    "Der durchschnittliche Deutsche zieht 4,5 Mal in seinem Leben um.",
    "Der häufigste Grund für einen Umzug ist ein neuer Job.",
    "Die meisten Umzüge finden im Sommer statt.",
    "Der teuerste dokumentierte Immobilien-Umzug war der Verkauf des Château Louis XIV in Frankreich für etwa 300 Millionen Dollar.",
    "Das Wort 'Umzug' kommt vom althochdeutschen 'umbzogan', was 'umherziehen' bedeutet.",
    "In der Schweiz ist es üblich, dass der Mieter die Wohnung komplett neu streicht, bevor er auszieht.",
    "In Japan gibt es spezielle Umzugsfirmen für Katzen.",
    "Eine Umzugsfirma schaffte es angeblich, eine 3-Zimmer-Wohnung in nur 2 Stunden und 45 Minuten umzuziehen – ein offizieller Rekord existiert jedoch nicht.",
    "Die meisten Menschen packen ihre Bücher als letztes ein.",
    "Der längste dokumentierte Umzug auf der Erde war die Übersiedlung einer Kirche in den USA über mehr als 5.000 Kilometer."
];

export const getDistanceFunFact = (distanceKm: number): string => {
  if (distanceKm < 10) {
    return "Kurze Umzüge in der Nähe sind oft stressfreier, aber auch teurer pro Kilometer."
  } else if (distanceKm < 50) {
    return "Regionale Umzüge bieten eine gute Balance zwischen Aufwand und neuen Möglichkeiten."
  } else if (distanceKm < 200) {
    return "Fernumzüge eröffnen neue Lebensbereiche und Karrierechancen."
  } else if (distanceKm < 500) {
    return "Bei solchen Entfernungen lohnt sich oft eine professionelle Umzugsfirma."
  } else {
    return "Internationale oder sehr weite Umzüge sind echte Lebenswenden!"
  }
};