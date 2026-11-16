from pydantic import BaseModel, Field


class LoginEntrada(BaseModel):
    nick: str = Field(min_length=3, max_length=30)
    contrasena: str = Field(min_length=3, max_length=60)


# Datos para crear una cuenta nueva (siempre con rol "usuario")
class RegistroEntrada(BaseModel):
    nick: str = Field(min_length=3, max_length=30)
    contrasena: str = Field(min_length=8, max_length=60)
    nombre: str = Field(min_length=3, max_length=60)
    carrera: str = Field(min_length=2, max_length=60)
    telefono: str = Field(min_length=8, max_length=20)
