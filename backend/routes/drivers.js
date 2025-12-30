const express = require("express");
const router = express.Router();
const Driver = require("../models/Driver");

/* ======================
   GET ALL DRIVERS
====================== */
router.get("/", async (req, res) => {
  try {
    const drivers = await Driver.find();
    res.json(drivers);
  } catch (err) {
    console.error("Failed to fetch drivers", err);
    res.status(500).json({ error: "Failed to fetch drivers" });
  }
});

/* ======================
   CREATE DRIVER
====================== */
router.post("/", async (req, res) => {
  try {
    const driver = await Driver.create({
      name: req.body.name,
      phone: req.body.phone,

      // constraints
      vehicleType: req.body.vehicleType || "bike",
      maxWeight: req.body.maxWeight || 10,
      canHandleFragile: req.body.canHandleFragile || false,

      status: "offline",
    });

    res.status(201).json(driver);
  } catch (err) {
    console.error("Driver create failed", err);
    res.status(500).json({ error: "Failed to create driver" });
  }
});

module.exports = router;
