import { formatearPrecio, formatearUsuario, nombreEstado } from "../js/formato";

export default function ResumenPublicado({
  nombre,
  categoria,
  estado,
  descripcion,
  precio,
  vendedor,
  onEditar,
  onEliminar
}) {
  return (
    <article className="publicado">
      <span className="publicado-categoria">{categoria} · {nombreEstado(estado)}</span>
      <h3 className="publicado-nombre">{nombre}</h3>
      <p className="publicado-texto">{descripcion}</p>

      <div className="publicado-pie">
        <span className="publicado-precio">{formatearPrecio(precio)}</span>
        <span className="publicado-usuario">{formatearUsuario(vendedor)}</span>
      </div>

      <div className="publicado-acciones">
        <button type="button" className="btn-publicado-accion" onClick={onEditar}>
          Editar
        </button>
        <button type="button" className="btn-publicado-accion btn-publicado-eliminar" onClick={onEliminar}>
          Eliminar
        </button>
      </div>
    </article>
  );
}
