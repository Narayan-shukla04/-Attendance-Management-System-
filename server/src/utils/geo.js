import geolib from "geolib";

export const checkInLocation = (lat, lng) => {
  const maxMeters = Number(process.env.MAX_DISTANCE_METERS) || 50000;
  const officeLat = Number(process.env.OFFICE_LAT) || 23.2184;
  const officeLng = Number(process.env.OFFICE_LNG) || 77.3937;

  const distance = geolib.getDistance(
    { latitude: Number(lat), longitude: Number(lng) },
    { latitude: officeLat, longitude: officeLng },
  );

  const allowed = distance <= maxMeters;
  return {
    allowed,
    distance,
    message: allowed
      ? "Check-in allowed!"
      : `Too far! You are ${distance} meters away (allowed: ${maxMeters}m).`,
  };
};
