import { defineStore } from "pinia";

// Store de autenticacion: guarda el token y el usuario que devolvio el login.
// "persist: true" (pinia-plugin-persistedstate) lo guarda en localStorage,
// asi la sesion NO se pierde al recargar la pagina.
export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: "",
    usuario: null,
  }),

  getters: {
    // true si hay sesion iniciada
    isAuth: (state) => !!state.token,
  },

  actions: {
    // Se llama despues de un login exitoso con la respuesta { usuario, token }
    setSession({ token, usuario }) {
      this.token = token;
      this.usuario = usuario;
    },

    // Borra token y usuario (tambien del almacenamiento persistido)
    logout() {
      this.token = "";
      this.usuario = null;
    },
  },

  persist: true,
});
