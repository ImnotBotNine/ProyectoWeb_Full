from fastapi import APIRouter, Header

from schemas.pedido import EstadoPedidoEntrada
from services import pedido_service

router = APIRouter()


@router.get("/usuarios/{usuario_id}/pedidos")
def listar_pedidos(usuario_id: int, x_usuario_id: int = Header(default=None)):
    return pedido_service.listar_compras(usuario_id, x_usuario_id)


@router.get("/usuarios/{usuario_id}/ventas")
def listar_ventas(usuario_id: int, x_usuario_id: int = Header(default=None)):
    return pedido_service.listar_ventas(usuario_id, x_usuario_id)


@router.post("/usuarios/{usuario_id}/pedidos", status_code=201)
def crear_pedidos(usuario_id: int, x_usuario_id: int = Header(default=None)):
    return pedido_service.crear_desde_carrito(usuario_id, x_usuario_id)


@router.get("/pedidos/{pedido_id}")
def obtener_pedido(pedido_id: int, x_usuario_id: int = Header(default=None)):
    return pedido_service.obtener(pedido_id, x_usuario_id)


@router.patch("/pedidos/{pedido_id}/estado")
def cambiar_estado_pedido(pedido_id: int, datos: EstadoPedidoEntrada,
                          x_usuario_id: int = Header(default=None)):
    return pedido_service.cambiar_estado(pedido_id, datos.estado, x_usuario_id)