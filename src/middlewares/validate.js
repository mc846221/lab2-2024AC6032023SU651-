const AppError = require('../utils/AppError');

const MAX_INT = 2147483647;

const validateId = (...nombres) => (req, res, next) => {
  for (const nombre of nombres) {
    const valor = req.params[nombre];
    if (!/^\d+$/.test(valor) || Number(valor) < 1 || Number(valor) > MAX_INT) {
      return next(new AppError(`El parámetro "${nombre}" debe ser un entero positivo`, 400));
    }
  }
  next();
};

const validateText = (nombre, max = 150) => (req, res, next) => {
  const valor = (req.params[nombre] || '').trim();
  if (!valor || valor.length > max) {
    return next(new AppError(`El parámetro "${nombre}" es obligatorio (máx. ${max} caracteres)`, 400));
  }
  req.params[nombre] = valor;
  next();
};

const validateBody = (reglas) => (req, res, next) => {
  const errores = [];
  const body = req.body && typeof req.body === 'object' ? req.body : {};

  for (const [campo, regla] of Object.entries(reglas)) {
    let valor = body[campo];
    const vacio = valor === undefined || valor === null ||
      (typeof valor === 'string' && valor.trim() === '');

    if (vacio) {
      if (regla.required) errores.push(`"${campo}" es obligatorio`);
      delete body[campo];
      continue;
    }

    if (regla.type === 'integer') {
      if (typeof valor === 'string' && /^\d+$/.test(valor)) valor = Number(valor);
      const min = regla.min ?? 1;
      const max = regla.max ?? MAX_INT;
      if (!Number.isInteger(valor) || valor < min || valor > max) {
        errores.push(`"${campo}" debe ser un entero entre ${min} y ${max}`);
        continue;
      }
    } else if (regla.type === 'number') {
      valor = Number(valor);
      if (!Number.isFinite(valor) || valor < (regla.min ?? 0)) {
        errores.push(`"${campo}" debe ser un número válido`);
        continue;
      }
    } else {
      if (typeof valor !== 'string') {
        errores.push(`"${campo}" debe ser texto`);
        continue;
      }
      valor = valor.trim();
      if (regla.min && valor.length < regla.min) {
        errores.push(`"${campo}" debe tener al menos ${regla.min} caracteres`);
        continue;
      }
      if (regla.max && valor.length > regla.max) {
        errores.push(`"${campo}" no puede superar ${regla.max} caracteres`);
        continue;
      }
      if (regla.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
        errores.push(`"${campo}" debe tener un correo válido`);
        continue;
      }
      if (regla.enum && !regla.enum.includes(valor)) {
        errores.push(`"${campo}" debe ser uno de estos valores: ${regla.enum.join(', ')}`);
        continue;
      }
    }
    body[campo] = valor;
  }

  if (errores.length) return next(new AppError('Datos inválidos', 400, errores));
  req.body = body;
  next();
};

const validateTopN = (req, res, next) => {
  const n = Number(req.params.n);
  if (!/^\d+$/.test(req.params.n) || !Number.isInteger(n) || n < 1 || n > 100) {
    return next(new AppError('El parámetro "n" debe ser un entero entre 1 y 100', 400));
  }
  req.params.n = n;
  next();
};

module.exports = { validateId, validateText, validateBody, validateTopN };
