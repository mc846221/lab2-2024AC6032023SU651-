require('dotenv').config();
const app = require('./app');
const db = require('./config/db');

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
  try {
    await db.query('SELECT 1');
    console.log('Conexión a PostgreSQL correcta');
  } catch (err) {
    console.error('No se pudo conectar a PostgreSQL:', err.message);
  }
});
