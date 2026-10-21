import api from "./api";

// status: 0 = activos, 1 = inactivos, undefined = todos
// Al listar, el backend usa populate: "curso" llega como objeto { _id, codigo, nombre, ... }
export const aprendicesService = {
  listar: (status) => api.get("/aprendices", { params: { status } }),
  crear: (datos) => api.post("/aprendices/register", datos),
  actualizar: (id, datos) => api.put(`/aprendices/update/${id}`, datos),
  activar: (id) => api.put(`/aprendices/active/${id}`),
  desactivar: (id) => api.put(`/aprendices/inactive/${id}`),
};
