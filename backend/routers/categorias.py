from fastapi import APIRouter

from services import categoria_service

router = APIRouter()


@router.get("/categorias")
def listar_categorias():
    return categoria_service.listar()
