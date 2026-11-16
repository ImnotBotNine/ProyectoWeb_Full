from fastapi import HTTPException

from repositories import carrito_repository, pedido_repository
from services.sesion_service import exigir_mismo_usuario, usuario_actual

# Pago contra entrega: cambios de estado permitidos y quién puede hacerlos
CAMBIOS_PEDIDO = {
    "pendiente": {"aceptado": "vendedor", "rechazado": "vendedor", "cancelado": "comprador"},
    "aceptado": {"entregado": "vendedor"},
    "rechazado": {},
    "entregado": {},
    "cancelado": {},
}


def listar_compras(usuario_id, x_usuario_id):
    # Mis compras: pedidos donde el usuario es el comprador
    usuario = usuario_actual(x_usuario_id)
    exigir_mismo_usuario(usuario, usuario_id)
    return pedido_repository.listar_compras(usuario_id)


def listar_ventas(usuario_id, x_usuario_id):
    # Mis ventas: pedidos donde el usuario es el vendedor
    usuario = usuario_actual(x_usuario_id)
    exigir_mismo_usuario(usuario, usuario_id)
    return pedido_repository.listar_ventas(usuario_id)


def crear_desde_carrito(usuario_id, x_usuario_id):
    # Convierte el carrito en solicitudes de compra: un pedido por cada vendedor
    usuario = usuario_actual(x_usuario_id)
    exigir_mismo_usuario(usuario, usuario_id)

    productos = carrito_repository.listar_productos(usuario_id)
    if len(productos) == 0:
        raise HTTPException(status_code=400, detail="El carrito está vacío")

    # Reglas de negocio antes de guardar nada
    for producto in productos:
        if producto["estado"] == "vendido":
            raise HTTPException(status_code=409, detail="El producto " + producto["nombre"] + " ya fue vendido")
        if producto["usuario_id"] == usuario_id:
            raise HTTPException(status_code=409, detail="No puedes comprar tu propio producto")
        if producto["usuario_id"] is None:
            raise HTTPException(status_code=409, detail="El producto " + producto["nombre"] + " no tiene vendedor")
        if pedido_repository.tiene_pedido_en_curso(producto["id"]):
            raise HTTPException(status_code=409, detail="El producto " + producto["nombre"] + " ya tiene un pedido en curso")

    # Agrupa los productos por vendedor: {id_vendedor: [productos]}
    por_vendedor = {}
    for producto in productos:
        if producto["usuario_id"] not in por_vendedor:
            por_vendedor[producto["usuario_id"]] = []
        por_vendedor[producto["usuario_id"]].append(producto)

    ids_pedidos = pedido_repository.crear_desde_carrito(usuario_id, por_vendedor)

    pedidos = []
    for pedido_id in ids_pedidos:
        pedidos.append(pedido_repository.buscar(pedido_id))
    return pedidos


def buscar_o_404(pedido_id):
    pedido = pedido_repository.buscar(pedido_id)
    if pedido is None:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    return pedido


def obtener(pedido_id, x_usuario_id):
    usuario = usuario_actual(x_usuario_id)
    pedido = buscar_o_404(pedido_id)

    # Lo pueden ver el comprador, el vendedor o un administrador
    participa = usuario["id"] in (pedido["usuario_id"], pedido["vendedor_id"])
    if not participa and usuario["rol"] != "admin":
        raise HTTPException(status_code=403, detail="No participas en este pedido")
    return pedido


def cambiar_estado(pedido_id, nuevo_estado, x_usuario_id):
    if nuevo_estado not in ["aceptado", "rechazado", "entregado", "cancelado"]:
        raise HTTPException(status_code=422, detail="El estado debe ser aceptado, rechazado, entregado o cancelado")

    usuario = usuario_actual(x_usuario_id)
    pedido = buscar_o_404(pedido_id)

    cambios = CAMBIOS_PEDIDO[pedido["estado"]]
    if nuevo_estado not in cambios:
        raise HTTPException(
            status_code=409,
            detail="Un pedido " + pedido["estado"] + " no puede pasar a " + nuevo_estado,
        )

    # Regla: cada cambio lo hace solo el comprador o solo el vendedor (o un admin)
    quien = cambios[nuevo_estado]
    if quien == "vendedor":
        autorizado = usuario["id"] == pedido["vendedor_id"]
    else:
        autorizado = usuario["id"] == pedido["usuario_id"]

    if not autorizado and usuario["rol"] != "admin":
        raise HTTPException(status_code=403, detail="Este cambio solo lo puede hacer el " + quien)

    if nuevo_estado == "aceptado":
        # El vendedor se compromete a vender: los productos quedan vendidos
        ids_productos = []
        for item in pedido["detalle"]:
            ids_productos.append(item["producto_id"])
        pedido_repository.aceptar(pedido_id, ids_productos)
    if nuevo_estado == "entregado":
        pedido_repository.marcar_entregado(pedido_id)
    if nuevo_estado == "rechazado" or nuevo_estado == "cancelado":
        pedido_repository.cambiar_estado(pedido_id, nuevo_estado)

    return pedido_repository.buscar(pedido_id)
