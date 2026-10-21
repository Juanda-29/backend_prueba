import api from "./api";

// status: 0 = activos, 1 = inactivos, undefined = todos
export const cursosService = {
  listar: (status) => api.get("/cursos", { params: { status } }),
  crear: (datos) => api.post("/cursos/register", datos),
  actualizar: (id, datos) => api.put(`/cursos/update/${id}`, datos),
  activar: (id) => api.put(`/cursos/active/${id}`),
  desactivar: (id) => api.put(`/cursos/inactive/${id}`),
};
