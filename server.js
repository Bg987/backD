import express from "express";
import { getNearestCoastline } from "./coastline.js";

const app = express();
const PORT = 3000;

app.get("/nearest-coast", (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ error: "lat and lon required" });
  }

  const result = getNearestCoastline(parseFloat(lat), parseFloat(lon));
  res.json(result);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
