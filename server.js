const express = require("express");
const cors = require("cors");
const { getNearestCoastline, wave } = require("./logic.js");

const app = express();
const PORT = 3000;

app.use(cors({
  origin: "https://fr-cyan.vercel.app",
  methods: ["GET", "POST", "OPTIONS"]
}));


app.get("/nearest-coast", async (req, res) => {
  console.log(req.query);
  const { lat, lon } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ error: "lat and lon required" });
  }
  const coastCoordinates = await getNearestCoastline(parseFloat(lat), parseFloat(lon));
  const TideData = await wave(coastCoordinates.coastLat, coastCoordinates.coastLon);
  console.log(coastCoordinates, TideData);
  res.json({ coastCoordinates, TideData });
});

app.listen(PORT, () => {
  console.log(`Server running`);
});
