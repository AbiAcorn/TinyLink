// server.js
const express = require("express");
const app = express();
require("dotenv").config();
const db = require("./db"); // db.js should use Pool with correct host
const linksRoute = require("./routes/links");

app.use(express.json());
app.use(express.static("public"));

// -------------------------
// Health Check
// -------------------------
app.get("/healthz", (req, res) => {
  res.status(200).json({ ok: true, version: "1.0" });
});

// -------------------------
// API Routes
// -------------------------
app.use("/api/links", linksRoute);

// -------------------------
// Redirect Route
// -------------------------
app.get("/:code", async (req, res) => {
  const code = req.params.code;

  try {
    const result = await db.query("SELECT * FROM links WHERE code=$1", [code]);

    if (result.rows.length === 0) {
      return res.status(404).send("Link not found");
    }

    const link = result.rows[0];

    // Update clicks and last_clicked safely
    await db.query(
      "UPDATE links SET clicks = clicks + 1, last_clicked = NOW() WHERE code=$1",
      [code]
    );

    // Redirect to original URL
    res.redirect(302, link.url);
  } catch (err) {
    console.error("Redirect error:", err);
    res.status(500).send("Server error");
  }
});

// -------------------------
// Start Server
// -------------------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
