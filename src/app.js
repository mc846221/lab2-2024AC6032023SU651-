const express = require('express');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ ok: true, message: 'Web API pedidosDB funcionando', docs: '/api' });
});

app.use('/api', routes);

// Estos middlewares siempre deben ir al final.
app.use(notFound);
app.use(errorHandler);

module.exports = app;
