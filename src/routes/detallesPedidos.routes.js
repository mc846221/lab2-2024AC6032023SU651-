const router = require('express').Router();
const c = require('../controllers/detallesPedidos.controller');
const { validateId, validateBody, validateTopN } = require('../middlewares/validate');

const reglas = {
  id_pedido: { type: 'integer', required: true },
  id_producto: { type: 'integer', required: true },
  cantidad: { type: 'integer', required: true, min: 1 },
  precio_unitario: { type: 'number', required: true, min: 0 },
};

// Consultas específicas antes de /:id.
router.get('/pedido/:id_pedido', validateId('id_pedido'), c.getByPedido);
router.get('/producto/:id_producto', validateId('id_producto'), c.getByProducto);
router.get('/top-productos/:n', validateTopN, c.getTopProductos);

router.get('/', c.getAll);
router.get('/:id', validateId('id'), c.getById);
router.post('/', validateBody(reglas), c.create);
router.put('/:id', validateId('id'), validateBody(reglas), c.update);
router.delete('/:id', validateId('id'), c.remove);

module.exports = router;
