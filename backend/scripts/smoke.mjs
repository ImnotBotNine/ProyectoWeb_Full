// Pruebas de la API Infraganti (mismo estilo que smoke.mjs de la guía).
// Requisitos: las dos APIs encendidas y la base recién cargada con los scripts de db/.
// Ejecutar desde backend/:  node scripts/smoke.mjs
import assert from 'node:assert/strict';

const API = process.env.API_URL || 'http://127.0.0.1:8000';
const USUARIOS = process.env.USUARIOS_URL || 'http://127.0.0.1:8001';

async function request(url, method = 'GET', body, idUsuario) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (idUsuario !== undefined) headers['X-Usuario-Id'] = String(idUsuario);

  const res = await fetch(url, {
    method,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  return { status: res.status, data };
}

function ok(texto) {
  console.log('OK:', texto);
}

const productoBase = {
  nombre: 'Producto de prueba',
  categoria: 'libros',
  estado: 'disponible',
  precio: 1000,
  descripcion: 'Producto creado por el script de pruebas.',
  vendedor: 'Script',
  carrera: 'Informática',
  contacto: 'Campus',
  imagen: '',
};

// --- Login y perfil ---
const login = await request(`${USUARIOS}/login`, 'POST', { nick: 'mrojas', contrasena: 'mrojas123' });
assert.equal(login.status, 200);
const USUARIO = login.data.id;
const loginAdmin = await request(`${USUARIOS}/login`, 'POST', { nick: 'admin', contrasena: 'admin123' });
const ADMIN = loginAdmin.data.id;
assert.equal(loginAdmin.data.rol, 'admin');
assert.equal((await request(`${USUARIOS}/login`, 'POST', { nick: 'mrojas', contrasena: 'mala' })).status, 401);
ok('login correcto y login con contraseña incorrecta (401)');

const perfil = await request(`${USUARIOS}/usuarios/${USUARIO}`);
assert.equal(perfil.status, 200);
assert.equal(perfil.data.nick, 'mrojas');
assert.equal((await request(`${USUARIOS}/usuarios/9999`)).status, 404);
ok('perfil de usuario y perfil inexistente (404)');

assert.equal(login.data.telefono, '+56 9 6234 7710');
assert.equal((await request(`${USUARIOS}/usuarios/${USUARIO}`, 'GET', undefined, USUARIO)).data.telefono, '+56 9 6234 7710');
assert.equal(perfil.data.telefono, null);
ok('el teléfono llega al iniciar sesión y en el perfil propio, pero no en un perfil ajeno');

// --- Crear cuenta ---
const nickNuevo = 'nuevo' + Date.now();
const cuentaNueva = { nick: nickNuevo, contrasena: 'clave1234', nombre: 'Cuenta Nueva', carrera: 'Diseño', telefono: '+56 9 1111 2222' };
const registro = await request(`${USUARIOS}/registro`, 'POST', cuentaNueva);
assert.equal(registro.status, 201, JSON.stringify(registro.data));
assert.equal(registro.data.rol, 'usuario');
assert.equal(registro.data.telefono, '+56 9 1111 2222');
assert.equal((await request(`${USUARIOS}/registro`, 'POST', cuentaNueva)).status, 409);
assert.equal((await request(`${USUARIOS}/registro`, 'POST', { ...cuentaNueva, nick: nickNuevo + 'b', contrasena: 'corta' })).status, 422);
assert.equal((await request(`${USUARIOS}/registro`, 'POST', { ...cuentaNueva, nick: nickNuevo + 'c', telefono: '' })).status, 422);
assert.equal((await request(`${USUARIOS}/login`, 'POST', { nick: nickNuevo, contrasena: 'clave1234' })).status, 200);
ok('crear cuenta (201), nick repetido (409), contraseña corta o sin teléfono (422) e ingresar con la cuenta nueva');

// --- Categorías ---
const categorias = await request(`${API}/categorias`);
assert.equal(categorias.status, 200);
assert.ok(categorias.data.some((c) => c.id === 'libros'));
ok('categorías desde PostgreSQL');

// --- CRUD de productos ---
assert.equal((await request(`${API}/productos`, 'POST', productoBase)).status, 401);
ok('publicar sin sesión (401)');

const creado = await request(`${API}/productos`, 'POST', productoBase, ADMIN);
assert.equal(creado.status, 201, JSON.stringify(creado.data));
assert.equal(creado.data.usuario_id, ADMIN);
const idProducto = creado.data.id;
ok('crear producto (201) queda asociado a quien lo publica');

const lista = await request(`${API}/productos`);
assert.ok(lista.data.some((p) => p.id === idProducto));
assert.equal((await request(`${API}/productos/${idProducto}`)).status, 200);
assert.equal((await request(`${API}/productos/999999`)).status, 404);
ok('listar, consultar y producto inexistente (404)');

assert.equal((await request(`${API}/productos`, 'POST', { ...productoBase, nombre: 'ab', precio: -1 }, ADMIN)).status, 422);
assert.equal((await request(`${API}/productos`, 'POST', { ...productoBase, categoria: 'inventada' }, ADMIN)).status, 400);
ok('validaciones: datos inválidos (422) y categoría inexistente (400)');

assert.equal((await request(`${API}/productos/${idProducto}`, 'PUT', { ...productoBase, precio: 2000 }, USUARIO)).status, 403);
assert.equal((await request(`${API}/productos/${idProducto}`, 'DELETE', undefined, USUARIO)).status, 403);
ok('otro usuario no puede editar ni borrar (403)');

const editado = await request(`${API}/productos/${idProducto}`, 'PUT', { ...productoBase, precio: 2000 }, ADMIN);
assert.equal(editado.status, 200);
assert.equal(editado.data.precio, 2000);
ok('el dueño edita su producto');

// --- Favoritos ---
assert.equal((await request(`${API}/usuarios/${USUARIO}/favoritos/${idProducto}`, 'POST', undefined, USUARIO)).status, 201);
assert.equal((await request(`${API}/usuarios/${USUARIO}/favoritos/${idProducto}`, 'POST', undefined, USUARIO)).status, 409);
assert.ok((await request(`${API}/usuarios/${USUARIO}/favoritos`, 'GET', undefined, USUARIO)).data.includes(idProducto));
assert.equal((await request(`${API}/usuarios/${USUARIO}/favoritos`, 'GET', undefined, ADMIN + 100)).status, 401);
assert.equal((await request(`${API}/usuarios/${USUARIO}/favoritos/${idProducto}`, 'DELETE', undefined, USUARIO)).status, 200);
ok('favoritos: agregar, repetido (409), listar, usuario inválido (401), quitar');

// --- Carrito y reglas de negocio ---
await request(`${API}/usuarios/${USUARIO}/carrito`, 'DELETE', undefined, USUARIO);
const propio = (await request(`${API}/productos`, 'POST', productoBase, USUARIO)).data;
assert.equal((await request(`${API}/usuarios/${USUARIO}/carrito/${propio.id}`, 'POST', undefined, USUARIO)).status, 409);
assert.equal((await request(`${API}/productos/${propio.id}`, 'DELETE', undefined, USUARIO)).status, 200);
ok('regla: no se puede comprar el propio producto (409)');

assert.equal((await request(`${API}/usuarios/${USUARIO}/carrito/${idProducto}`, 'POST', undefined, USUARIO)).status, 201);
assert.equal((await request(`${API}/usuarios/${USUARIO}/carrito/${idProducto}`, 'POST', undefined, USUARIO)).status, 409);
assert.equal((await request(`${API}/usuarios/${ADMIN}/carrito`, 'GET', undefined, USUARIO)).status, 403);
ok('carrito: agregar, repetido (409), carrito ajeno (403)');

// --- Pedido con pago contra entrega ---
// Vendedora: cperez publica un producto; comprador: mrojas lo pide
const loginVendedora = await request(`${USUARIOS}/login`, 'POST', { nick: 'cperez', contrasena: 'cperez123' });
const VENDEDORA = loginVendedora.data.id;
const productoVenta = (await request(`${API}/productos`, 'POST', { ...productoBase, precio: 3000 }, VENDEDORA)).data;

assert.equal((await request(`${API}/usuarios/${USUARIO}/carrito`, 'DELETE', undefined, USUARIO)).status, 200);
assert.equal((await request(`${API}/usuarios/${USUARIO}/carrito/${productoVenta.id}`, 'POST', undefined, USUARIO)).status, 201);
const creados = await request(`${API}/usuarios/${USUARIO}/pedidos`, 'POST', undefined, USUARIO);
assert.equal(creados.status, 201, JSON.stringify(creados.data));
assert.equal(creados.data.length, 1);
const pedido = creados.data[0];
assert.equal(pedido.estado, 'pendiente');
assert.equal(pedido.vendedor_id, VENDEDORA);
assert.equal(pedido.total, 3000);
assert.equal(pedido.vendedor_telefono, '+56 9 7381 2245');
assert.equal(pedido.comprador_telefono, '+56 9 6234 7710');
assert.equal((await request(`${API}/usuarios/${USUARIO}/carrito`, 'GET', undefined, USUARIO)).data.length, 0);
assert.equal((await request(`${API}/usuarios/${USUARIO}/pedidos`, 'POST', undefined, USUARIO)).status, 400);
ok('solicitud de compra: un pedido por vendedor (201) con los teléfonos para juntarse, carrito vacío después, sin productos (400)');

assert.equal((await request(`${API}/pedidos/${pedido.id}/estado`, 'PATCH', { estado: 'entregado' }, VENDEDORA)).status, 409);
assert.equal((await request(`${API}/pedidos/${pedido.id}/estado`, 'PATCH', { estado: 'aceptado' }, USUARIO)).status, 403);
ok('salto de estado inválido (409) y el comprador no puede aceptar (403)');

assert.equal((await request(`${API}/pedidos/${pedido.id}/estado`, 'PATCH', { estado: 'aceptado' }, VENDEDORA)).status, 200);
assert.equal((await request(`${API}/productos/${productoVenta.id}`)).data.estado, 'vendido');
assert.equal((await request(`${API}/usuarios/${USUARIO}/carrito/${productoVenta.id}`, 'POST', undefined, USUARIO)).status, 409);
ok('la vendedora acepta: el producto queda vendido y ya no se puede agregar al carrito (409)');

assert.equal((await request(`${API}/pedidos/${pedido.id}/estado`, 'PATCH', { estado: 'entregado' }, USUARIO)).status, 403);
const entregado = await request(`${API}/pedidos/${pedido.id}/estado`, 'PATCH', { estado: 'entregado' }, VENDEDORA);
assert.equal(entregado.status, 200);
assert.ok(entregado.data.fecha_entrega !== null);
ok('pago contra entrega: solo la vendedora marca entregado y pagado, y queda la fecha');

const compras = await request(`${API}/usuarios/${USUARIO}/pedidos`, 'GET', undefined, USUARIO);
assert.equal(compras.data.find((p) => p.id === pedido.id).estado, 'entregado');
const ventas = await request(`${API}/usuarios/${VENDEDORA}/ventas`, 'GET', undefined, VENDEDORA);
assert.ok(ventas.data.some((v) => v.id === pedido.id && v.comprador === 'mrojas'));
assert.equal((await request(`${API}/usuarios/${VENDEDORA}/ventas`, 'GET', undefined, USUARIO)).status, 403);
assert.equal((await request(`${API}/pedidos/${pedido.id}`, 'GET', undefined, VENDEDORA)).status, 200);
ok('seguimiento: aparece en Mis compras y en Mis ventas; ventas ajenas (403)');

// Cancelación por el comprador mientras está pendiente
await request(`${API}/usuarios/${USUARIO}/carrito/${idProducto}`, 'DELETE', undefined, USUARIO);
const productoCancelar = (await request(`${API}/productos`, 'POST', productoBase, VENDEDORA)).data;
await request(`${API}/usuarios/${USUARIO}/carrito/${productoCancelar.id}`, 'POST', undefined, USUARIO);
const pedidoCancelar = (await request(`${API}/usuarios/${USUARIO}/pedidos`, 'POST', undefined, USUARIO)).data[0];
assert.equal((await request(`${API}/usuarios/${ADMIN}/carrito/${productoCancelar.id}`, 'POST', undefined, ADMIN)).status, 409);
assert.equal((await request(`${API}/pedidos/${pedidoCancelar.id}/estado`, 'PATCH', { estado: 'cancelado' }, VENDEDORA)).status, 403);
assert.equal((await request(`${API}/pedidos/${pedidoCancelar.id}/estado`, 'PATCH', { estado: 'cancelado' }, USUARIO)).status, 200);
assert.equal((await request(`${API}/productos/${productoCancelar.id}`)).data.estado, 'disponible');
ok('producto con pedido en curso no se agrega a otro carrito (409); solo el comprador cancela y el producto sigue disponible');

assert.equal((await request(`${API}/productos/${productoVenta.id}`, 'DELETE', undefined, VENDEDORA)).status, 409);
ok('regla: un producto con pedido no se puede borrar (409)');

console.log('PRUEBAS FINALIZADAS');
