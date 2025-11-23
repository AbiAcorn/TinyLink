const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());


const pool = require("./db");


const linksRoute = require("./routes/links");
app.use("/api/links", linksRoute);


app.get("/:code", async (req, res) => {
  try {
    const code = req.params.code;

    const result = await pool.query(
      "SELECT * FROM links WHERE code=$1 AND deleted=false",
      [code]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("Invalid link");
    }

    const link = result.rows[0];

    await pool.query(
      "UPDATE links SET clicks = clicks + 1, last_clicked = NOW() WHERE code=$1",
      [code]
    );

    res.redirect(link.url);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});
