// Envía automáticamente los errores de funciones async al middleware central.
module.exports = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
