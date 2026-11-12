BEGIN;

DROP TABLE IF EXISTS detalles_pedidos;
DROP TABLE IF EXISTS pedidos;
DROP TABLE IF EXISTS productos;
DROP TABLE IF EXISTS usuarios;

CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE
);

CREATE TABLE productos (
    id_producto SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    precio NUMERIC(10,2) NOT NULL CHECK (precio >= 0)
);

CREATE TABLE pedidos (
    id_pedido SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    fecha_pedido TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(30) NOT NULL DEFAULT 'Pendiente'
        CHECK (estado IN ('Pendiente', 'Procesando', 'Enviado', 'Entregado', 'Cancelado'))
);

CREATE TABLE detalles_pedidos (
    id_detalle SERIAL PRIMARY KEY,
    id_pedido INTEGER NOT NULL REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    id_producto INTEGER NOT NULL REFERENCES productos(id_producto),
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10,2) NOT NULL CHECK (precio_unitario >= 0)
);

INSERT INTO usuarios (nombre, apellido, correo) VALUES
('Ana', 'Martínez', 'ana@gmail.com'),
('Carlos', 'López', 'carlos@gmail.com'),
('María', 'Hernández', 'maria@gmail.com'),
('José', 'Ramírez', 'jose@gmail.com');

INSERT INTO productos (nombre, precio) VALUES
('Teclado', 25.00),
('Mouse', 15.00),
('Monitor', 180.00),
('Audífonos', 35.00),
('Memoria USB', 10.00);

INSERT INTO pedidos (id_usuario, fecha_pedido, estado) VALUES
(1, '2026-10-01 10:00:00', 'Entregado'),
(2, '2026-10-02 11:30:00', 'Enviado'),
(1, '2026-10-03 09:15:00', 'Procesando'),
(3, '2026-10-04 14:00:00', 'Entregado');

INSERT INTO detalles_pedidos (id_pedido, id_producto, cantidad, precio_unitario) VALUES
(1, 1, 2, 25.00),
(1, 2, 1, 15.00),
(2, 2, 3, 15.00),
(2, 3, 1, 180.00),
(3, 1, 1, 25.00),
(3, 4, 2, 35.00),
(4, 5, 5, 10.00),
(4, 2, 2, 15.00);

COMMIT;
