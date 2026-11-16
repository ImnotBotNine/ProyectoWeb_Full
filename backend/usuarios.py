# API de usuarios (puerto 8001): login, registro y perfil.
# Usa las mismas capas que main.py (routers -> services -> repositories).
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import usuarios as rutas_usuarios

app = FastAPI(title="API Usuarios Infraganti")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def inicio():
    return {"mensaje": "API de usuarios de Infraganti funciona"}


app.include_router(rutas_usuarios.router)
