from fastapi import APIRouter, Header

from schemas.usuario import LoginEntrada, RegistroEntrada
from services import usuario_service

router = APIRouter()


@router.post("/login")
def iniciar_sesion(datos: LoginEntrada):
    return usuario_service.iniciar_sesion(datos)


@router.post("/registro", status_code=201)
def crear_cuenta(datos: RegistroEntrada):
    return usuario_service.registrar(datos)


@router.get("/usuarios/{usuario_id}")
def obtener_perfil(usuario_id: int, x_usuario_id: int = Header(default=None)):
    return usuario_service.obtener_perfil(usuario_id, x_usuario_id)
