const express = require("express");
const router = express.Router();
const db = require("../db");

function genCode(len = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < len; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

function isValidUrl(url) {
  try { new URL(url); return true; }
  catch { return false; }
}

router.post("/", async (req, res) => {
  let { url, code } = req.body;

  if (!isValidUrl(url)) return res.status(400).json({ error: "Invalid URL" });

  if (!code) code = genCode(6);

  if (!/^[A-Za-z0-9]{6,8}$/.test(code))
    return res.status(400).json({ error: "Invalid code format" });

  try {
    const exists = await db.query("SELECT * FROM links WHERE code=$1", [code]);
    if (exists.rows.length > 0) return res.status(409).json({ error: "Code exists" });

    const result = await db.query(
      "INSERT INTO links (code, url) VALUES ($1, $2) RETURNING *",
      [code, url]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  const result = await db.query("SELECT * FROM links ORDER BY id DESC");
  res.json(result.rows);
});

router.get("/:code", async (req, res) => {
  const result = await db.query("SELECT * FROM links WHERE code=$1", [req.params.code]);
  if (result.rows.length === 0) return res.status(404).json({ error: "Not found" });
  res.json(result.rows[0]);
});

router.delete("/:code", async (req, res) => {
  await db.query("DELETE FROM links WHERE code=$1", [req.params.code]);
  res.json({ success: true });
});

module.exports = router;
