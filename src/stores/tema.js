import { defineStore } from "pinia";
import { Dark } from "quasar";

// Modo noche / modo dia. Se guarda con pinia-plugin-persistedstate, asi la
// eleccion sobrevive al recargar. La primera vez sigue el tema del sistema.
export const useTemaStore = defineStore("tema", {
  state: () => ({
    oscuro: window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false,
  }),

  actions: {
    // Pasa el estado guardado a Quasar (pone/quita la clase body--dark)
    aplicar() {
      Dark.set(this.oscuro);
    },
    alternar() {
      this.oscuro = !this.oscuro;
      this.aplicar();
    },
  },

  persist: true,
});
