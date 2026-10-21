<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { aprendicesService } from "../services/aprendices.service";
import { cursosService } from "../services/cursos.service";
import { apiError, showErrors, confirmar, toast, aviso, emailOk } from "../utils/alert";
import EstadoMarca from "../components/EstadoMarca.vue";
import FiltroEstado from "../components/FiltroEstado.vue";
import CampoForm from "../components/CampoForm.vue";

const aprendices = ref([]);
const opcionesCurso = ref([]); // [{ label, value: _id }] solo cursos ACTIVOS
const cargando = ref(true);
const guardando = ref(false);
const buscar = ref("");
const vista = ref("tarjetas"); // tarjetas | lista
const filtro = ref("todos"); // todos | activos | inactivos

const dialogo = ref(false);
const editId = ref(null);
const form = ref({ documento: "", nombre: "", email: "", curso: null });

const estadoApi = { todos: undefined, activos: 0, inactivos: 1 };

const columnas = [
  { name: "documento", label: "Documento", field: "documento", align: "left", sortable: true },
  { name: "nombre", label: "Nombre", field: "nombre", align: "left", sortable: true },
  { name: "email", label: "Email", field: "email", align: "left" },
  { name: "curso", label: "Curso", field: (a) => a.curso?.nombre || "Sin curso", align: "left", sortable: true },
  { name: "status", label: "Estado", field: "status", align: "left" },
  { name: "acciones", label: "Acciones", field: "acciones", align: "right" },
];

const cargar = async () => {
  cargando.value = true;
  try {
    const { data } = await aprendicesService.listar(estadoApi[filtro.value]);
    aprendices.value = data;
  } catch (e) {
    apiError(e);
  } finally {
    cargando.value = false;
  }
};

// El select de cursos: el backend solo acepta cursos ACTIVOS (status=0)
const cargarCursos = async () => {
  try {
    const { data } = await cursosService.listar(0);
    opcionesCurso.value = data.map((c) => ({ label: `${c.codigo} · ${c.nombre}`, value: c._id }));
  } catch (e) {
    apiError(e);
  }
};

onMounted(() => {
  cargar();
  cargarCursos();
});
watch(filtro, cargar);

const filas = computed(() => {
  const q = buscar.value.trim().toLowerCase();
  if (!q) return aprendices.value;
  return aprendices.value.filter(
    (a) =>
      a.documento.toLowerCase().includes(q) ||
      a.nombre.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      (a.curso?.nombre || "").toLowerCase().includes(q)
  );
});

// Presentacion en tarjetas: muestra de 12 en 12
const limite = ref(12);
const visibles = computed(() => filas.value.slice(0, limite.value));
const activosLista = computed(() => filas.value.filter((a) => a.status === 0).length);
const sinCursoLista = computed(() => filas.value.filter((a) => !a.curso).length);
const paleta = ["var(--verde)", "var(--cian)", "var(--amar)", "var(--verde)", "var(--mor)", "var(--azul)"];
const color = (i) => paleta[i % paleta.length];
watch([buscar, filtro], () => (limite.value = 12));

const abrirDialogo = async (aprendiz) => {
  await cargarCursos(); // por si se creo o desactivo un curso desde la otra pantalla
  editId.value = aprendiz?._id || null;
  let cursoInactivo = ""; // nombre del curso si el actual del aprendiz esta inactivo

  if (!aprendiz) {
    form.value = { documento: "", nombre: "", email: "", curso: null };
  } else {
    // aprendiz.curso es un objeto (populate); al backend se le envia solo el _id
    let cursoId = aprendiz.curso?._id || null;
    if (cursoId && !opcionesCurso.value.some((o) => o.value === cursoId)) {
      cursoInactivo = aprendiz.curso.nombre;
      cursoId = null;
    }
    form.value = { documento: aprendiz.documento, nombre: aprendiz.nombre, email: aprendiz.email, curso: cursoId };
  }
  dialogo.value = true;

  if (cursoInactivo) {
    aviso("Curso inactivo", `El curso actual (${cursoInactivo}) está inactivo.\nSelecciona un curso activo para guardar.`);
  }
};

const guardar = async () => {
  // Validaciones con SweetAlert2 (sin validaciones HTML)
  const f = form.value;
  const errores = [];
  const documento = String(f.documento).trim();
  const nombre = String(f.nombre).trim();
  const email = String(f.email).trim();
  if (!documento) errores.push("El documento es obligatorio");
  if (!nombre) errores.push("El nombre es obligatorio");
  if (!email) errores.push("El email es obligatorio");
  else if (!emailOk(email)) errores.push("El email no es válido");
  if (!f.curso) errores.push("Debes seleccionar un curso");
  if (errores.length) return showErrors(errores);

  // Solo los 4 campos que el backend espera. El documento SIEMPRE como texto.
  const datos = { documento, nombre, email, curso: f.curso };

  guardando.value = true;
  try {
    const { data } = editId.value
      ? await aprendicesService.actualizar(editId.value, datos)
      : await aprendicesService.crear(datos);
    dialogo.value = false;
    toast("success", data.msg);
    cargar();
  } catch (e) {
    apiError(e);
  } finally {
    guardando.value = false;
  }
};

const desactivar = async (aprendiz) => {
  if (!(await confirmar("¿Desactivar aprendiz?", aprendiz.nombre, "Sí, desactivar"))) return;
  try {
    const { data } = await aprendicesService.desactivar(aprendiz._id);
    toast("success", data.msg);
    cargar();
  } catch (e) {
    apiError(e);
  }
};

const activar = async (aprendiz) => {
  try {
    const { data } = await aprendicesService.activar(aprendiz._id);
    toast("success", data.msg);
    cargar();
  } catch (e) {
    apiError(e);
  }
};
</script>

<template>
  <div class="pagina-cabecera">
    <div>
      <div class="etiqueta">Registro de aprendices</div>
      <h1 class="display pagina-titulo">Aprendices</h1>
      <div class="resumen">
        <div class="pildora"><b>{{ filas.length }}</b> aprendices</div>
        <div class="pildora"><b>{{ activosLista }}</b> activos</div>
        <div class="pildora"><b>{{ sinCursoLista }}</b> sin curso</div>
      </div>
    </div>
    <q-btn color="primary" unelevated no-caps icon="add" class="btn-sena btn-redondo" label="Nuevo aprendiz" @click="abrirDialogo()" />
  </div>

  <div class="barra-herr">
    <q-input v-model="buscar" outlined dense clearable color="primary" class="buscador" placeholder="Buscar por documento, nombre, email o curso">
      <template #prepend><q-icon name="search" /></template>
    </q-input>
    <FiltroEstado v-model="filtro" />
    <q-btn-toggle v-model="vista" class="vista-sel" unelevated no-caps toggle-color="primary" color="hoja" text-color="tinta" toggle-text-color="white" :options="[{ icon: 'grid_view', value: 'tarjetas' }, { icon: 'view_list', value: 'lista' }]" />
  </div>

  <div v-if="cargando" class="flex flex-center q-pa-xl"><q-spinner-dots color="primary" size="48px" /></div>
  <div v-else-if="!filas.length" class="vacio"><q-icon name="groups" size="44px" /><div>No hay aprendices para mostrar</div></div>

  <div v-else-if="vista === 'tarjetas'" class="rejilla">
    <article v-for="(a, i) in visibles" :key="a._id" class="cc" :class="{ off: a.status !== 0 }" :style="{ '--c': color(i), animationDelay: Math.min(i, 12) * 0.04 + 's' }">
      <div class="cc-tapa">
        <div class="cc-fila"><span class="codigo">{{ a.curso?.codigo || "Sin curso" }}</span><EstadoMarca :status="a.status" /></div>
        <div class="cc-medio">
          <div class="avatar avatar-g" :style="{ '--c': color(i), width: '64px', height: '64px', fontSize: '1.6rem', borderRadius: '20px' }">{{ a.nombre.charAt(0).toUpperCase() }}</div>
          <div>
            <h3 class="cc-titulo" :title="a.nombre">{{ a.nombre }}</h3>
            <div class="etiqueta">Doc. {{ a.documento }}</div>
          </div>
        </div>
        <span class="cc-marca">{{ a.nombre.charAt(0).toUpperCase() }}</span>
      </div>
      <div class="cc-datos">
        <div class="dato"><q-icon name="mail_outline" size="18px" /><span :title="a.email">{{ a.email }}</span></div>
        <div class="dato"><q-icon name="school" size="18px" /><span v-if="a.curso">{{ a.curso.nombre }}</span><span v-else class="texto-suave">Sin curso</span></div>
      </div>
      <div class="cc-pie">
        <q-btn flat dense no-caps icon="edit" class="btn-sena btn-suave" label="Editar" @click="abrirDialogo(a)" />
        <q-btn v-if="a.status === 0" flat dense no-caps icon="block" class="btn-sena btn-suave rojo" label="Desactivar" @click="desactivar(a)" />
        <q-btn v-else flat dense no-caps icon="check_circle" class="btn-sena btn-suave" label="Activar" @click="activar(a)" />
      </div>
    </article>
  </div>

  <div v-else class="directorio">
    <div class="dir-cab etiqueta"><span>Aprendiz</span><span>Correo</span><span>Curso</span><span>Estado</span><span style="text-align: right">Acciones</span></div>
    <div v-for="(a, i) in visibles" :key="a._id" class="dir-fila" :class="{ off: a.status !== 0 }" :style="{ animationDelay: Math.min(i, 12) * 0.03 + 's' }">
      <div class="dir-persona">
        <div class="avatar" :style="{ '--c': color(i) }">{{ a.nombre.charAt(0).toUpperCase() }}</div>
        <div style="min-width: 0">
          <div class="dir-nom" :title="a.nombre">{{ a.nombre }}</div>
          <div class="dir-sub">Doc. {{ a.documento }}</div>
        </div>
      </div>
      <div class="dir-mail" :title="a.email">{{ a.email }}</div>
      <span v-if="a.curso" class="chip-curso" :title="a.curso.nombre">{{ a.curso.codigo }} · {{ a.curso.nombre }}</span>
      <span v-else class="texto-suave">Sin curso</span>
      <EstadoMarca :status="a.status" />
      <div class="dir-acc">
        <q-btn flat round dense icon="edit" title="Editar" @click="abrirDialogo(a)" />
        <q-btn v-if="a.status === 0" flat round dense color="negative" icon="block" title="Desactivar" @click="desactivar(a)" />
        <q-btn v-else flat round dense color="primary" icon="check_circle" title="Activar" @click="activar(a)" />
      </div>
    </div>
  </div>

  <div v-if="filas.length > limite" class="flex flex-center q-mt-lg">
    <q-btn outline rounded no-caps color="tinta" class="btn-sena" :label="`Mostrar más (${filas.length - limite})`" @click="limite += 12" />
  </div>

  <!-- Ficha crear / editar -->
  <q-dialog v-model="dialogo" persistent>
    <q-card square class="ficha" style="width: 480px; max-width: 94vw">
      <div class="ficha-cabecera">
        <span class="display">{{ editId ? "Editar aprendiz" : "Nuevo aprendiz" }}</span>
        <q-btn flat round dense icon="close" color="white" v-close-popup />
      </div>

      <q-card-section class="q-pa-lg">
        <CampoForm etiqueta="Documento">
          <q-input v-model="form.documento" outlined square color="tinta" bg-color="hoja" inputmode="numeric" />
        </CampoForm>
        <CampoForm etiqueta="Nombre completo">
          <q-input v-model="form.nombre" outlined square color="tinta" bg-color="hoja" />
        </CampoForm>
        <CampoForm etiqueta="Email">
          <q-input v-model="form.email" outlined square color="tinta" bg-color="hoja" />
        </CampoForm>
        <CampoForm etiqueta="Curso" :ayuda="opcionesCurso.length ? 'Solo se muestran los cursos activos' : 'No hay cursos activos. Crea o activa uno primero.'">
          <q-select v-model="form.curso" outlined square emit-value map-options color="tinta" bg-color="hoja" :options="opcionesCurso" />
        </CampoForm>
      </q-card-section>

      <q-card-actions align="right" class="q-px-lg q-pb-lg q-pt-none q-gutter-sm">
        <q-btn flat square no-caps class="btn-sena" label="Cancelar" v-close-popup />
        <q-btn color="primary" text-color="negro" square unelevated no-caps class="btn-sena" label="Guardar" :loading="guardando" @click="guardar" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
