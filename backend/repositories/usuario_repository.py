from database import conectar


def buscar_por_id(usuario_id):
    # Datos mínimos para saber quién hace la petición y su rol
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute("SELECT id, nick, rol FROM usuarios WHERE id = %s", (usuario_id,))
    usuario = cursor.fetchone()
    conexion.close()
    return usuario


def buscar_por_credenciales(nick, contrasena):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute(
        "SELECT id, nick, rol, nombre, carrera, telefono FROM usuarios WHERE nick = %s AND contrasena = %s",
        (nick, contrasena),
    )
    usuario = cursor.fetchone()
    conexion.close()
    return usuario


def existe_nick(nick):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute("SELECT id FROM usuarios WHERE nick = %s", (nick,))
    fila = cursor.fetchone()
    conexion.close()
    return fila is not None


def crear(datos):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute(
        """
        INSERT INTO usuarios (nick, contrasena, rol, nombre, carrera, telefono)
        VALUES (%s, %s, 'usuario', %s, %s, %s)
        RETURNING id, nick, rol, nombre, carrera, telefono
        """,
        (datos.nick, datos.contrasena, datos.nombre, datos.carrera, datos.telefono),
    )
    usuario = cursor.fetchone()
    conexion.commit()
    conexion.close()
    return usuario


def buscar_perfil(usuario_id):
    # Datos de la cuenta y cuántos productos ha publicado, comprado y vendido
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute(
        """
        SELECT u.id, u.nick, u.rol, u.nombre, u.carrera, u.telefono,
               (SELECT COUNT(*) FROM productos p WHERE p.usuario_id = u.id) AS publicados,
               (SELECT COUNT(*) FROM pedidos o WHERE o.usuario_id = u.id) AS compras,
               (SELECT COUNT(*) FROM pedidos o WHERE o.vendedor_id = u.id) AS ventas
        FROM usuarios u
        WHERE u.id = %s
        """,
        (usuario_id,),
    )
    usuario = cursor.fetchone()
    conexion.close()
    return usuario
