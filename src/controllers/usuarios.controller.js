const db = require('../config/db');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const SELECT_BASE = `
  SELECT id_usuario, nombre, apellido, correo
  FROM usuarios`;

const obtenerPorId = async (id) => {
  const { rows } = await db.query(`${SELECT_BASE} WHERE id_usuario = $1`, [id]);
  if (!rows.length) throw new AppError(`Usuario con id ${id} no existe`, 404);
  return rows[0];
};

exports.getAll = asyncHandler(async (req, res) => {
  const { rows } = await db.query(`${SELECT_BASE} ORDER BY id_usuario`);
  res.json({ ok: true, data: rows });
});

exports.getById = asyncHandler(async (req, res) => {
  res.json({ ok: true, data: await obtenerPorId(req.params.id) });
});

exports.create = asyncHandler(async (req, res) => {
  const { nombre, apellido, correo } = req.body;
  const { rows } = await db.query(
    `INSERT INTO usuarios (nombre, apellido, correo)
     VALUES ($1, $2, $3) RETURNING id_usuario`,
    [nombre, apellido, correo]
  );
  res.status(201).json({ ok: true, data: await obtenerPorId(rows[0].id_usuario) });
});

exports.update = asyncHandler(async (req, res) => {
  const { nombre, apellido, correo } = req.body;
  const { rowCount } = await db.query(
    `UPDATE usuarios SET nombre = $1, apellido = $2, correo = $3
     WHERE id_usuario = $4`,
    [nombre, apellido, correo, req.params.id]
  );
  if (!rowCount) throw new AppError(`Usuario con id ${req.params.id} no existe`, 404);
  res.json({ ok: true, data: await obtenerPorId(req.params.id) });
});

exports.remove = asyncHandler(async (req, res) => {
  const { rowCount } = await db.query('DELETE FROM usuarios WHERE id_usuario = $1', [req.params.id]);
  if (!rowCount) throw new AppError(`Usuario con id ${req.params.id} no existe`, 404);
  res.json({ ok: true, message: 'Usuario eliminado correctamente' });
});

exports.getByNombre = asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `${SELECT_BASE} WHERE nombre ILIKE $1 ORDER BY id_usuario`,
    [`%${req.params.nombre}%`]
  );
  res.json({ ok: true, data: rows });
});

exports.getByApellido = asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `${SELECT_BASE} WHERE apellido ILIKE $1 ORDER BY id_usuario`,
    [`%${req.params.apellido}%`]
  );
  res.json({ ok: true, data: rows });
});

exports.getByCorreo = asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `${SELECT_BASE} WHERE correo ILIKE $1 ORDER BY id_usuario`,
    [`%${req.params.correo}%`]
  );
  res.json({ ok: true, data: rows });
});
