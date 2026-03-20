// San Joaquin County bounding box
const SJC_BOUNDS = {
  minLat: 37.4819,
  maxLat: 38.3001,
  minLon: -121.5849,
  maxLon: -120.9207,
};

export function isInSanJoaquinCounty(lat: number, lon: number): boolean {
  return (
    lat >= SJC_BOUNDS.minLat &&
    lat <= SJC_BOUNDS.maxLat &&
    lon >= SJC_BOUNDS.minLon &&
    lon <= SJC_BOUNDS.maxLon
  );
}
