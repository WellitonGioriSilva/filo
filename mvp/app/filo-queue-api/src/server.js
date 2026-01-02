require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes_auth');
const shopRoutes = require('./routes_shop');
const queueRoutes = require('./routes_queue');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json({ ok: true, name: 'filo-queue-api' }));
app.use('/auth', authRoutes);
app.use('/shops', shopRoutes);
app.use('/queue', queueRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
