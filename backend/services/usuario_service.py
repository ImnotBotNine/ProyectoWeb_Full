from fastapi import HTTPException

from repositories import usuario_repository


def iniciar_sesion(datos):
    usuario = usuario_repository.buscar_por_credenciales(datos.nick, datos.contrasena)
    if usuario is None:
        raise HTTPException(status_code=401, detail="Nick o contraseña incorrectos")
    return usuario


def registrar(datos):
    if usuario_repository.existe_nick(datos.nick):
        raise HTTPException(status_code=409, detail="Ese nick ya está en uso")

    # Se devuelve igual que el login para que la cuenta nueva quede con la sesión iniciada
    return usuario_repository.crear(datos)


def obtener_perfil(usuario_id, x_usuario_id):
    usuario = usuario_repository.buscar_perfil(usuario_id)
    if usuario is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # El teléfono solo lo ve el dueño del perfil
    if x_usuario_id != usuario_id:
        usuario["telefono"] = None
    return usuario
