import { createRouter, createWebHashHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";

// Modo hash (/#/cursos): las URLs funcionan aunque se recargue la pagina.
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/login",
      component: () => import("../views/LoginView.vue"),
      meta: { soloInvitados: true },
    },
    {
      // Todas las rutas hijas heredan requiereSesion
      path: "/",
      component: () => import("../layouts/MainLayout.vue"),
      meta: { requiereSesion: true },
      children: [
        { path: "", component: () => import("../views/DashboardView.vue"), meta: { titulo: "Tablero" } },
        { path: "cursos", component: () => import("../views/CursosView.vue"), meta: { titulo: "Cursos" } },
        { path: "aprendices", component: () => import("../views/AprendicesView.vue"), meta: { titulo: "Aprendices" } },
      ],
    },
    { path: "/:pathMatch(.*)*", redirect: "/" },
  ],
});

// Guardia: se ejecuta antes de cada cambio de pagina
router.beforeEach((to) => {
  const auth = useAuthStore();

  // Sin sesion no se puede entrar a las paginas privadas
  if (to.matched.some((r) => r.meta.requiereSesion) && !auth.isAuth) return "/login";

  // Con sesion no tiene sentido volver al login
  if (to.meta.soloInvitados && auth.isAuth) return "/";
});

export default router;
