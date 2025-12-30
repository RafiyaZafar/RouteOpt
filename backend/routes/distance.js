const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Driver = require("../models/Driver");
const Settings = require("../models/Settings");

/* ======================
   DISTANCE UTILS
====================== */
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ======================
   VERSION 1 OPTIMIZER
====================== */
router.post("/optimize", async (req, res) => {
  try {
    const business = await Settings.findOne();
    if (!business?.pickup?.location) {
      return res.status(400).json({ error: "Business pickup missing" });
    }

    const drivers = await Driver.find();
    const orders = await Order.find({ driverId: null });

    if (drivers.length === 0 || orders.length === 0) {
      return res.json({ success: true, message: "Nothing to optimize" });
    }

    const [plng, plat] = business.pickup.location.coordinates;

    /* ======================
       INIT DRIVER STATE
    ====================== */
    const driverState = {};
    drivers.forEach((d) => {
      driverState[d._id] = {
        load: 0,
        stops: [],
        lastLat: plat,
        lastLng: plng,
      };
    });

    /* ======================
       SORT ORDERS
       (Urgent first, farthest first)
    ====================== */
    orders.sort((a, b) => {
      if (a.priority === "urgent" && b.priority !== "urgent") return -1;
      if (b.priority === "urgent" && a.priority !== "urgent") return 1;

      const [alng, alat] = a.delivery.location.coordinates;
      const [blng, blat] = b.delivery.location.coordinates;

      const da = haversine(plat, plng, alat, alng);
      const db = haversine(plat, plng, blat, blng);

      return db - da;
    });

    /* ======================
       ASSIGN ORDERS
    ====================== */
    for (const order of orders) {
      const [olng, olat] = order.delivery.location.coordinates;

      let bestDriver = null;
      let bestCost = Infinity;

      for (const driver of drivers) {
        const state = driverState[driver._id];

        // capacity constraint (if defined)
        if (driver.maxWeight && state.load + order.weightKg > driver.maxWeight) {
          continue;
        }

        const cost = haversine(
          state.lastLat,
          state.lastLng,
          olat,
          olng
        );

        if (cost < bestCost) {
          bestCost = cost;
          bestDriver = driver;
        }
      }

      if (!bestDriver) continue;

      // assign
      order.driverId = bestDriver._id;
      order.status = "assigned";
      await order.save();

      // update driver state
      const state = driverState[bestDriver._id];
      state.load += order.weightKg;
      state.stops.push(order._id);
      state.lastLat = olat;
      state.lastLng = olng;
    }

    res.json({
      success: true,
      assignedOrders: orders.length,
      message: "Version 1 route optimization complete",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Optimization failed" });
  }
});

module.exports = router;
