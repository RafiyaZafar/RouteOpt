const mongoose = require("mongoose");

const DriverSchema = new mongoose.Schema({
  name: String,

  vehicleType: {
    type: String,
    enum: ["bike", "van", "truck"],
    required: true,
  },

  maxWeight: {
    type: Number,
    default: 999,
  },

  canHandleFragile: {
    type: Boolean,
    default: true,
  },

  maxStops: {
    type: Number,
    default: 50,
  },

  status: {
    type: String,
    default: "idle",
  },
});


module.exports = mongoose.model("Driver", DriverSchema);
