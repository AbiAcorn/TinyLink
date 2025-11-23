require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// your routes here
app.get('/', (req, res) => res.send('TinyLink running!'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
