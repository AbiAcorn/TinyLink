// routes/links.js
const express = require("express");
const router = express.Router();
const db = require("../db"); // must export Pool

// simple URL validator
function isValidURL(url) {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

// random 6-char code
function randomCode(len = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

// GET /api/links  -> list all links
router.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM links ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/links -> create link
// body: { url: "...", customCode?: "ABC123" }
router.post("/", async (req, res) => {
  try {
    const { url, customCode } = req.body;

    // URL validation
    if (!url || !isValidURL(url)) {
      return res.status(400).json({ error: "Invalid URL format. Use http:// or https://." });
    }

    const codeRegex = /^[A-Za-z0-9]{6,8}$/;
    let code = customCode;

    if (customCode) {
      if (!codeRegex.test(customCode)) {
        return res.status(400).json({ error: "Custom code must be 6-8 characters and only letters or numbers." });
      }
      // check duplicate
      const exists = await db.query("SELECT 1 FROM links WHERE code = $1", [customCode]);
      if (exists.rowCount > 0) return res.status(409).json({ error: "Custom code already exists." });
    } else {
      // generate unique code (retry if collision)
      let tries = 0;
      do {
        code = randomCode(6);
        const r = await db.query("SELECT 1 FROM links WHERE code = $1", [code]);
        if (r.rowCount === 0) break;
        tries++;
      } while (tries < 5);
    }

    const insert = await db.query(
      "INSERT INTO links (code, url, clicks, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *",
      [code, url, 0]
    );

    return res.status(201).json(insert.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/links/:code -> delete link
router.delete("/:code", async (req, res) => {
  try {
    const { code } = req.params;
    await db.query("DELETE FROM links WHERE code = $1", [code]);
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
