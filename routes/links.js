// routes/links.js
const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET all links
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM links");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE link
router.post("/", async (req, res) => {
  try {
    const { url } = req.body;
    const result = await pool.query(
      "INSERT INTO links (url) VALUES ($1) RETURNING *",
      [url]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
