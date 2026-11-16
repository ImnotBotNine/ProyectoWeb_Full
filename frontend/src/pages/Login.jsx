import { useState } from "react";

import "../styles/login.css";

const REGISTRO_VACIO = { nick: "", contrasena: "", nombre: "", carrera: "", telefono: "" };

// Revisa el formulario de registro antes de enviarlo; devuelve "" si está bien
function validarRegistro(datos) {
  if (datos.nick.length < 3) {
    return "El nick debe tener al menos 3 caracteres.";
  }
  if (datos.nick.includes(" ")) {
    return "El nick no puede tener espacios.";
  }
  if (datos.contrasena.length < 8) {
    return "La contraseña debe tener al menos 8 caracteres.";
  }
  if (datos.nombre.length < 3) {
    return "Escribe tu nombre.";
  }
  if (datos.carrera.length < 2) {
    return "Escribe tu carrera.";
  }

  if (datos.telefono.length < 8) {
    return "Escribe un teléfono válido, por ejemplo +56 9 1234 5678.";
  }
  return "";
}

export default function Login({ onIniciarSesion, onCrearCuenta }) {
  // "ingresar" o "registro": cuál de las dos pestañas se ve
  const [modo, setModo] = useState("ingresar");

  const [nick, setNick] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [registro, setRegistro] = useState(REGISTRO_VACIO);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  function cambiarModo(nuevoModo) {
    setModo(nuevoModo);
    setError("");
  }

  async function ingresar(event) {
    event.preventDefault();

    if (nick.trim() === "" || contrasena === "") {
      setError("Completa el nick y la contraseña.");
      return;
    }

    setEnviando(true);
    const mensajeError = await onIniciarSesion(nick.trim(), contrasena);
    setEnviando(false);

    if (mensajeError !== "") {
      setError(mensajeError);
      setContrasena("");
    }
  }

  async function crearCuenta(event) {
    event.preventDefault();

    const datos = {
      nick: registro.nick.trim(),
      contrasena: registro.contrasena,
      nombre: registro.nombre.trim(),
      carrera: registro.carrera.trim(),
      telefono: registro.telefono.trim()
    };

    const mensajeValidacion = validarRegistro(datos);
    if (mensajeValidacion !== "") {
      setError(mensajeValidacion);
      return;
    }

    setEnviando(true);
    const mensajeError = await onCrearCuenta(datos);
    setEnviando(false);

    if (mensajeError !== "") {
      setError(mensajeError);
    }
  }

  return (
    <section className="login-contenido">
      <img src="/assets/images/fondo-login.jpg" alt="" className="login-fondo" />
      <div className="login-velo"></div>

      <div className="container login-escenario">
        <div className="row login-fila">
          {/* Izquierda: marca */}
          <div className="col-12 col-lg-6 login-marca">
            <div className="login-marca-logo">
              <img src="/assets/images/icon.png" alt="Logo de Infraganti" />
              <span>Infraganti</span>
            </div>
            <p className="login-marca-lema">Compra y vende, sin salir del campus</p>
          </div>

          {/* Derecha: tarjeta con las pestañas Iniciar sesión / Crear cuenta */}
          <div className="col-12 col-md-8 col-lg-5">
            <div className="card login-card">
              <div className="login-pestanas">
                <button
                  type="button"
                  className={modo === "ingresar" ? "login-pestana activa" : "login-pestana"}
                  onClick={() => cambiarModo("ingresar")}
                >
                  Iniciar sesión
                </button>
                <button
                  type="button"
                  className={modo === "registro" ? "login-pestana activa" : "login-pestana"}
                  onClick={() => cambiarModo("registro")}
                >
                  Crear cuenta
                </button>
              </div>

              <div className="card-body">
                {modo === "ingresar" && (
                  <form onSubmit={ingresar}>
                    <h3 className="login-titulo">Ingresa a tu cuenta</h3>

                    <div className="mb-3">
                      <label htmlFor="loginNick" className="form-label">Nick</label>
                      <input
                        type="text"
                        className="form-control"
                        id="loginNick"
                        value={nick}
                        onChange={(event) => setNick(event.target.value)}
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="password" className="form-label">Contraseña</label>
                      <input
                        type="password"
                        className="form-control"
                        id="password"
                        value={contrasena}
                        onChange={(event) => setContrasena(event.target.value)}
                      />
                    </div>

                    {error && <div className="alert alert-danger">{error}</div>}

                    <button type="submit" className="btn-ingresar w-100" disabled={enviando}>
                      {enviando ? "Ingresando..." : "Ingresar"}
                    </button>

                    <p className="login-cambiar">
                      ¿No tienes cuenta?{" "}
                      <button type="button" className="btn-enlace" onClick={() => cambiarModo("registro")}>
                        Crea una aquí
                      </button>
                    </p>
                  </form>
                )}

                {modo === "registro" && (
                  <form onSubmit={crearCuenta}>
                    <h3 className="login-titulo">Regístrate y empieza a comprar</h3>

                    <div className="mb-2">
                      <label htmlFor="registroNick" className="form-label">Nick</label>
                      <input
                        type="text"
                        className="form-control"
                        id="registroNick"
                        placeholder="Sin espacios"
                        value={registro.nick}
                        onChange={(e) => setRegistro({ ...registro, nick: e.target.value })}
                      />
                    </div>

                    <div className="mb-2">
                      <label htmlFor="registroContrasena" className="form-label">Contraseña</label>
                      <input
                        type="password"
                        className="form-control"
                        id="registroContrasena"
                        placeholder="Al menos 8 caracteres"
                        value={registro.contrasena}
                        onChange={(e) => setRegistro({ ...registro, contrasena: e.target.value })}
                      />
                    </div>

                    <div className="mb-2">
                      <label htmlFor="registroNombre" className="form-label">Nombre</label>
                      <input
                        type="text"
                        className="form-control"
                        id="registroNombre"
                        placeholder="Nombre y apellido"
                        value={registro.nombre}
                        onChange={(e) => setRegistro({ ...registro, nombre: e.target.value })}
                      />
                    </div>

                    <div className="mb-2">
                      <label htmlFor="registroCarrera" className="form-label">Carrera</label>
                      <input
                        type="text"
                        className="form-control"
                        id="registroCarrera"
                        placeholder="Ej: Informática"
                        value={registro.carrera}
                        onChange={(e) => setRegistro({ ...registro, carrera: e.target.value })}
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="registroTelefono" className="form-label">Teléfono</label>
                      <input
                        type="tel"
                        className="form-control"
                        id="registroTelefono"
                        placeholder="+56 9 1234 5678"
                        value={registro.telefono}
                        onChange={(e) => setRegistro({ ...registro, telefono: e.target.value })}
                      />
                    </div>

                    {error && <div className="alert alert-danger">{error}</div>}

                    <p className="login-nota">
                      Tu teléfono solo lo verá la otra persona cuando se acepte un pedido, para que se junten a hacer la entrega.
                    </p>

                    <button type="submit" className="btn-crear-cuenta w-100" disabled={enviando}>
                      {enviando ? "Creando cuenta..." : "Crear cuenta"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
