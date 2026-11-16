// Servicios para conectarse a la API propia (FastAPI + PostgreSQL).
// y un objeto por recurso con sus operaciones.
const URL_API = "http://127.0.0.1:8000";
const URL_USUARIOS = "http://127.0.0.1:8001";

// Id de quien tiene la sesión. Se envía en cada petición en la cabecera X-Usuario-Id,
// igual que la guía envía la cabecera X-DB-Provider.
let idUsuarioActual = null;

export function usarUsuario(idUsuario) {
  idUsuarioActual = idUsuario;
}

export async function apiRequest(url, options = {}) {
  const { method = "GET", body } = options;
  let response = null;
  try {
    response = await fetch(url, {
      method,
      headers: {
        ...(idUsuarioActual !== null ? { "X-Usuario-Id": String(idUsuarioActual) } : {}),
        ...(body !== undefined ? { "Content-Type": "application/json" } : {})
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {})
    });
  } catch (error) {
    console.log(error);
  }
  if (response === null) {
    throw new Error("No fue posible conectar con la API. Revisa que esté encendida.");
  }
  const result = await response.json();
  if (!response.ok) {
    // FastAPI responde los errores como { "detail": "mensaje" }.
    // En los datos inválidos (422) de Pydantic, "detail" es una lista.
    if (response.status === 422 && Array.isArray(result.detail)) {
      throw new Error("Hay datos inválidos en el formulario.");
    }
    throw new Error(result.detail || `Error HTTP ${response.status}`);
  }
  return result;
}

export const categoriasApi = {
  listar: () => apiRequest(`${URL_API}/categorias`)
};

export const productosApi = {
  listar: () => apiRequest(`${URL_API}/productos`),
  crear: (producto) => apiRequest(`${URL_API}/productos`, { method: "POST", body: producto }),
  editar: (id, producto) => apiRequest(`${URL_API}/productos/${id}`, { method: "PUT", body: producto }),
  eliminar: (id) => apiRequest(`${URL_API}/productos/${id}`, { method: "DELETE" })
};

export const usuariosApi = {
  login: (nick, contrasena) => apiRequest(`${URL_USUARIOS}/login`, { method: "POST", body: { nick, contrasena } }),
  registrar: (datos) => apiRequest(`${URL_USUARIOS}/registro`, { method: "POST", body: datos }),
  perfil: (idUsuario) => apiRequest(`${URL_USUARIOS}/usuarios/${idUsuario}`)
};

export const favoritosApi = {
  listar: (idUsuario) => apiRequest(`${URL_API}/usuarios/${idUsuario}/favoritos`),
  agregar: (idUsuario, idProducto) => apiRequest(`${URL_API}/usuarios/${idUsuario}/favoritos/${idProducto}`, { method: "POST" }),
  quitar: (idUsuario, idProducto) => apiRequest(`${URL_API}/usuarios/${idUsuario}/favoritos/${idProducto}`, { method: "DELETE" })
};

export const carritoApi = {
  listar: (idUsuario) => apiRequest(`${URL_API}/usuarios/${idUsuario}/carrito`),
  agregar: (idUsuario, idProducto) => apiRequest(`${URL_API}/usuarios/${idUsuario}/carrito/${idProducto}`, { method: "POST" }),
  quitar: (idUsuario, idProducto) => apiRequest(`${URL_API}/usuarios/${idUsuario}/carrito/${idProducto}`, { method: "DELETE" }),
  vaciar: (idUsuario) => apiRequest(`${URL_API}/usuarios/${idUsuario}/carrito`, { method: "DELETE" })
};

export const pedidosApi = {
  listar: (idUsuario) => apiRequest(`${URL_API}/usuarios/${idUsuario}/pedidos`),
  crear: (idUsuario) => apiRequest(`${URL_API}/usuarios/${idUsuario}/pedidos`, { method: "POST" }),
  ventas: (idUsuario) => apiRequest(`${URL_API}/usuarios/${idUsuario}/ventas`),
  cambiarEstado: (idPedido, estado) => apiRequest(`${URL_API}/pedidos/${idPedido}/estado`, { method: "PATCH", body: { estado } })
};

