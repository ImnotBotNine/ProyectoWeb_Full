from fastapi import HTTPException

from repositories import usuario_repository


def usuario_actual(x_usuario_id):
    # React envía el id de quien tiene la sesión en el encabezado X-Usuario-Id
    if x_usuario_id is None:
        raise HTTPException(status_code=401, detail="Debes iniciar sesión")

    usuario = usuario_repository.buscar_por_id(x_usuario_id)
    if usuario is None:
        raise HTTPException(status_code=401, detail="Usuario no válido")
    return usuario


def exigir_mismo_usuario(usuario, usuario_id):
    # Solo puedes ver o cambiar tu propio carrito, favoritos y pedidos (o ser admin)
    if usuario["id"] != usuario_id and usuario["rol"] != "admin":
        raise HTTPException(status_code=403, detail="No puedes acceder a datos de otro usuario")


def exigir_dueno_o_admin(usuario, producto):
    if producto["usuario_id"] != usuario["id"] and usuario["rol"] != "admin":
        raise HTTPException(status_code=403, detail="Solo el vendedor o un administrador pueden hacer esto")
