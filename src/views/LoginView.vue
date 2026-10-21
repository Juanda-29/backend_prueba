<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { usuariosService } from "../services/usuarios.service";
import { useAuthStore } from "../stores/auth";
import { apiError, showErrors, emailOk, toast } from "../utils/alert";
import CampoForm from "../components/CampoForm.vue";
import BotonTema from "../components/BotonTema.vue";

const auth = useAuthStore();
const router = useRouter();

const form = ref({ email: "", password: "" });
const verClave = ref(false);
const cargando = ref(false);
const logoCargado = ref(false); // public/logo-sena.png (opcional)

const entrar = async () => {
  // Validaciones con SweetAlert2 (sin validaciones HTML)
  const errores = [];
  const email = form.value.email.trim();
  if (!email) errores.push("El correo es obligatorio");
  else if (!emailOk(email)) errores.push("El correo no es válido");
  if (!form.value.password) errores.push("La contraseña es obligatoria");
  if (errores.length) return showErrors(errores);

  cargando.value = true;
  try {
    const { data } = await usuariosService.login({ email, password: form.value.password });
    auth.setSession(data); // guarda token y usuario en Pinia (persistido)
    toast("success", `Bienvenido, ${data.usuario.nombre}`);
    router.push("/");
  } catch (e) {
    apiError(e);
  } finally {
    cargando.value = false;
  }
};
</script>

<template>
  <div class="login">
    <div class="login-fondo"></div>
    <span class="orbe o1"></span><span class="orbe o2"></span><span class="orbe o3"></span>
    <BotonTema class="login-tema" />

    <main class="tarjeta">
      <section class="tarjeta-marca">
        <div class="marca-fila">
          <img v-show="logoCargado" src="/logo-sena.png" alt="SENA" class="riel-logo" @load="logoCargado = true" />
          <div v-if="!logoCargado" class="riel-sigla">SENA</div>
          <div class="riel-nombre">Servicio Nacional de Aprendizaje</div>
        </div>

        <div style="position: relative">
          <span class="login-chip">Plataforma en línea</span>
          <h1 class="display login-titular">Gestión de <em>formación</em></h1>
          <p class="login-texto">Administra cursos y aprendices en un solo lugar, de forma simple y ordenada.</p>
        </div>

        <div class="login-etiquetas">
          <span><q-icon name="school" size="16px" /> Cursos</span>
          <span><q-icon name="groups" size="16px" /> Aprendices</span>
          <span><q-icon name="insights" size="16px" /> Seguimiento</span>
        </div>
      </section>

      <section class="tarjeta-form">
        <div class="login-form">
          <div class="etiqueta">Acceso al sistema</div>
          <h2 class="display login-titulo">Iniciar sesión</h2>
          <p class="login-sub">Ingresa con tu correo institucional.</p>

          <CampoForm etiqueta="Correo">
            <q-input v-model="form.email" outlined color="primary" placeholder="usuario@sena.edu.co" autocomplete="username" @keyup.enter="entrar">
              <template #prepend><q-icon name="mail_outline" size="20px" /></template>
            </q-input>
          </CampoForm>

          <CampoForm etiqueta="Contraseña">
            <q-input v-model="form.password" outlined color="primary" placeholder="••••••••" autocomplete="current-password" :type="verClave ? 'text' : 'password'" @keyup.enter="entrar">
              <template #prepend><q-icon name="lock_outline" size="20px" /></template>
              <template #append>
                <q-icon :name="verClave ? 'visibility_off' : 'visibility'" class="cursor-pointer" size="20px" @click="verClave = !verClave" />
              </template>
            </q-input>
          </CampoForm>

          <q-btn color="primary" unelevated no-caps size="lg" class="full-width btn-sena q-mt-md" label="Ingresar" :loading="cargando" @click="entrar" />
          <div class="login-pie">SENA · ADSO</div>
        </div>
      </section>
    </main>
  </div>
</template>
