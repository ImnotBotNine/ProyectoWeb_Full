from pydantic import BaseModel, Field


# Datos que React envía al publicar o editar un producto
class ProductoEntrada(BaseModel):
    nombre: str = Field(min_length=5, max_length=80)
    categoria: str = Field(min_length=3, max_length=30)
    estado: str = "disponible"
    precio: int
    descripcion: str = Field(min_length=20, max_length=300)
    vendedor: str = Field(min_length=3, max_length=60)
    carrera: str = Field(min_length=3, max_length=60)
    contacto: str = Field(min_length=3, max_length=60)
    imagen: str = ""
