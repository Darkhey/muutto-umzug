export function getDistanceFunFact(distanceKm: number): string {
  const soccerFields = Math.round((distanceKm * 1000) / 105)
  const araKmPerYear = 5000

  if (distanceKm >= 1000) {
    const years = Math.round((distanceKm / araKmPerYear) * 10) / 10
    return `Das ist etwa die Strecke, die ein Ara in ${years} Jahren zuruecklegt!`
  }

  return `Das sind ungefaehr ${soccerFields} Fussballfelder.`
}
