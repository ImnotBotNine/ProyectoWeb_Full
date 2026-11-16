from fastapi import APIRouter, Header

from services import favorito_service

router = APIRouter()


@router.get("/usuarios/{usuario_id}/favoritos")
def listar_favoritos(usuario_id: int, x_usuario_id: int = Header(default=None)):
    return favorito_service.listar(usuario_id, x_usuario_id)


@router.post("/usuarios/{usuario_id}/favoritos/{producto_id}", status_code=201)
def agregar_favorito(usuario_id: int, producto_id: int,
                     x_usuario_id: int = Header(default=None)):
    return favorito_service.agregar(usuario_id, producto_id, x_usuario_id)


@router.delete("/usuarios/{usuario_id}/favoritos/{producto_id}")
def quitar_favorito(usuario_id: int, producto_id: int,
                    x_usuario_id: int = Header(default=None)):
    return favorito_service.quitar(usuario_id, producto_id, x_usuario_id)
