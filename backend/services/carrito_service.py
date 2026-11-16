rom fastapi import HTTPException

from repositories import carrito_repository, pedido_repository
from services import producto_service
from services.sesion_service import exigir_mismo_usuario, usuario_actual


def listar(usuario_id, x_usuario_id):
    usuario = usuario_actual(x_usuario_id)
    exigir_mismo_usuario(usuario, usuario_id)
    return carrito_repository.listar_productos(usuario_id)


def agregar(usuario_id, producto_id, x_usuario_id):
    usuario = usuario_actual(x_usuario_id)
    exigir_mismo_usuario(usuario, usuario_id)
    producto = producto_service.obtener(producto_id)

    # Reglas de negocio: no se compra lo vendido, lo propio ni lo que ya tiene un pedido
    if producto["estado"] == "vendido":
        raise HTTPException(status_code=409, detail="El producto ya fue vendido")

    if producto["usuario_id"] == usuario_id:
        raise HTTPException(status_code=409, detail="No puedes comprar tu propio producto")

    if pedido_repository.tiene_pedido_en_curso(producto_id):
        raise HTTPException(status_code=409, detail="El producto ya tiene un pedido en curso")

    if carrito_repository.existe(usuario_id, producto_id):
        raise HTTPException(status_code=409, detail="El producto ya está en el carrito")

    carrito_repository.agregar(usuario_id, producto_id)
    return producto


def quitar(usuario_id, producto_id, x_usuario_id):
    usuario = usuario_actual(x_usuario_id)
    exigir_mismo_usuario(usuario, usuario_id)

    if not carrito_repository.existe(usuario_id, producto_id):
        raise HTTPException(status_code=404, detail="El producto no está en el carrito")

    carrito_repository.quitar(usuario_id, producto_id)
    return {"mensaje": "Producto quitado del carrito"}


def vaciar(usuario_id, x_usuario_id):
    usuario = usuario_actual(x_usuario_id)
    exigir_mismo_usuario(usuario, usuario_id)
    carrito_repository.vaciar(usuario_id)
    return {"mensaje": "Carrito vaciado"}
