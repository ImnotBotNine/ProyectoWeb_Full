from fastapi import HTTPException

from repositories import favorito_repository
from services import producto_service
from services.sesion_service import exigir_mismo_usuario, usuario_actual


def listar(usuario_id, x_usuario_id):
    usuario = usuario_actual(x_usuario_id)
    exigir_mismo_usuario(usuario, usuario_id)
    return favorito_repository.listar_ids(usuario_id)


def agregar(usuario_id, producto_id, x_usuario_id):
    usuario = usuario_actual(x_usuario_id)
    exigir_mismo_usuario(usuario, usuario_id)
    producto_service.obtener(producto_id)

    if favorito_repository.existe(usuario_id, producto_id):
        raise HTTPException(status_code=409, detail="El producto ya está en favoritos")

    favorito_repository.agregar(usuario_id, producto_id)
    return {"mensaje": "Producto agregado a favoritos"}


def quitar(usuario_id, producto_id, x_usuario_id):
    usuario = usuario_actual(x_usuario_id)
    exigir_mismo_usuario(usuario, usuario_id)

    if not favorito_repository.existe(usuario_id, producto_id):
        raise HTTPException(status_code=404, detail="El producto no está en favoritos")

    favorito_repository.quitar(usuario_id, producto_id)
    return {"mensaje": "Producto quitado de favoritos"}
