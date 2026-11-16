from pydantic import BaseModel


# Nuevo estado de un pedido (pago contra entrega)
class EstadoPedidoEntrada(BaseModel):
    estado: str
