from database import conectar
from repositories.producto_repository import CONSULTA_PRODUCTO


def listar_productos(usuario_id):
    # Se devuelven los productos completos, porque el carrito muestra nombre y precio
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute(
        CONSULTA_PRODUCTO
        + " WHERE p.id IN (SELECT producto_id FROM carrito WHERE usuario_id = %s) ORDER BY p.id",
        (usuario_id,),
    )
    productos = cursor.fetchall()
    conexion.close()
    return productos


def existe(usuario_id, producto_id):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute(
        "SELECT producto_id FROM carrito WHERE usuario_id = %s AND producto_id = %s",
        (usuario_id, producto_id),
    )
    fila = cursor.fetchone()
    conexion.close()
    return fila is not None


def agregar(usuario_id, producto_id):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute(
        "INSERT INTO carrito (usuario_id, producto_id) VALUES (%s, %s)",
        (usuario_id, producto_id),
    )
    conexion.commit()
    conexion.close()


def quitar(usuario_id, producto_id):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute(
        "DELETE FROM carrito WHERE usuario_id = %s AND producto_id = %s",
        (usuario_id, producto_id),
    )
    conexion.commit()
    conexion.close()


def vaciar(usuario_id):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute("DELETE FROM carrito WHERE usuario_id = %s", (usuario_id,))
    conexion.commit()
    conexion.close()


def quitar_de_todos(producto_id):
    # Saca un producto de los carritos de todos los usuarios
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute("DELETE FROM carrito WHERE producto_id = %s", (producto_id,))
    conexion.commit()
    conexion.close()