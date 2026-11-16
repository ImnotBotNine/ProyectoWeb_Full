from fastapi import HTTPException

from repositories import carrito_repository, categoria_repository, producto_repository, usuario_repository
from services.sesion_service import exigir_dueno_o_admin, usuario_actual


def listar():
    return producto_repository.listar()


def obtener(producto_id):
    producto = producto_repository.buscar(producto_id)
    if producto is None:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto


def validar_producto(datos):
    if datos.estado != "disponible" and datos.estado != "vendido":
        raise HTTPException(status_code=422, detail="El estado debe ser disponible o vendido")
    if datos.precio < 0:
        raise HTTPException(status_code=422, detail="El precio no puede ser negativo")
    if not categoria_repository.existe(datos.categoria):
        raise HTTPException(status_code=400, detail="La categoría no existe")


def crear(datos, x_usuario_id):
    # El producto queda asociado a la cuenta que lo publica
    usuario = usuario_actual(x_usuario_id)
    validar_producto(datos)

    nuevo_id = producto_repository.crear(datos, usuario["id"])
    return producto_repository.buscar(nuevo_id)


def actualizar(producto_id, datos, x_usuario_id):
    usuario = usuario_actual(x_usuario_id)
    producto = obtener(producto_id)
    exigir_dueno_o_admin(usuario, producto)
    validar_producto(datos)

    producto_repository.actualizar(producto_id, datos)

    # Un producto vendido ya no se puede comprar: se quita de todos los carritos
    if datos.estado == "vendido":
        carrito_repository.quitar_de_todos(producto_id)

    return producto_repository.buscar(producto_id)


def eliminar(producto_id, x_usuario_id):
    usuario = usuario_actual(x_usuario_id)
    producto = obtener(producto_id)
    exigir_dueno_o_admin(usuario, producto)

    # Un producto que ya está en un pedido no se borra, para no perder el historial
    if producto_repository.esta_en_un_pedido(producto_id):
        raise HTTPException(status_code=409, detail="El producto está en un pedido y no se puede eliminar")

    producto_repository.eliminar(producto_id)
    return {"mensaje": "Producto eliminado"}


def listar_de_usuario(usuario_id):
    if usuario_repository.buscar_por_id(usuario_id) is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return producto_repository.listar_de_usuario(usuario_id)
