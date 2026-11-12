const router = require('express').Router();

router.use('/usuarios', require('./usuarios.routes'));
router.use('/pedidos', require('./pedidos.routes'));
router.use('/detalles-pedidos', require('./detallesPedidos.routes'));

module.exports = router;
