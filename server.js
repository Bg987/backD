const express = require("express");
const cors = require("cors");
const { getNearestCoastline } =require("./coastline.js");

const app = express();
const PORT = 3000;

app.use(cors({
  origin:[`http://127.0.0.1:5500`,`https://fr-cyan.vercel.app/`],  
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.get("/nearest-coast", (req, res) => {
  const { lat, lon } = req.query;
  console.log("incoming request", lat, lon);
  if (!lat || !lon) {
    return res.status(400).json({ error: "lat and lon required" });
  }
  const result = getNearestCoastline(parseFloat(lat), parseFloat(lon));
  res.json(result);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
