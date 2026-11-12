const db = require('../config/db');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const ensureExists = require('../utils/ensureExists');

const SELECT_BASE = `
  SELECT p.id_pedido, p.id_usuario, u.nombre || ' ' || u.apellido AS cliente,
         p.fecha_pedido, p.estado
  FROM pedidos p
  JOIN usuarios u ON u.id_usuario = p.id_usuario`;

const obtenerPorId = async (id) => {
  const { rows } = await db.query(`${SELECT_BASE} WHERE p.id_pedido = $1`, [id]);
  if (!rows.length) throw new AppError(`Pedido con id ${id} no existe`, 404);
  return rows[0];
};

exports.getAll = asyncHandler(async (req, res) => {
  const { rows } = await db.query(`${SELECT_BASE} ORDER BY p.id_pedido`);
  res.json({ ok: true, data: rows });
});

exports.getById = asyncHandler(async (req, res) => {
  res.json({ ok: true, data: await obtenerPorId(req.params.id) });
});

exports.create = asyncHandler(async (req, res) => {
  const { id_usuario, fecha_pedido, estado } = req.body;
  const { rows } = await db.query(
    `INSERT INTO pedidos (id_usuario, fecha_pedido, estado)
     VALUES ($1, COALESCE($2, CURRENT_TIMESTAMP), COALESCE($3, 'Pendiente'))
     RETURNING id_pedido`,
    [id_usuario, fecha_pedido || null, estado || null]
  );
  res.status(201).json({ ok: true, data: await obtenerPorId(rows[0].id_pedido) });
});

exports.update = asyncHandler(async (req, res) => {
  const { id_usuario, fecha_pedido, estado } = req.body;
  const { rowCount } = await db.query(
    `UPDATE pedidos SET id_usuario = $1,
       fecha_pedido = COALESCE($2, fecha_pedido),
       estado = $3
     WHERE id_pedido = $4`,
    [id_usuario, fecha_pedido || null, estado, req.params.id]
  );
  if (!rowCount) throw new AppError(`Pedido con id ${req.params.id} no existe`, 404);
  res.json({ ok: true, data: await obtenerPorId(req.params.id) });
});

exports.remove = asyncHandler(async (req, res) => {
  const { rowCount } = await db.query('DELETE FROM pedidos WHERE id_pedido = $1', [req.params.id]);
  if (!rowCount) throw new AppError(`Pedido con id ${req.params.id} no existe`, 404);
  res.json({ ok: true, message: 'Pedido eliminado correctamente' });
});

exports.getByUsuario = asyncHandler(async (req, res) => {
  await ensureExists('usuarios', 'id_usuario', req.params.id_usuario, 'Usuario');
  const { rows } = await db.query(
    `${SELECT_BASE} WHERE p.id_usuario = $1 ORDER BY p.fecha_pedido DESC`,
    [req.params.id_usuario]
  );
  res.json({ ok: true, data: rows });
});
