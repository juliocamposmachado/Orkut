require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Servir estáticos
app.use(express.static(path.join(__dirname, '..', 'public')));

// Rotas API
app.use('/api', require('./routes/sync'));

const port = process.env.PORT || 3000;
app.listen(port, ()=>{
  console.log(`Orkut2025 server on http://localhost:${port}`);
});
