const express = require("express");
const router = express.Router();
const pool = require("../db");

function generateCode() {
  return Math.random().toString(36).substring(2, 8);
}

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM links WHERE deleted=false ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    let { url, customCode } = req.body;

    if (!url) return res.status(400).json({ error: "URL is required" });

    let code = customCode || generateCode();

    const exists = await pool.query("SELECT 1 FROM links WHERE code=$1", [code]);
    if (exists.rows.length > 0) {
      return res.status(400).json({ error: "Code already exists" });
    }

    const result = await pool.query(
      "INSERT INTO links (code, url) VALUES ($1, $2) RETURNING *",
      [code, url]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:code", async (req, res) => {
  try {
    const code = req.params.code;

    await pool.query(
      "UPDATE links SET deleted=true WHERE code=$1",
      [code]
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:code", async (req, res) => {
  try {
    const code = req.params.code;

    const result = await pool.query(
      "SELECT * FROM links WHERE code=$1 AND deleted=false",
      [code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
