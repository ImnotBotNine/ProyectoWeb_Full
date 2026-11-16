# API de productos (puerto 8000): crea la aplicación y registra los routers.
# Capas:  routers (HTTP) -> services (reglas de negocio) -> repositories (SQL) -> PostgreSQL
#         schemas: modelos Pydantic de entrada (DTO)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import carrito, categorias, favoritos, pedidos, productos

app = FastAPI(title="API Infraganti")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def inicio():
    return {"mensaje": "API de Infraganti funciona"}


app.include_router(categorias.router)
app.include_router(productos.router)
app.include_router(favoritos.router)
app.include_router(carrito.router)
app.include_router(pedidos.router)
