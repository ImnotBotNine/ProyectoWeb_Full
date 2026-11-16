import { formatearFecha, formatearPrecio, nombreEstadoPedido } from "../js/formato";

// Un pedido visto como compra (comprador) o como venta (vendedor).
// Pago contra entrega: el vendedor acepta o rechaza, y luego registra la entrega y el pago.
// Una vez aceptado, cada uno ve el teléfono del otro para juntarse.
export default function TarjetaPedido({ pedido, modo, onCambiarEstado }) {
  const esVenta = modo === "venta";

  // Texto del total según el estado: pagado, por pagar o sin pago (rechazado o cancelado)
  let textoTotal = "Total a pagar en la entrega";
  if (pedido.estado === "entregado") {
    textoTotal = "Total pagado";
  }
  if (pedido.estado === "rechazado" || pedido.estado === "cancelado") {
    textoTotal = "Total (sin pago)";
  }

  return (
    <article className="pedido">
      <div className="pedido-encabezado">
        <div>
          <h3 className="pedido-titulo">Pedido #{pedido.id}</h3>
          <small>
            {formatearFecha(pedido.fecha)} · {esVenta ? "comprador @" + pedido.comprador : "vendedor @" + pedido.vendedor}
          </small>
        </div>
        <span className={`pedido-estado estado-${pedido.estado}`}>
          {nombreEstadoPedido(pedido.estado)}
        </span>
      </div>

      <ul className="pedido-productos">
        {pedido.detalle.map((item) => (
          <li key={item.producto_id}>
            <span>{item.nombre}</span>
            <span>{formatearPrecio(item.precio_unitario)}</span>
          </li>
        ))}
      </ul>

      <div className="pedido-total">
        <span>{textoTotal}</span>
        <span>{formatearPrecio(pedido.total)}</span>
      </div>

      {pedido.estado === "entregado" && (
        <p className="pedido-nota">Entregado y pagado el {formatearFecha(pedido.fecha_entrega)}.</p>
      )}

      {/* Comprador: solo puede cancelar mientras el vendedor no responde */}
      {!esVenta && pedido.estado === "pendiente" && (
        <div className="pedido-acciones">
          <span className="pedido-nota">Esperando que @{pedido.vendedor} acepte tu solicitud.</span>
          <button type="button" className="btn-pedido-secundario" onClick={() => onCambiarEstado(pedido.id, "cancelado")}>
            Cancelar pedido
          </button>
        </div>
      )}

      {!esVenta && pedido.estado === "aceptado" && (
        <p className="pedido-nota">
          Aceptado: coordina la entrega con @{pedido.vendedor} al <strong>{pedido.vendedor_telefono}</strong> y paga al recibir.
        </p>
      )}

      {/* Vendedor: acepta o rechaza, y después registra la entrega con el pago */}
      {esVenta && pedido.estado === "pendiente" && (
        <div className="pedido-acciones">
          <button type="button" className="btn-pedido" onClick={() => onCambiarEstado(pedido.id, "aceptado")}>
            Aceptar
          </button>
          <button type="button" className="btn-pedido-secundario" onClick={() => onCambiarEstado(pedido.id, "rechazado")}>
            Rechazar
          </button>
        </div>
      )}

      {esVenta && pedido.estado === "aceptado" && (
        <div className="pedido-acciones">
          <span className="pedido-nota">
            Coordina la entrega con @{pedido.comprador} al <strong>{pedido.comprador_telefono}</strong>.
          </span>
          <button type="button" className="btn-pedido" onClick={() => onCambiarEstado(pedido.id, "entregado")}>
            Marcar entregado y pagado
          </button>
        </div>
      )}
    </article>
  );
}
