export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const isValidLat = (lat: number) =>
    Number.isFinite(lat) && lat >= -90 && lat <= 90
  const isValidLon = (lon: number) =>
    Number.isFinite(lon) && lon >= -180 && lon <= 180

  if (
    !isValidLat(lat1) ||
    !isValidLat(lat2) ||
    !isValidLon(lon1) ||
    !isValidLon(lon2)
  ) {
    throw new Error('Invalid coordinates')
  }

  const R = 6371
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
