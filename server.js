// server.js
const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");

// PostgreSQL connection (db.js must export a Pool as `module.exports = pool;`)
const db = require("./db");

// Routes
const linksRoute = require("./routes/links");

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // serve public/index.html and assets

// Health check
app.get("/healthz", (req, res) => res.json({ ok: true }));

// API routes (mounted at /api/links)
app.use("/api/links", linksRoute);

// Stats page (render a simple, clean stats page)
app.get("/stats/:code", async (req, res) => {
  const { code } = req.params;
  try {
    const result = await db.query("SELECT * FROM links WHERE code = $1", [code]);
    if (result.rowCount === 0) return res.status(404).send("Code not found");

    const link = result.rows[0];
    res.send(`
      <!doctype html>
      <html>
      <head><meta charset="utf-8"><title>Stats - ${code}</title></head>
      <body style="font-family: Arial, sans-serif; margin: 30px;">
        <h2>Stats for <code>${code}</code></h2>
        <p><strong>Original URL:</strong> <a href="${link.url}" target="_blank">${link.url}</a></p>
        <p><strong>Short URL:</strong> <a href="${req.protocol}://${req.get("host")}/${link.code}">${req.protocol}://${req.get("host")}/${link.code}</a></p>
        <p><strong>Clicks:</strong> ${link.clicks ?? 0}</p>
        <p><strong>Created at:</strong> ${link.created_at ? new Date(link.created_at).toLocaleString() : "N/A"}</p>
        <p><strong>Last clicked:</strong> ${link.last_clicked ? new Date(link.last_clicked).toLocaleString() : "Not clicked yet"}</p>
        <p style="margin-top:20px;"><a href="/">⬅ Back to Dashboard</a></p>
      </body>
      </html>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Redirect handler — must be last so /stats and /api routes work
app.get("/:code", async (req, res) => {
  const { code } = req.params;
  try {
    const result = await db.query("SELECT * FROM links WHERE code = $1", [code]);
    if (result.rowCount === 0) return res.status(404).send("Short URL not found");

    // increment clicks and update last_clicked
    await db.query(
      "UPDATE links SET clicks = COALESCE(clicks,0) + 1, last_clicked = NOW() WHERE code = $1",
      [code]
    );

    return res.redirect(result.rows[0].url);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
