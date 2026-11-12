const db = require('../config/db');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const ensureExists = require('../utils/ensureExists');

const SELECT_BASE = `
  SELECT dp.id_detalle, dp.id_pedido, dp.id_producto,
         p.nombre AS producto, dp.cantidad, dp.precio_unitario,
         (dp.cantidad * dp.precio_unitario)::numeric(12,2) AS subtotal
  FROM detalles_pedidos dp
  JOIN productos p ON p.id_producto = dp.id_producto`;

const obtenerPorId = async (id) => {
  const { rows } = await db.query(`${SELECT_BASE} WHERE dp.id_detalle = $1`, [id]);
  if (!rows.length) throw new AppError(`Detalle con id ${id} no existe`, 404);
  return rows[0];
};

exports.getAll = asyncHandler(async (req, res) => {
  const { rows } = await db.query(`${SELECT_BASE} ORDER BY dp.id_detalle`);
  res.json({ ok: true, data: rows });
});

exports.getById = asyncHandler(async (req, res) => {
  res.json({ ok: true, data: await obtenerPorId(req.params.id) });
});

exports.create = asyncHandler(async (req, res) => {
  const { id_pedido, id_producto, cantidad, precio_unitario } = req.body;
  const { rows } = await db.query(
    `INSERT INTO detalles_pedidos (id_pedido, id_producto, cantidad, precio_unitario)
     VALUES ($1, $2, $3, $4) RETURNING id_detalle`,
    [id_pedido, id_producto, cantidad, precio_unitario]
  );
  res.status(201).json({ ok: true, data: await obtenerPorId(rows[0].id_detalle) });
});

exports.update = asyncHandler(async (req, res) => {
  const { id_pedido, id_producto, cantidad, precio_unitario } = req.body;
  const { rowCount } = await db.query(
    `UPDATE detalles_pedidos
     SET id_pedido = $1, id_producto = $2, cantidad = $3, precio_unitario = $4
     WHERE id_detalle = $5`,
    [id_pedido, id_producto, cantidad, precio_unitario, req.params.id]
  );
  if (!rowCount) throw new AppError(`Detalle con id ${req.params.id} no existe`, 404);
  res.json({ ok: true, data: await obtenerPorId(req.params.id) });
});

exports.remove = asyncHandler(async (req, res) => {
  const { rowCount } = await db.query('DELETE FROM detalles_pedidos WHERE id_detalle = $1', [req.params.id]);
  if (!rowCount) throw new AppError(`Detalle con id ${req.params.id} no existe`, 404);
  res.json({ ok: true, message: 'Detalle de pedido eliminado correctamente' });
});

exports.getByPedido = asyncHandler(async (req, res) => {
  await ensureExists('pedidos', 'id_pedido', req.params.id_pedido, 'Pedido');
  const { rows } = await db.query(
    `${SELECT_BASE} WHERE dp.id_pedido = $1 ORDER BY dp.id_detalle`,
    [req.params.id_pedido]
  );
  res.json({ ok: true, data: rows });
});

exports.getByProducto = asyncHandler(async (req, res) => {
  await ensureExists('productos', 'id_producto', req.params.id_producto, 'Producto');
  const { rows } = await db.query(
    `${SELECT_BASE} WHERE dp.id_producto = $1 ORDER BY dp.id_detalle`,
    [req.params.id_producto]
  );
  res.json({ ok: true, data: rows });
});

// TOP N por suma de cantidades registradas en los detalles.
exports.getTopProductos = asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `SELECT p.nombre AS "nombreProducto",
            SUM(dp.cantidad)::int AS "cantidadTotalVendida"
     FROM productos p
     INNER JOIN detalles_pedidos dp ON dp.id_producto = p.id_producto
     GROUP BY p.id_producto, p.nombre
     ORDER BY SUM(dp.cantidad) DESC, p.nombre ASC
     LIMIT $1`,
    [req.params.n]
  );
  res.json({ ok: true, data: rows });
});
