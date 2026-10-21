import Swal from "sweetalert2";

// TODAS las alertas y validaciones de la app salen de este archivo, con SweetAlert2.
// No se usa alert(), confirm(), prompt(), ni validaciones HTML (required, type="email"...).
// Los textos se envian como texto plano (nunca como HTML).
// Lee una variable CSS del tema actual (cambia entre modo dia y modo noche)
const css = (v) => getComputedStyle(document.body).getPropertyValue(v).trim();

const base = {
  fire: (opciones) =>
    Swal.fire({
      customClass: { popup: "swal-sena", confirmButton: "swal-boton", cancelButton: "swal-boton" },
      confirmButtonColor: "#39a900",
      cancelButtonColor: "#5d6a70",
      background: css("--hoja"), // fondo y texto segun el modo activo
      color: css("--tinta"),
      ...opciones,
    }),
};

// Aviso pequeno en la esquina (exito, informacion)
export const toast = (icon, title) =>
  base.fire({
    toast: true,
    position: "top-end",
    icon,
    title,
    showConfirmButton: false,
    timer: 2800,
    timerProgressBar: true,
  });

// Lista de errores de validacion de un formulario (texto con vinetas)
export const showErrors = (errors) =>
  base.fire({
    icon: "warning",
    title: "Revisa los datos",
    text: errors.map((e) => `• ${e}`).join("\n"),
    customClass: { popup: "swal-sena", confirmButton: "swal-boton", htmlContainer: "swal-izq" },
    confirmButtonText: "Entendido",
  });

// Aviso informativo sencillo
export const aviso = (title, text) => base.fire({ icon: "info", title, text, confirmButtonText: "Entendido" });

// Pregunta Si/No. Devuelve true si el usuario confirma.
export const confirmar = async (title, text, textoBoton = "Aceptar") =>
  (
    await base.fire({
      icon: "question",
      title,
      text,
      showCancelButton: true,
      confirmButtonText: textoBoton,
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    })
  ).isConfirmed;

// Aviso cuando el token vencio o ya no es valido
export const sesionExpirada = () =>
  base.fire({
    icon: "info",
    title: "Tu sesión expiró",
    text: "Por seguridad debes iniciar sesión de nuevo.",
    confirmButtonText: "Ir al inicio de sesión",
  });

// Muestra el error que devuelve el backend. El backend responde:
//   { msg: "..." }                        -> un solo mensaje
//   { msg: "...", errors: ["...", ...] }  -> lista de errores de validacion
export const apiError = (e) => {
  // Si fue un 401 el interceptor ya mostro "sesion expirada": no repetir.
  if (e?.sesionExpirada) return;

  const data = e?.response?.data;

  if (Array.isArray(data?.errors) && data.errors.length) {
    return showErrors(data.errors.map((x) => (typeof x === "string" ? x : x?.msg || "Dato no válido")));
  }

  const texto =
    data?.msg ||
    (e?.response
      ? "Ocurrió un error inesperado"
      : "No hay conexión con el servidor. Verifica que el backend esté encendido.");

  return base.fire({ icon: "error", title: "No se pudo completar", text: texto });
};

// Validacion sencilla de email (se usa con showErrors, no con HTML)
export const emailOk = (valor) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
