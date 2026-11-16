from database import conectar


def listar_ids(usuario_id):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute(
        "SELECT producto_id FROM favoritos WHERE usuario_id = %s ORDER BY producto_id",
        (usuario_id,),
    )
    filas = cursor.fetchall()
    conexion.close()
    # React solo necesita la lista de ids: [3, 5]
    ids = []
    for fila in filas:
        ids.append(fila["producto_id"])
    return ids


def existe(usuario_id, producto_id):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute(
        "SELECT producto_id FROM favoritos WHERE usuario_id = %s AND producto_id = %s",
        (usuario_id, producto_id),
    )
    fila = cursor.fetchone()
    conexion.close()
    return fila is not None


def agregar(usuario_id, producto_id):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute(
        "INSERT INTO favoritos (usuario_id, producto_id) VALUES (%s, %s)",
        (usuario_id, producto_id),
    )
    conexion.commit()
    conexion.close()


def quitar(usuario_id, producto_id):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute(
        "DELETE FROM favoritos WHERE usuario_id = %s AND producto_id = %s",
        (usuario_id, producto_id),
    )
    conexion.commit()
    conexion.close()
