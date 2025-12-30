const express = require("express");
const router = express.Router();

router.get("/reverse", async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ error: "missing coords" });
  }

  try {
    const url = `https://us1.locationiq.com/v1/reverse?key=${process.env.LOCATIONIQ_KEY}&lat=${lat}&lon=${lon}&format=json`;
    const r = await fetch(url);
    const data = await r.json();

    res.json({
      display_name: data.display_name,
      lat,
      lon,
    });
  } catch (err) {
    console.error("Reverse geocode failed", err);
    res.status(500).json({ error: "reverse failed" });
  }
});

module.exports = router;
