from fastapi import APIRouter, Header

from services import carrito_service

router = APIRouter()


@router.get("/usuarios/{usuario_id}/carrito")
def listar_carrito(usuario_id: int, x_usuario_id: int = Header(default=None)):
    return carrito_service.listar(usuario_id, x_usuario_id)


@router.post("/usuarios/{usuario_id}/carrito/{producto_id}", status_code=201)
def agregar_carrito(usuario_id: int, producto_id: int,
                    x_usuario_id: int = Header(default=None)):
    return carrito_service.agregar(usuario_id, producto_id, x_usuario_id)


@router.delete("/usuarios/{usuario_id}/carrito/{producto_id}")
def quitar_carrito(usuario_id: int, producto_id: int,
                   x_usuario_id: int = Header(default=None)):
    return carrito_service.quitar(usuario_id, producto_id, x_usuario_id)


@router.delete("/usuarios/{usuario_id}/carrito")
def vaciar_carrito(usuario_id: int, x_usuario_id: int = Header(default=None)):
    return carrito_service.vaciar(usuario_id, x_usuario_id)
