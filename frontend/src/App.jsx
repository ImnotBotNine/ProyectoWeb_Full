import { useEffect, useState } from "react";

import Header from "./components/Header";
import Footer from "./components/Footer";
import ModalCarrito from "./components/ModalCarrito";
import Inicio from "./pages/Inicio";
import Mercado from "./pages/Mercado";
import Publicar from "./pages/Publicar";
import Producto from "./pages/Producto";
import Login from "./pages/Login";
import Perfil from "./pages/Perfil";
import { guardarDato, leerDato } from "./js/almacenamiento";
import {
  usarUsuario,
  categoriasApi,
  productosApi,
  usuariosApi,
  favoritosApi,
  carritoApi,
  pedidosApi
} from "./services/api";

const CLAVE_USUARIO = "infraganti-usuario";
const CLAVE_ULTIMA_PUBLICACION = "infraganti-ultima-publicacion";

// Una sesión guardada antes de usar PostgreSQL no trae el id del usuario: se descarta
function leerSesion() {
  const guardado = leerDato(CLAVE_USUARIO, null);

  if (guardado !== null && guardado.id === undefined) {
    return null;
  }
  return guardado;
}

export default function App() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [pagina, setPagina] = useState("inicio");
  const [busqueda, setBusqueda] = useState("");
  const [categoriaInicial, setCategoriaInicial] = useState("todas");
  const [idProducto, setIdProducto] = useState(null);
  // Carrito y favoritos se guardan en PostgreSQL; aquí solo se muestran
  const [carrito, setCarrito] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [carritoAbierto, setCarritoAbierto] = useState(false);

  const [usuario, setUsuario] = useState(leerSesion());
  const [ultimaPublicacion, setUltimaPublicacion] = useState(leerDato(CLAVE_ULTIMA_PUBLICACION, 0));


  const sesionIniciada = usuario !== null;
  const esAdmin = sesionIniciada && usuario.rol === "admin";
  const idUsuario = sesionIniciada ? usuario.id : null;

  // Las publicaciones del usuario son los productos que tienen su id como dueño
  const misProductos = productos.filter(
    (producto) => sesionIniciada && producto.usuario_id === usuario.id
  );

  // Solo se avisa cuando algo falla (con alert, como en la guía);
  // si sale bien, el cambio ya se ve en la página
  function mostrarError(texto) {
    alert(texto);
  }

  function guardarUsuario(nuevoUsuario) {
    setUsuario(nuevoUsuario);
    guardarDato(CLAVE_USUARIO, nuevoUsuario);
    usarUsuario(nuevoUsuario === null ? null : nuevoUsuario.id);
  }

  function guardarUltimaPublicacion(momento) {
    setUltimaPublicacion(momento);
    guardarDato(CLAVE_ULTIMA_PUBLICACION, momento);
  }

  async function cargarProductos() {
    try {
      setCargando(true);
      setError("");

      setCategorias(await categoriasApi.listar());
      setProductos(await productosApi.listar());
    } catch (error) {
      console.log(error);
      setError("No fue posible cargar los productos. Revisa que la API esté encendida.");
    } finally {
      setCargando(false);
    }
  }

  async function cargarDatosUsuario(id) {
    try {
      setFavoritos(await favoritosApi.listar(id));
      setCarrito(await carritoApi.listar(id));
    } catch (error) {
      mostrarError(error.message);
    }
  }

  // Al abrir la página se traen categorías y productos y, si hay sesión, sus favoritos y carrito
  useEffect(() => {
    const sesion = leerSesion();
    if (sesion !== null) {
      usarUsuario(sesion.id);
      cargarDatosUsuario(sesion.id);
    }

    cargarProductos();
  }, []);

  function reemplazarProducto(productoActualizado) {
    setProductos(productos.map((item) => {
      if (item.id === productoActualizado.id) {
        return productoActualizado;
      }
      return item;
    }));
  }

  // Devuelve "" si salió bien, o el mensaje de error de la API
  async function publicarProducto(nuevoProducto) {
    try {
      const productoCreado = await productosApi.crear(nuevoProducto);

      setProductos([...productos, productoCreado]);
      guardarUltimaPublicacion(Date.now());
      return "";
    } catch (error) {
      return error.message;
    }
  }

  async function editarProducto(id, datos) {
    try {
      const productoEditado = await productosApi.editar(id, datos);

      reemplazarProducto(productoEditado);
      return "";
    } catch (error) {
      return error.message;
    }
  }

  async function cambiarEstado(producto) {
    const nuevoEstado = producto.estado === "vendido" ? "disponible" : "vendido";

    try {
      const productoActualizado = await productosApi.editar(producto.id, { ...producto, estado: nuevoEstado });
      reemplazarProducto(productoActualizado);

      // La API ya lo quitó de los carritos; aquí se actualiza la vista
      if (nuevoEstado === "vendido") {
        setCarrito(carrito.filter((item) => item.id !== producto.id));
      }
    } catch (error) {
      mostrarError(error.message);
    }
  }

  async function eliminarProducto(id) {
    try {
      await productosApi.eliminar(id);

      // PostgreSQL borra el producto de favoritos y carritos (ON DELETE CASCADE)
      setProductos(productos.filter((producto) => producto.id !== id));
      setCarrito(carrito.filter((producto) => producto.id !== id));
      setFavoritos(favoritos.filter((idFavorito) => idFavorito !== id));
    } catch (error) {
      mostrarError(error.message);
    }
  }

  async function borrarPublicados() {
    const ids = misProductos.map((producto) => producto.id);
    let borrados = 0;

    for (const id of ids) {
      try {
        await productosApi.eliminar(id);
        borrados = borrados + 1;
      } catch (error) {
        console.log(error);
      }
    }

    cargarProductos();

    if (borrados < ids.length) {
      mostrarError("Algunas publicaciones están en pedidos y no se pudieron eliminar.");
    }
  }

  async function iniciarSesion(nick, contrasena) {
    try {
      const datos = await usuariosApi.login(nick, contrasena);

      guardarUsuario(datos);
      cargarDatosUsuario(datos.id);
      navegar("inicio");
      return "";
    } catch (error) {
      console.log(error);
      return error.message;
    }
  }

  // Crea la cuenta y deja la sesión iniciada, igual que al ingresar
  async function crearCuenta(datos) {
    try {
      const nuevoUsuario = await usuariosApi.registrar(datos);

      guardarUsuario(nuevoUsuario);
      cargarDatosUsuario(nuevoUsuario.id);
      navegar("inicio");
      return "";
    } catch (error) {
      return error.message;
    }
  }

  function cerrarSesion() {
    // Solo se cierra la sesión: el carrito y los favoritos siguen guardados en la base
    guardarUsuario(null);
    setCarrito([]);
    setFavoritos([]);
    setCarritoAbierto(false);
    navegar("inicio");
  }

  function navegar(idPagina) {
    setCategoriaInicial("todas");
    setPagina(idPagina);
  }

  function verMercado(idCategoria) {
    setCategoriaInicial(idCategoria);
    setPagina("mercado");
  }

  function verProducto(id) {
    setIdProducto(id);
    setPagina("producto");
  }

  function buscar(texto) {
    setBusqueda(texto);

    if (pagina !== "mercado") {
      setPagina("mercado");
    }
  }

  async function agregarCarrito(producto) {
    const yaExiste = carrito.some((item) => item.id === producto.id);

    if (yaExiste) {
      mostrarError("El producto ya está en tu carrito.");
      return;
    }

    try {
      const productoAgregado = await carritoApi.agregar(usuario.id, producto.id);
      setCarrito([...carrito, productoAgregado]);
    } catch (error) {
      mostrarError(error.message);
    }
  }

  async function alternarFavorito(id) {
    try {
      if (favoritos.includes(id)) {
        await favoritosApi.quitar(usuario.id, id);
        setFavoritos(favoritos.filter((idFavorito) => idFavorito !== id));
      } else {
        await favoritosApi.agregar(usuario.id, id);
        setFavoritos([...favoritos, id]);
      }
    } catch (error) {
      mostrarError(error.message);
    }
  }

  async function quitarCarrito(id) {
    try {
      await carritoApi.quitar(usuario.id, id);
      setCarrito(carrito.filter((item) => item.id !== id));
    } catch (error) {
      mostrarError(error.message);
    }
  }

  // Convierte el carrito en solicitudes de compra (una por vendedor) y lleva al perfil
  async function comprar() {
    try {
      await pedidosApi.crear(usuario.id);
      setCarrito([]);
      setCarritoAbierto(false);
      navegar("perfil");
    } catch (error) {
      mostrarError(error.message);
    }
  }

  async function vaciarCarrito() {
    try {
      await carritoApi.vaciar(usuario.id);
      setCarrito([]);
    } catch (error) {
      mostrarError(error.message);
    }
  }

  return (
    <>
      <Header
        paginaActual={pagina}
        onNavegar={navegar}
        busqueda={busqueda}
        onBuscar={buscar}
        totalCarrito={carrito.length}
        onAbrirCarrito={() => setCarritoAbierto(true)}
        usuario={usuario}
        onCerrarSesion={cerrarSesion}
      />

      <main>
        {pagina === "inicio" && (
          <Inicio
            productos={productos}
            categorias={categorias}
            cargando={cargando}
            error={error}
            onRecargar={cargarProductos}
            onVerMercado={verMercado}
            onVerProducto={verProducto}
          />
        )}

        {pagina === "mercado" && (
          <Mercado
            productos={productos}
            categorias={categorias}
            cargando={cargando}
            error={error}
            onRecargar={cargarProductos}
            busqueda={busqueda}
            onBuscar={setBusqueda}
            categoriaInicial={categoriaInicial}
            sesionIniciada={sesionIniciada}
            esAdmin={esAdmin}
            idUsuario={idUsuario}
            favoritos={favoritos}
            onFavorito={alternarFavorito}
            onCambiarEstado={cambiarEstado}
            onEliminar={eliminarProducto}
            onVerProducto={verProducto}
          />
        )}

        {pagina === "producto" && (
          <Producto
            productos={productos}
            idProducto={idProducto}
            cargando={cargando}
            error={error}
            onRecargar={cargarProductos}
            sesionIniciada={sesionIniciada}
            idUsuario={idUsuario}
            onIrLogin={() => navegar("login")}
            totalCarrito={carrito.length}
            onAbrirCarrito={() => setCarritoAbierto(true)}
            onAgregarCarrito={agregarCarrito}
            onVerProducto={verProducto}
            onVolver={() => navegar("mercado")}
          />
        )}

        {pagina === "publicar" && sesionIniciada && (
          <Publicar
            misProductos={misProductos}
            categorias={categorias}
            esAdmin={esAdmin}
            ultimaPublicacion={ultimaPublicacion}
            usuario={usuario}
            onPublicar={publicarProducto}
            onEditar={editarProducto}
            onEliminar={eliminarProducto}
            onBorrarPublicados={borrarPublicados}
            onIrMercado={() => navegar("mercado")}
          />
        )}

        {pagina === "perfil" && sesionIniciada && (
          <Perfil
            idUsuario={usuario.id}
            onError={mostrarError}
            onProductosCambiaron={cargarProductos}
            onIrPublicar={() => navegar("publicar")}
          />
        )}

        {(pagina === "login" || ((pagina === "publicar" || pagina === "perfil") && !sesionIniciada)) && (
          <Login onIniciarSesion={iniciarSesion} onCrearCuenta={crearCuenta} />
        )}
      </main>

      <Footer />

      {carritoAbierto && (
        <ModalCarrito
          carrito={carrito}
          onCerrar={() => setCarritoAbierto(false)}
          onQuitar={quitarCarrito}
          onVaciar={vaciarCarrito}
          onComprar={comprar}
        />
      )}

    </>
  );
}
