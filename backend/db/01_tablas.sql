-- Infraganti Marketplace: tablas de la base de datos (PostgreSQL)
-- Ejecutar conectado a la base "infraganti":
--   psql -U postgres -d infraganti -f db/01_tablas.sql

-- Se borran en orden inverso para poder volver a ejecutar el script
DROP TABLE IF EXISTS carrito;
DROP TABLE IF EXISTS favoritos;
DROP TABLE IF EXISTS detalle_pedido;
DROP TABLE IF EXISTS pedidos;
DROP TABLE IF EXISTS productos;
DROP TABLE IF EXISTS categorias;
DROP TABLE IF EXISTS usuarios;

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nick VARCHAR(30) NOT NULL UNIQUE,
    contrasena VARCHAR(60) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'usuario',
    nombre VARCHAR(60) NOT NULL,
    carrera VARCHAR(60),
    -- Teléfono para coordinar la entrega (solo lo ven comprador y vendedor)
    telefono VARCHAR(20),
    CHECK (rol IN ('usuario', 'admin'))
);

-- El id es un texto corto porque React ya usa estos valores ("libros", "otros"...)
CREATE TABLE categorias (
    id VARCHAR(30) PRIMARY KEY,
    nombre VARCHAR(60) NOT NULL
);

CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL,
    categoria_id VARCHAR(30) NOT NULL REFERENCES categorias(id),
    estado VARCHAR(20) NOT NULL DEFAULT 'disponible',
    precio INTEGER NOT NULL,
    descripcion VARCHAR(300) NOT NULL,
    vendedor VARCHAR(60) NOT NULL,
    carrera VARCHAR(60) NOT NULL,
    contacto VARCHAR(60) NOT NULL,
    imagen TEXT NOT NULL DEFAULT '',
    -- Cuenta que publicó el producto (vendedor). NULL = producto de prueba del Taller 2
    usuario_id INTEGER REFERENCES usuarios(id),
    CHECK (estado IN ('disponible', 'vendido')),
    CHECK (precio >= 0)
);

-- Un pedido es entre un comprador (usuario_id) y un vendedor (vendedor_id).
-- Pago contra entrega: el vendedor acepta o rechaza, y al entregar registra el pago.
--   pendiente -> aceptado (vendedor) -> entregado (vendedor, pagado al entregar)
--   pendiente -> rechazado (vendedor) | cancelado (comprador)
CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    vendedor_id INTEGER NOT NULL REFERENCES usuarios(id),
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    total INTEGER NOT NULL DEFAULT 0,
    fecha_entrega TIMESTAMP,
    CHECK (estado IN ('pendiente', 'aceptado', 'rechazado', 'entregado', 'cancelado')),
    CHECK (total >= 0),
    CHECK (usuario_id <> vendedor_id)
);

-- Cada fila es un producto dentro de un pedido
CREATE TABLE detalle_pedido (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES productos(id),
    cantidad INTEGER NOT NULL DEFAULT 1,
    precio_unitario INTEGER NOT NULL,
    CHECK (cantidad > 0),
    CHECK (precio_unitario >= 0),
    UNIQUE (pedido_id, producto_id)
);

-- Productos que cada usuario marcó con el corazón
-- Si se elimina el producto, también se borra de favoritos
CREATE TABLE favoritos (
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    PRIMARY KEY (usuario_id, producto_id)
);

-- Productos que cada usuario tiene en su carrito (uno de cada uno, son usados)
CREATE TABLE carrito (
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    PRIMARY KEY (usuario_id, producto_id)
);
