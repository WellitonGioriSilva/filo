const express = require('express');
const cors = require('cors');
require('dotenv').config();

const routes = require('./server/routes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', routes);

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
