// server.js

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// PostgreSQL connection
const pool = require("./db");

// Routes
const linksRoute = require("./routes/links");
app.use("/api/links", linksRoute);

// Railway PORT handling
const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("PostgreSQL TinyLink Server Running!");
});

// Must use 0.0.0.0 for Railway
app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});
