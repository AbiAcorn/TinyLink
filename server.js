require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const { Pool } = require('pg');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Example route
app.get('/', (req, res) => {
  res.send('TinyLink is running!');
});

// Use Railway's dynamic port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
