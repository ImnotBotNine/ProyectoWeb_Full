import ImagenProducto from "./ImagenProducto";
import { formatearPrecio } from "../js/formato";

// Carrito como panel blanco a la derecha (parecido al de Roblox)
export default function ModalCarrito({ carrito, onCerrar, onQuitar, onVaciar, onComprar }) {
  let total = 0;

  carrito.forEach((producto) => {
    total += producto.precio;
  });

  const vacio = carrito.length === 0;
  const textoCantidad = carrito.length === 1 ? "1 producto" : carrito.length + " productos";

  return (
    <div className="carrito-fondo" aria-labelledby="tituloCarrito">
      <div className="carrito-panel">
        <div className="carrito-encabezado">
          <h2 id="tituloCarrito">Carrito de compra ({carrito.length})</h2>
          <button type="button" className="btn-close" aria-label="Cerrar" onClick={onCerrar}></button>
        </div>

        <div className="carrito-lista">
          {vacio && <p className="carrito-vacio">Tu carrito está vacío.</p>}

          {carrito.map((producto) => (
            <div className="carrito-producto" key={producto.id}>
              <ImagenProducto imagen={producto.imagen} nombre={producto.nombre} clase="carrito-imagen" />

              <div className="carrito-info">
                <div className="carrito-nombre">{producto.nombre}</div>
                <small>{producto.vendedor}</small>
                <div className="carrito-precio">{formatearPrecio(producto.precio)}</div>
              </div>

              <button
                type="button"
                className="btn-quitar-carrito"
                aria-label={`Quitar ${producto.nombre}`}
                onClick={() => onQuitar(producto.id)}
              >
                Quitar
              </button>
            </div>
          ))}
        </div>

        <div className="carrito-pie">
          <div className="carrito-total">
            <span>Total: {textoCantidad}</span>
            <span>{formatearPrecio(total)}</span>
          </div>

          <button type="button" className="btn-solicitar" disabled={vacio} onClick={onComprar}>
            Solicitar compra
          </button>

          <p className="carrito-nota">Pagas en persona al recibir el producto.</p>

          {!vacio && (
            <button type="button" className="btn-enlace carrito-vaciar" onClick={onVaciar}>
              Vaciar carrito
            </button>
          )}
        </div>
      </div>
    </div>
  );
}