const router = require('express').Router();
const c = require('../controllers/pedidos.controller');
const { validateId, validateBody } = require('../middlewares/validate');

const estados = ['Pendiente', 'Procesando', 'Enviado', 'Entregado', 'Cancelado'];
const reglas = {
  id_usuario: { type: 'integer', required: true },
  fecha_pedido: { type: 'string', required: false, max: 30 },
  estado: { type: 'string', required: true, max: 30, enum: estados },
};

router.get('/cliente/:id_usuario', validateId('id_usuario'), c.getByUsuario);

router.get('/', c.getAll);
router.get('/:id', validateId('id'), c.getById);
router.post('/', validateBody(reglas), c.create);
router.put('/:id', validateId('id'), validateBody(reglas), c.update);
router.delete('/:id', validateId('id'), c.remove);

module.exports = router;
