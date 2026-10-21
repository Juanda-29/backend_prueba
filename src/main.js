import { createApp } from "vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { Quasar, Dark } from "quasar";
import es from "quasar/lang/es";

// Tipografias (se instalan con npm, no dependen de internet al ejecutar)
import "@fontsource/barlow/400.css";
import "@fontsource/barlow/500.css";
import "@fontsource/barlow/600.css";
import "@fontsource/barlow-condensed/600.css";
import "@fontsource/barlow-condensed/700.css";

import "@quasar/extras/material-icons/material-icons.css";
import "quasar/dist/quasar.css";
import "./css/app.css";
import App from "./App.vue";
import router from "./router";
import { useTemaStore } from "./stores/tema";

// Pinia con persistencia: guarda el store de autenticacion en localStorage
// para que la sesion sobreviva al recargar la pagina.
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const app = createApp(App).use(pinia).use(router).use(Quasar, { plugins: { Dark }, lang: es });

// Aplica el modo (noche/dia) guardado ANTES de pintar, para que no parpadee
useTemaStore(pinia).aplicar();

app.mount("#app");
