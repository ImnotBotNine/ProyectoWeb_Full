import { useEffect, useState } from "react";

import EncabezadoPagina from "../components/EncabezadoPagina";
import EstadoCarga from "../components/EstadoCarga";
import MensajeVacio from "../components/MensajeVacio";
import TarjetaPedido from "../components/TarjetaPedido";
import { usuariosApi, pedidosApi } from "../services/api";

import "../styles/perfil.css";

// Perfil del usuario: sus datos, lo que compra y lo que vende (pago contra entrega)
export default function Perfil({ idUsuario, onError, onProductosCambiaron, onIrPublicar }) {
  const [perfil, setPerfil] = useState(null);
  const [compras, setCompras] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  async function cargarPerfil() {
    try {
      setCargando(true);
      setError("");

      setPerfil(await usuariosApi.perfil(idUsuario));
      setCompras(await pedidosApi.listar(idUsuario));
      setVentas(await pedidosApi.ventas(idUsuario));
    } catch (error) {
      setError(error.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarPerfil();
  }, []);

  async function cambiarEstado(idPedido, estado) {
    if (estado === "cancelado" && !confirm("¿Deseas cancelar este pedido?")) {
      return;
    }
    if (estado === "rechazado" && !confirm("¿Deseas rechazar este pedido?")) {
      return;
    }

    try {
      await pedidosApi.cambiarEstado(idPedido, estado);
      await cargarPerfil();

      // Al aceptar, los productos pasan a "vendido": se recarga el Mercado
      if (estado === "aceptado") {
        onProductosCambiaron();
      }
    } catch (error) {
      onError(error.message);
    }
  }

  return (
    <>
      <EncabezadoPagina
        titulo="Mi perfil"
        texto="Tus datos, tus compras y tus ventas en Infraganti. El pago se hace en persona, al momento de la entrega."
      />

      <section className="perfil-contenido">
        <div className="container">
          <EstadoCarga cargando={cargando} error={error} onReintentar={cargarPerfil} />

          {perfil !== null && (
            <div className="perfil-datos">
              <div>
                <h2>{perfil.nombre}</h2>
                <p>
                  @{perfil.nick} · {perfil.rol === "admin" ? "Administrador" : "Estudiante"}
                  {perfil.carrera ? " · " + perfil.carrera : ""}
                  {perfil.telefono ? " · " + perfil.telefono : ""}
                </p>
              </div>
              <div className="perfil-numeros">
                <span><strong>{perfil.publicados}</strong> publicaciones</span>
                <span><strong>{perfil.compras}</strong> compras</span>
                <span><strong>{perfil.ventas}</strong> ventas</span>
              </div>
            </div>
          )}

          <div className="row g-4">
            <section className="col-12 col-lg-6">
              <h2 className="perfil-subtitulo">Mis compras</h2>

              {!cargando && compras.length === 0 && (
                <MensajeVacio
                  titulo="Aún no tienes compras"
                  texto="Agrega productos al carrito y presiona Solicitar compra."
                />
              )}

              {compras.map((pedido) => (
                <TarjetaPedido
                  key={pedido.id}
                  pedido={pedido}
                  modo="compra"
                  onCambiarEstado={cambiarEstado}
                />
              ))}
            </section>

            <section className="col-12 col-lg-6">
              <div className="perfil-subtitulo-fila">
                <h2 className="perfil-subtitulo">Mis ventas</h2>
                <button type="button" className="btn-enlace" onClick={onIrPublicar}>
                  Ver mis publicaciones
                </button>
              </div>

              {!cargando && ventas.length === 0 && (
                <MensajeVacio
                  titulo="Aún no tienes ventas"
                  texto="Cuando alguien solicite uno de tus productos aparecerá aquí."
                />
              )}

              {ventas.map((pedido) => (
                <TarjetaPedido
                  key={pedido.id}
                  pedido={pedido}
                  modo="venta"
                  onCambiarEstado={cambiarEstado}
                />
              ))}
            </section>
          </div>
        </div>
      </section>
    </>
  );
}
