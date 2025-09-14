// coastline.js
import fs from "fs";
import path from "path";
import * as turf from "@turf/turf";
import nearestPointOnLine from "@turf/nearest-point-on-line";


const coastline = JSON.parse(
  fs.readFileSync(path.join("data", "ne_10m_coastline.geojson"), "utf8")
);


function getLineStrings(feature) {
  if (!feature.geometry) return []; // Skip if no geometry
  const geom = feature.geometry;

  if (geom.type === "LineString") return [geom]; // Already a single line

  if (geom.type === "MultiLineString") {
    // Convert each line inside MultiLineString into a LineString
    return geom.coordinates.map(coords => ({
      type: "LineString",
      coordinates: coords
    }));
  }

  return []; // Skip any other geometry type
}

export function getNearestCoastline(lat, lon) {
  if (typeof lat !== "number" || typeof lon !== "number") {
    throw new Error("lat and lon must be numbers");
  }

  // Represent user location as a turf point
  const userPoint = turf.point([lon, lat]);

  let nearestPoint = null;     // Will store the closest coast point
  let minDistance = Infinity;  // Keep track of smallest distance found
  // Loop over each feature (coastline piece) in the GeoJSON
  turf.featureEach(coastline, (feature) => {
    const lines = getLineStrings(feature); // Extract line(s) from feature

    lines.forEach((line) => {
      try {
        // Convert line coordinates into a turf LineString
        const lineTurf = turf.lineString(line.coordinates);

        // Find the closest point on this line to the user point
        const snapped = nearestPointOnLine(lineTurf, userPoint);

        // Calculate distance between user and this coast point
        const dist = turf.distance(userPoint, snapped, { units: "kilometers" });

        // If this is closer than our previous best → update nearest
        if (dist < minDistance) {
          minDistance = dist;
          nearestPoint = snapped;
        }
      } catch (err) {
        // Ignore invalid geometry (sometimes coastline data may be messy)
      }
    });
  });

  // If no valid coastline found → throw error
  if (!nearestPoint) {
    throw new Error("No valid coastline found");
  }

  // Return nearest coast location and distance
  return {
    coastLat: nearestPoint.geometry.coordinates[1],
    coastLon: nearestPoint.geometry.coordinates[0],
    distance_km: minDistance,
  };
}

export async function wave(lat, lon) {
  const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&hourly=wave_height`;
  const res = await fetch(url);
  const data = await res.json();
  return data;
}
