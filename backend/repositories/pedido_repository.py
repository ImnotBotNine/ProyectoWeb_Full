from database import conectar

# Datos del pedido junto con el nick y el teléfono del comprador y del vendedor
# (los pedidos solo los ven sus participantes, así que pueden coordinar la entrega)
CONSULTA_PEDIDO = """
    SELECT o.id, o.usuario_id, c.nick AS comprador, c.telefono AS comprador_telefono,
           o.vendedor_id, v.nick AS vendedor, v.nombre AS vendedor_nombre,
           v.telefono AS vendedor_telefono, o.fecha, o.estado, o.total, o.fecha_entrega
    FROM pedidos o
    JOIN usuarios c ON c.id = o.usuario_id
    JOIN usuarios v ON v.id = o.vendedor_id
"""


def detalle_de_pedido(cursor, pedido_id):
    cursor.execute(
        """
        SELECT d.producto_id, p.nombre, d.cantidad, d.precio_unitario
        FROM detalle_pedido d
        JOIN productos p ON p.id = d.producto_id
        WHERE d.pedido_id = %s
        ORDER BY d.id
        """,
        (pedido_id,),
    )
    return cursor.fetchall()


def buscar(pedido_id):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute(CONSULTA_PEDIDO + " WHERE o.id = %s", (pedido_id,))
    pedido = cursor.fetchone()

    if pedido is not None:
        pedido["detalle"] = detalle_de_pedido(cursor, pedido_id)
    conexion.close()
    return pedido


def listar_donde(columna, usuario_id):
    # columna es "o.usuario_id" (mis compras) o "o.vendedor_id" (mis ventas)
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute(CONSULTA_PEDIDO + " WHERE " + columna + " = %s ORDER BY o.id DESC", (usuario_id,))
    pedidos = cursor.fetchall()

    for pedido in pedidos:
        pedido["detalle"] = detalle_de_pedido(cursor, pedido["id"])
    conexion.close()
    return pedidos


def listar_compras(usuario_id):
    return listar_donde("o.usuario_id", usuario_id)


def listar_ventas(usuario_id):
    return listar_donde("o.vendedor_id", usuario_id)


def tiene_pedido_en_curso(producto_id):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute(
        """
        SELECT o.id FROM detalle_pedido d
        JOIN pedidos o ON o.id = d.pedido_id
        WHERE d.producto_id = %s AND o.estado IN ('pendiente', 'aceptado')
        """,
        (producto_id,),
    )
    fila = cursor.fetchone()
    conexion.close()
    return fila is not None


def crear_desde_carrito(usuario_id, por_vendedor):
    # por_vendedor = {id_vendedor: [productos]}. Crea un pedido por vendedor con su
    # detalle y vacía el carrito. Todo se guarda junto (un solo commit):
    # si algo falla antes, no se guarda nada. Devuelve los ids de los pedidos.
    conexion = conectar()
    cursor = conexion.cursor()
    ids_pedidos = []

    for vendedor_id in por_vendedor:
        lista = por_vendedor[vendedor_id]
        total = 0
        for producto in lista:
            total = total + producto["precio"]

        cursor.execute(
            "INSERT INTO pedidos (usuario_id, vendedor_id, estado, total) VALUES (%s, %s, 'pendiente', %s) RETURNING id",
            (usuario_id, vendedor_id, total),
        )
        pedido_id = cursor.fetchone()["id"]
        ids_pedidos.append(pedido_id)

        for producto in lista:
            cursor.execute(
                "INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio_unitario) VALUES (%s, %s, 1, %s)",
                (pedido_id, producto["id"], producto["precio"]),
            )

    cursor.execute("DELETE FROM carrito WHERE usuario_id = %s", (usuario_id,))
    conexion.commit()
    conexion.close()
    return ids_pedidos


def aceptar(pedido_id, ids_productos):
    # El pedido queda aceptado y sus productos vendidos y fuera de todos los carritos
    conexion = conectar()
    cursor = conexion.cursor()
    for producto_id in ids_productos:
        cursor.execute("UPDATE productos SET estado = 'vendido' WHERE id = %s", (producto_id,))
        cursor.execute("DELETE FROM carrito WHERE producto_id = %s", (producto_id,))
    cursor.execute("UPDATE pedidos SET estado = 'aceptado' WHERE id = %s", (pedido_id,))
    conexion.commit()
    conexion.close()


def marcar_entregado(pedido_id):
    # Pago contra entrega: se registra el momento de la entrega y el pago
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute(
        "UPDATE pedidos SET estado = 'entregado', fecha_entrega = CURRENT_TIMESTAMP WHERE id = %s",
        (pedido_id,),
    )
    conexion.commit()
    conexion.close()


def cambiar_estado(pedido_id, estado):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute("UPDATE pedidos SET estado = %s WHERE id = %s", (estado, pedido_id))
    conexion.commit()
    conexion.close()
