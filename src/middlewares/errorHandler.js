const AppError = require('../utils/AppError');

const notFound = (req, res, next) => {
  next(new AppError(`Ruta no encontrada: ${req.method} ${req.originalUrl}`, 404));
};

// Todas las respuestas de error se centralizan aquí.
const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message;
  let details = err.details;

  if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'El cuerpo de la petición no es un JSON válido';
  } else if (err.code === '23505') {
    status = 409;
    message = 'Ya existe un registro con ese valor único';
    details = err.detail;
  } else if (err.code === '23503') {
    status = req.method === 'DELETE' ? 409 : 400;
    message = req.method === 'DELETE'
      ? 'No se puede eliminar: el registro tiene datos relacionados'
      : 'Una llave foránea indicada no existe';
    details = err.detail;
  } else if (err.code === '23502') {
    status = 400;
    message = `El campo "${err.column}" no puede ser nulo`;
  } else if (err.code === '23514') {
    status = 400;
    message = 'Un valor está fuera del rango permitido';
  } else if (err.code === '22P02' || err.code === '22003') {
    status = 400;
    message = 'Formato de dato inválido';
  } else if (!err.isOperational) {
    console.error(err);
    status = 500;
    message = 'Error interno del servidor';
    details = undefined;
  }

  const respuesta = { ok: false, status, message };
  if (details) respuesta.details = details;
  res.status(status).json(respuesta);
};

module.exports = { notFound, errorHandler };
