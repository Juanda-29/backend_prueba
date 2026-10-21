import api from "./api";

// POST /api/usuarios/login -> { usuario, token }
// El registro de usuarios (/usuarios/register) requiere token, por eso
// NO existe pantalla de registro publico.
export const usuariosService = {
  login: (datos) => api.post("/usuarios/login", datos),
};
