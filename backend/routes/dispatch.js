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
   OPTIMIZE DISPATCH (V1 + Explainability)
====================== */
router.post("/optimize", async (req, res) => {
  try {
    const business = await Settings.findOne();
    if (!business?.pickup?.location) {
      return res.status(400).json({ error: "Business pickup not set" });
    }

    const drivers = await Driver.find();
    const orders = await Order.find({ driverId: null }).sort({
      priority: -1,
      createdAt: 1,
    });

    if (!drivers.length || !orders.length) {
      return res.json({ success: true, message: "Nothing to optimize" });
    }

    const [plng, plat] = business.pickup.location.coordinates;

    /* ======================
       DRIVER STATE
    ====================== */
    const driverState = {};
    drivers.forEach((d) => {
      driverState[d._id] = {
        lastLat: plat,
        lastLng: plng,
        load: 0,
        stops: 0,
      };
    });

    const assigned = [];
    const unassigned = [];

    /* ======================
       ASSIGN ORDERS
    ====================== */
    for (const order of orders) {
      if (!order.delivery?.location?.coordinates) {
        unassigned.push(order._id);
        continue;
      }

      const [olng, olat] = order.delivery.location.coordinates;

      let bestDriver = null;
      let bestCost = Infinity;
      let rejectedDrivers = [];

      for (const driver of drivers) {
        const state = driverState[driver._id];

        /* ========= CONSTRAINTS ========= */

        // Capacity
        if (
          driver.maxWeight &&
          order.weightKg &&
          state.load + order.weightKg > driver.maxWeight
        ) {
          rejectedDrivers.push({
            driverName: driver.name,
            reason: "Exceeds max weight capacity",
          });
          continue;
        }

        // Max stops
        if (driver.maxStops && state.stops >= driver.maxStops) {
          rejectedDrivers.push({
            driverName: driver.name,
            reason: "Reached maximum stops",
          });
          continue;
        }

        // Fragile
        if (order.fragile && !driver.canHandleFragile) {
          rejectedDrivers.push({
            driverName: driver.name,
            reason: "Cannot handle fragile items",
          });
          continue;
        }

        // Vehicle restriction
        if (
          order.vehicleRestriction &&
          order.vehicleRestriction !== driver.vehicleType
        ) {
          rejectedDrivers.push({
            driverName: driver.name,
            reason: `Vehicle type mismatch (${driver.vehicleType})`,
          });
          continue;
        }

        /* ========= COST ========= */
        const cost = haversine(
          state.lastLat,
          state.lastLng,
          olat,
          olng
        );

        if (cost < bestCost) {
          bestCost = cost;
          bestDriver = driver;
        } else {
          rejectedDrivers.push({
            driverName: driver.name,
            reason: `Farther distance (${cost.toFixed(2)} km)`,
          });
        }
      }

      /* ========= ASSIGN ========= */
      if (bestDriver) {
        const state = driverState[bestDriver._id];

        order.driverId = bestDriver._id;
        order.status = "assigned";

        // 🔍 WHY THIS DRIVER (Version-1 explainability)
        order.assignmentReason = {
          assignedDriver: bestDriver.name,
          distanceKm: bestCost.toFixed(2),
          base: "depot",
          remainingCapacityKg:
            (bestDriver.maxWeight || 0) -
            (state.load + (order.weightKg || 0)),
          vehicleType: bestDriver.vehicleType,
          fragileAllowed: bestDriver.canHandleFragile,
          rejectedDrivers,
        };

        await order.save();

        // Update state
        state.lastLat = olat;
        state.lastLng = olng;
        state.load += order.weightKg || 0;
        state.stops += 1;

        assigned.push({
          orderId: order._id,
          driverId: bestDriver._id,
          distanceKm: bestCost.toFixed(2),
        });
      } else {
        unassigned.push(order._id);
      }
    }

    res.json({
      success: true,
      assigned: assigned.length,
      unassigned: unassigned.length,
      details: assigned,
      unassignedOrders: unassigned,
    });
  } catch (err) {
    console.error("❌ Dispatch optimization failed", err);
    res.status(500).json({ error: "Optimization failed" });
  }
});

module.exports = router;
