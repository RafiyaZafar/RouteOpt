const mongoose = require("mongoose");

const SettingsSchema = new mongoose.Schema({
  businessName: String,

  pickup: {
    address: Object,
    location: {
      type: { type: String, default: "Point" },
      coordinates: [Number], // [lng, lat]
    },
  },
});

module.exports = mongoose.model("Settings", SettingsSchema);
