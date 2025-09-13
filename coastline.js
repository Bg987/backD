// coastline.js
import fs from "fs";
import path from "path";
import * as turf from "@turf/turf";
import nearestPointOnLine from "@turf/nearest-point-on-line";

// Load coastline GeoJSON once
const coastline = JSON.parse(
  fs.readFileSync(path.join("data", "ne_10m_coastline.geojson"), "utf8")
);

/**
 * Flatten MultiLineString to array of LineStrings
 */
function getLineStrings(feature) {
  if (!feature.geometry) return [];
  const geom = feature.geometry;
  if (geom.type === "LineString") return [geom];
  if (geom.type === "MultiLineString") {
    return geom.coordinates.map(coords => ({ type: "LineString", coordinates: coords }));
  }
  return [];
}

/**
 * Find nearest coastline point from given latitude and longitude
 * @param {number} lat
 * @param {number} lon
 * @returns {object} nearest point { lat, lon, distance_km }
 */
export function getNearestCoastline(lat, lon) {
  if (typeof lat !== "number" || typeof lon !== "number") {
    throw new Error("lat and lon must be numbers");
  }

  const userPoint = turf.point([lon, lat]);

  let nearestPoint = null;
  let minDistance = Infinity;
  turf.featureEach(coastline, (feature) => {
    const lines = getLineStrings(feature);

    lines.forEach((line) => {
      try {
        const lineTurf = turf.lineString(line.coordinates);
        const snapped = nearestPointOnLine(lineTurf, userPoint);
        const dist = turf.distance(userPoint, snapped, { units: "kilometers" });

        if (dist < minDistance) {
          minDistance = dist;
          nearestPoint = snapped;
        }
      } catch (err) {
        // Skip invalid line coordinates
      }
    });
  });

  if (!nearestPoint) {
    throw new Error("No valid coastline found");
  }

  return {
    lat: nearestPoint.geometry.coordinates[1],
    lon: nearestPoint.geometry.coordinates[0],
    distance_km: minDistance,
  };
}
