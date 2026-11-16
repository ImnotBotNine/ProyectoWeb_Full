export function acortarTexto(texto, largo) {
  if (texto.length > largo) {
    return texto.substring(0, largo) + "...";
  }
  return texto;
}

export function formatearPrecio(precio) {
  if (precio > 0) {
    return precio.toLocaleString("es-CL") + " CLP";
  }
  return "0 CLP";
}

export function formatearUsuario(usuario) {
  if (usuario === "") {
    return "Por usuario";
  }
  return "Por " + usuario;
}

export function formatearFecha(fecha) {
  return new Date(fecha).toLocaleString("es-CL");
}

const NOMBRES_ESTADO_PEDIDO = {
  pendiente: "Esperando al vendedor",
  aceptado: "Aceptado",
  rechazado: "Rechazado",
  entregado: "Entregado y pagado",
  cancelado: "Cancelado"
};

export function nombreEstadoPedido(estado) {
  return NOMBRES_ESTADO_PEDIDO[estado];
}

export function nombreEstado(estado) {
  if (estado === "vendido") {
    return "Vendido";
  }
  return "Disponible";
}
