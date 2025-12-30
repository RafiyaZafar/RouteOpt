const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

/* ======================
   GET ALL ORDERS
====================== */
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("Failed to fetch orders", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

/* ======================
   CREATE ORDER
====================== */
router.post("/", async (req, res) => {
  try {
    const order = await Order.create({
      pickup: req.body.pickup,
      customer: req.body.customer,
      delivery: req.body.delivery,

      weightKg: req.body.weightKg,
      notes: req.body.notes,

      // constraints
      priority: req.body.priority || "normal",
      fragile: req.body.fragile || false,
      vehicleRestriction: req.body.vehicleRestriction || null,

      status: "pending",
    });

    res.status(201).json(order);
  } catch (err) {
    console.error("Order create failed:", err);
    res.status(500).json({ error: "Failed to save order" });
  }
});

/* ======================
   ASSIGN ORDER
====================== */
router.patch("/:id/assign", async (req, res) => {
  try {
    const { driverId } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { driverId, status: "assigned" },
      { new: true }
    );

    res.json(order);
  } catch (err) {
    console.error("Assign failed", err);
    res.status(500).json({ error: "Assign failed" });
  }
});

module.exports = router;
