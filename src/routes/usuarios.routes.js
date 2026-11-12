const router = require('express').Router();
const c = require('../controllers/usuarios.controller');
const { validateId, validateText, validateBody } = require('../middlewares/validate');

const reglas = {
  nombre: { type: 'string', required: true, min: 2, max: 100 },
  apellido: { type: 'string', required: true, min: 2, max: 100 },
  correo: { type: 'string', required: true, max: 150, email: true },
};

// Consultas específicas antes de /:id para evitar conflictos.
router.get('/nombre/:nombre', validateText('nombre'), c.getByNombre);
router.get('/apellido/:apellido', validateText('apellido'), c.getByApellido);
router.get('/correo/:correo', validateText('correo'), c.getByCorreo);

router.get('/', c.getAll);
router.get('/:id', validateId('id'), c.getById);
router.post('/', validateBody(reglas), c.create);
router.put('/:id', validateId('id'), validateBody(reglas), c.update);
router.delete('/:id', validateId('id'), c.remove);

module.exports = router;
