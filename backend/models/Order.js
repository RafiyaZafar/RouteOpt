const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  delivery: {
    address: Object,
    location: {
      type: { type: String, default: "Point" },
      coordinates: [Number],
    },
  },

  customer: {
    name: String,
    phone: String,
  },

  weightKg: Number,

  priority: {
    type: String,
    enum: ["low", "normal", "high", "urgent"],
    default: "normal",
  },

  fragile: {
    type: Boolean,
    default: false,
  },

  timeWindow: {
    start: Date,
    end: Date,
  },

  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },

  assignmentReason: {
  assignedDriver: String,
  distanceKm: String,
  vehicleType: String,
  remainingCapacityKg: Number,
  fragileAllowed: Boolean,
  rejectedDrivers: [
    {
      driverName: String,
      reason: String,
    },
  ],
},


  status: {
    type: String,
    default: "pending",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },


});


module.exports = mongoose.model("Order", OrderSchema);
