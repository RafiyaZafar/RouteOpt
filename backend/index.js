require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

/* ======================
   MIDDLEWARE
====================== */
app.use(cors());
app.use(bodyParser.json());

/* ======================
   DB CONNECT
====================== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ Mongo error", err));

/* ======================
   MODELS
====================== */
const Settings = require("./models/Settings");

/* ======================
   SEED BUSINESS (ONE TIME)
====================== */
async function seedBusiness() {
  const exists = await Settings.findOne();
  if (!exists) {
    await Settings.create({
      businessName: "Red Hat",
      pickup: {
        address: { display_name: "Hauz Khaz, Delhi" },
        location: {
          type: "Point",
          coordinates: [77.209, 28.6139],
        },
      },
    });
    console.log("🏢 Business pickup seeded");
  }
}
seedBusiness();

/* ======================
   ROUTES
====================== */
app.use("/api/orders", require("./routes/orders"));
app.use("/api/drivers", require("./routes/drivers"));
app.use("/api/dispatch", require("./routes/dispatch"));
app.use("/api", require("./routes/geocode"));

/* ======================
   SETTINGS
====================== */
app.get("/api/settings/business", async (req, res) => {
  const settings = await Settings.findOne();
  res.json(settings);
});

/* ======================
   AUTH (MOCK)
====================== */
const users = [
  {
    id: "u-admin",
    role: "admin",
    email: "admin@routeopt.local",
    password: "admin123",
  },
];

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  res.json({
    token: "demo-token",
    role: user.role,
    userId: user.id,
  });
});

/* ======================
   HEALTH CHECK
====================== */
app.get("/api/health", (req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

/* ======================
   START SERVER
====================== */
const PORT = 4000;
app.listen(PORT, () =>
  console.log(`🚀 RouteOpt backend listening on ${PORT}`)
);
