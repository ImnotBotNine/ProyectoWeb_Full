from fastapi import APIRouter, Header

from schemas.producto import ProductoEntrada
from services import producto_service

router = APIRouter()


@router.get("/productos")
def listar_productos():
    return producto_service.listar()


@router.get("/productos/{producto_id}")
def obtener_producto(producto_id: int):
    return producto_service.obtener(producto_id)


@router.post("/productos", status_code=201)
def crear_producto(datos: ProductoEntrada, x_usuario_id: int = Header(default=None)):
    return producto_service.crear(datos, x_usuario_id)


@router.put("/productos/{producto_id}")
def actualizar_producto(producto_id: int, datos: ProductoEntrada,
                        x_usuario_id: int = Header(default=None)):
    return producto_service.actualizar(producto_id, datos, x_usuario_id)


@router.delete("/productos/{producto_id}")
def eliminar_producto(producto_id: int, x_usuario_id: int = Header(default=None)):
    return producto_service.eliminar(producto_id, x_usuario_id)


@router.get("/usuarios/{usuario_id}/productos")
def listar_mis_productos(usuario_id: int):
    return producto_service.listar_de_usuario(usuario_id)