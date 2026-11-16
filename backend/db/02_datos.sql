-- Infraganti Marketplace: datos de prueba (PostgreSQL)
-- Ejecutar después de 01_tablas.sql:
--   psql -U postgres -d infraganti -f db/02_datos.sql

-- El administrador (id 1) y los 9 estudiantes vendedores de los productos (ids 2 a 10)
INSERT INTO usuarios (nick, contrasena, rol, nombre, carrera, telefono) VALUES
-- Teléfonos de prueba (no son reales)
('admin', 'admin123', 'admin', 'Administrador', 'Informática', '+56 9 4120 3381'),
('mrojas', 'mrojas123', 'usuario', 'Matías Rojas', 'Ingeniería', '+56 9 6234 7710'),
('cperez', 'cperez123', 'usuario', 'Camila Pérez', 'Ingeniería', '+56 9 7381 2245'),
('dgonzalez', 'dgonzalez123', 'usuario', 'Diego González', 'Informática', '+56 9 5527 9036'),
('vsoto', 'vsoto123', 'usuario', 'Valentina Soto', 'Diseño', '+56 9 8812 4470'),
('smunoz', 'smunoz123', 'usuario', 'Sebastián Muñoz', 'Arquitectura', '+56 9 6649 1123'),
('ftorres', 'ftorres123', 'usuario', 'Felipe Torres', 'Educación Física', '+56 9 7190 5582'),
('jsilva', 'jsilva123', 'usuario', 'Javiera Silva', 'Diseño', '+56 9 5903 6617'),
('nfuentes', 'nfuentes123', 'usuario', 'Nicolás Fuentes', 'Informática', '+56 9 8345 2290'),
('fdiaz', 'fdiaz123', 'usuario', 'Francisca Díaz', 'Administración', '+56 9 6078 4451');

INSERT INTO categorias (id, nombre) VALUES
('libros', 'Libros'),
('computadores', 'Computadores'),
('accesorios', 'Accesorios'),
('instrumentos', 'Instrumentos'),
('deportes', 'Artículos deportivos'),
('otros', 'Otros productos');

-- Cada producto pertenece a su vendedor (usuario_id)
INSERT INTO productos (nombre, categoria_id, estado, precio, descripcion, vendedor, carrera, contacto, imagen, usuario_id) VALUES
('Calculadora Científica Escolar 240', 'otros', 'disponible', 15000, 'Calculadora científica en buen estado, ideal para estudiantes de ingeniería.', 'Matías Rojas', 'Ingeniería', 'Campus Santiago', '/assets/images/products/calculadora.jpg', 2),
('Libro Cálculo I Universitario', 'libros', 'disponible', 22000, 'Libro de cálculo utilizado durante el primer año universitario. Buen estado.', 'Camila Pérez', 'Ingeniería', 'Campus Santiago', '/assets/images/products/calculo.jpg', 3),
('Notebook Lenovo Ideapad Slim 3', 'computadores', 'disponible', 450000, 'Notebook para estudio y trabajo. Incluye cargador y se encuentra en buen estado.', 'Diego González', 'Informática', 'Campus Santiago', '/assets/images/products/notebook.jpg', 4),
('Audifonos Bluetooh Active Silence Studio', 'accesorios', 'disponible', 25000, 'Audífonos inalámbricos con estuche de carga y buena autonomía.', 'Valentina Soto', 'Diseño', 'Campus Santiago', '/assets/images/products/audifonos.jpg', 5),
('Guitarra Acústica Vizcaya Arcg44 Cuerdas De Nylon Sunburst', 'instrumentos', 'disponible', 85000, 'Guitarra acústica ideal para principiantes. Incluye funda.', 'Sebastián Muñoz', 'Arquitectura', 'Campus Santiago', '/assets/images/products/guitarra.jpg', 6),
('Balón De Futbol Dribbling Drb Prime N°5', 'deportes', 'disponible', 12000, 'Balón de fútbol en buen estado para entrenamientos y partidos.', 'Felipe Torres', 'Educación Física', 'Campus Santiago', '/assets/images/products/balon.jpg', 7),
('Mouse Inalámbrico Hp 150', 'accesorios', 'disponible', 10000, 'Mouse inalámbrico compacto y cómodo para estudiar o trabajar.', 'Javiera Silva', 'Diseño', 'Campus Santiago', '/assets/images/products/mouse.jpg', 8),
('Libro Programación Java', 'libros', 'disponible', 18000, 'Libro introductorio de programación en Java para estudiantes.', 'Nicolás Fuentes', 'Informática', 'Campus Santiago', '/assets/images/products/java.jpg', 9),
('Mochila Notebook Impermeable Antirrobo', 'otros', 'disponible', 20000, 'Mochila con compartimento para notebook y múltiples bolsillos.', 'Francisca Díaz', 'Administración', 'Campus Santiago', '/assets/images/products/mochila.jpg', 10);

-- Pedidos: parten vacíos; se crean desde el carrito con "Solicitar compra"

-- Favoritos de ejemplo de Matías Rojas (id 2). Los carritos parten vacíos para todos
INSERT INTO favoritos (usuario_id, producto_id) VALUES (2, 3), (2, 5);
