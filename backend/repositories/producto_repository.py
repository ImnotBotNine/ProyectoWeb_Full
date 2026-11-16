from database import conectar

# React recibe la categoría con el nombre "categoria" y también su nombre visible
CONSULTA_PRODUCTO = """
    SELECT p.id, p.nombre, p.categoria_id AS categoria, c.nombre AS categoria_nombre,
           p.estado, p.precio, p.descripcion, p.vendedor, p.carrera, p.contacto,
           p.imagen, p.usuario_id
    FROM productos p
    JOIN categorias c ON c.id = p.categoria_id
"""


def listar():
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute(CONSULTA_PRODUCTO + " ORDER BY p.id")
    productos = cursor.fetchall()
    conexion.close()
    return productos


def buscar(producto_id):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute(CONSULTA_PRODUCTO + " WHERE p.id = %s", (producto_id,))
    producto = cursor.fetchone()
    conexion.close()
    return producto


def listar_de_usuario(usuario_id):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute(CONSULTA_PRODUCTO + " WHERE p.usuario_id = %s ORDER BY p.id", (usuario_id,))
    productos = cursor.fetchall()
    conexion.close()
    return productos


def crear(datos, usuario_id):
    # Devuelve el id del producto nuevo
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute(
        """
        INSERT INTO productos (nombre, categoria_id, estado, precio, descripcion,
                               vendedor, carrera, contacto, imagen, usuario_id)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id
        """,
        (datos.nombre, datos.categoria, datos.estado, datos.precio, datos.descripcion,
         datos.vendedor, datos.carrera, datos.contacto, datos.imagen, usuario_id),
    )
    nuevo_id = cursor.fetchone()["id"]
    conexion.commit()
    conexion.close()
    return nuevo_id


def actualizar(producto_id, datos):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute(
        """
        UPDATE productos
        SET nombre = %s, categoria_id = %s, estado = %s, precio = %s, descripcion = %s,
            vendedor = %s, carrera = %s, contacto = %s, imagen = %s
        WHERE id = %s
        """,
        (datos.nombre, datos.categoria, datos.estado, datos.precio, datos.descripcion,
         datos.vendedor, datos.carrera, datos.contacto, datos.imagen, producto_id),
    )
    conexion.commit()
    conexion.close()


def eliminar(producto_id):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute("DELETE FROM productos WHERE id = %s", (producto_id,))
    conexion.commit()
    conexion.close()


def esta_en_un_pedido(producto_id):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute("SELECT id FROM detalle_pedido WHERE producto_id = %s", (producto_id,))
    fila = cursor.fetchone()
    conexion.close()
    return fila is not None
