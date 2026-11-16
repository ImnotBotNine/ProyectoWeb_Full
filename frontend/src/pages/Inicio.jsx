import Hero from "../components/Hero";
import EstadoCarga from "../components/EstadoCarga";
import FilaCategoria from "../components/FilaCategoria";

import "../styles/inicio.css";

export default function Inicio({ productos, categorias, cargando, error, onRecargar, onVerMercado, onVerProducto }) {
  // Una fila de "Nuevos" y luego una fila por cada categoría que entrega la API
  const filas = [{ id: "nuevos", titulo: "Nuevos" }];

  categorias.forEach((categoria) => {
    const titulo = categoria.id === "otros" ? categoria.nombre : "Popular en " + categoria.nombre.toLowerCase();
    filas.push({ id: categoria.id, titulo: titulo });
  });

  function productosDeFila(idFila) {
    if (idFila === "nuevos") {
      // Los últimos publicados primero (el id más alto es el más nuevo)
      return [...productos].sort((a, b) => b.id - a.id);
    }

    return productos.filter(
      (producto) => producto.categoria === idFila
    );
  }

  return (
    <>
      <Hero />

      <section className="destacados">
        <h2 className="destacados-titulo">Destacados en Infraganti</h2>

        <EstadoCarga cargando={cargando} error={error} onReintentar={onRecargar} />

        {filas.map((fila) => (
          <FilaCategoria
            key={fila.id}
            titulo={fila.titulo}
            productos={productosDeFila(fila.id)}
            onVerMercado={() => onVerMercado(fila.id === "nuevos" ? "todas" : fila.id)}
            onVerProducto={onVerProducto}
          />
        ))}
      </section>
    </>
  );
}
