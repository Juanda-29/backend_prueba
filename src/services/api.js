import axios from "axios";
import { useAuthStore } from "../stores/auth";
import router from "../router";
import { sesionExpirada } from "../utils/alert";

// Servicio central de Axios. La URL sale de .env (VITE_API_URL), asi que si el
// backend cambia de direccion solo se edita el .env.
// El frontend NUNCA habla con MongoDB: solo con esta API.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Antes de CADA peticion: si hay token, se manda en la cabecera x-token
api.interceptors.request.use((config) => {
  const auth = useAuthStore();
  if (auth.token) config.headers["x-token"] = auth.token;
  return config;
});

// Despues de CADA respuesta: un 401 significa token vencido o invalido.
// (El login con clave mala responde 400, no 401, por eso no se confunde.)
api.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    const auth = useAuthStore();

    if (error.response?.status === 401 && auth.isAuth) {
      auth.logout();
      router.replace("/login");
      sesionExpirada();
      error.sesionExpirada = true; // para que apiError no muestre otro mensaje
    }

    return Promise.reject(error);
  }
);

export default api;
