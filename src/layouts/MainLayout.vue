<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { confirmar, toast } from "../utils/alert";
import BotonTema from "../components/BotonTema.vue";

const auth = useAuthStore();
const router = useRouter();
const logoCargado = ref(false); // public/logo-sena.png (opcional)

const enlaces = [
  { to: "/", etiqueta: "Panorama", icono: "space_dashboard" },
  { to: "/cursos", etiqueta: "Cursos", icono: "school" },
  { to: "/aprendices", etiqueta: "Aprendices", icono: "groups" },
];

const salir = async () => {
  if (!(await confirmar("¿Cerrar sesión?", "Tendrás que ingresar de nuevo.", "Sí, salir"))) return;
  auth.logout();
  router.replace("/login");
  toast("success", "Sesión cerrada");
};
</script>

<template>
  <div class="app2">
    <header class="flota">
      <div class="marca">
        <img v-show="logoCargado" src="/logo-sena.png" alt="SENA" class="marca-logo" @load="logoCargado = true" />
        <span v-if="!logoCargado" class="marca-sigla">SENA</span>
        <div>
          <div class="marca-nombre">Gestión de formación</div>
          <div class="marca-sub">Cursos y aprendices</div>
        </div>
      </div>

      <nav class="nav">
        <router-link v-for="e in enlaces" :key="e.to" :to="e.to" custom v-slot="{ href, navigate, isExactActive }">
          <a :href="href" class="nav-enlace" :class="{ 'nav-activo': isExactActive }" @click="navigate">
            <q-icon :name="e.icono" size="18px" /><span>{{ e.etiqueta }}</span>
          </a>
        </router-link>
      </nav>

      <BotonTema />
      <div class="usuario-chip">
        <div class="avatar">{{ (auth.usuario?.nombre || "U").charAt(0).toUpperCase() }}</div>
        <div class="datos">
          <div class="text-weight-bold" style="line-height: 1.1">{{ auth.usuario?.nombre }}</div>
          <div class="etiqueta" style="font-size: 0.56rem">{{ auth.usuario?.email }}</div>
        </div>
        <q-btn flat dense round icon="logout" aria-label="Cerrar sesión" @click="salir" />
      </div>
    </header>

    <main class="pagina"><router-view /></main>
  </div>
</template>
