<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { cursosService } from "../services/cursos.service";
import { apiError, showErrors, confirmar, toast } from "../utils/alert";
import EstadoMarca from "../components/EstadoMarca.vue";
import FiltroEstado from "../components/FiltroEstado.vue";
import CampoForm from "../components/CampoForm.vue";

const cursos = ref([]);
const cargando = ref(true);
const guardando = ref(false);
const buscar = ref("");
const vista = ref("portadas"); // portadas | lista
const filtro = ref("todos"); // todos | activos | inactivos

const dialogo = ref(false);
const editId = ref(null); // null = creando, con valor = editando
const form = ref({ codigo: "", nombre: "", duracion: "" });

// Valor de ?status= para cada filtro (todos = sin parametro)
const estadoApi = { todos: undefined, activos: 0, inactivos: 1 };

const columnas = [
  { name: "codigo", label: "Código", field: "codigo", align: "left", sortable: true },
  { name: "nombre", label: "Nombre", field: "nombre", align: "left", sortable: true },
  { name: "duracion", label: "Duración", field: "duracion", align: "right", sortable: true },
  { name: "status", label: "Estado", field: "status", align: "left" },
  { name: "acciones", label: "Acciones", field: "acciones", align: "right" },
];

const cargar = async () => {
  cargando.value = true;
  try {
    const { data } = await cursosService.listar(estadoApi[filtro.value]);
    cursos.value = data;
  } catch (e) {
    apiError(e);
  } finally {
    cargando.value = false;
  }
};

onMounted(cargar);
watch(filtro, cargar); // al cambiar el filtro se vuelve a pedir la lista al backend

// Busqueda por codigo o nombre (en el navegador)
const filas = computed(() => {
  const q = buscar.value.trim().toLowerCase();
  if (!q) return cursos.value;
  return cursos.value.filter((c) => c.codigo.toLowerCase().includes(q) || c.nombre.toLowerCase().includes(q));
});

// Presentacion en tarjetas: muestra de 12 en 12
const paleta = ["var(--verde)", "var(--cian)", "var(--amar)", "var(--verde)", "var(--mor)", "var(--azul)"];
const color = (i) => paleta[i % paleta.length];
const maxHoras = computed(() => Math.max(1, ...filas.value.map((c) => Number(c.duracion) || 0)));
const pct = (c) => Math.max(8, Math.round(((Number(c.duracion) || 0) * 100) / maxHoras.value));
const limite = ref(12);
const visibles = computed(() => filas.value.slice(0, limite.value));
const horasLista = computed(() => filas.value.reduce((s, c) => s + (Number(c.duracion) || 0), 0));
const activosLista = computed(() => filas.value.filter((c) => c.status === 0).length);
watch([buscar, filtro], () => (limite.value = 12));

const abrirDialogo = (curso) => {
  editId.value = curso?._id || null;
  form.value = curso
    ? { codigo: curso.codigo, nombre: curso.nombre, duracion: String(curso.duracion) }
    : { codigo: "", nombre: "", duracion: "" };
  dialogo.value = true;
};

const guardar = async () => {
  // Validaciones con SweetAlert2 (sin validaciones HTML)
  const errores = [];
  const codigo = form.value.codigo.trim();
  const nombre = form.value.nombre.trim();
  const duracionTxt = String(form.value.duracion).trim();
  if (!codigo) errores.push("El código es obligatorio");
  if (!nombre) errores.push("El nombre es obligatorio");
  if (!/^\d+$/.test(duracionTxt) || Number(duracionTxt) < 1) errores.push("La duración debe ser un número entero mayor a 0");
  if (errores.length) return showErrors(errores);

  // Solo se envian los 3 campos que el backend espera
  const datos = { codigo, nombre, duracion: Number(duracionTxt) };

  guardando.value = true;
  try {
    const { data } = editId.value
      ? await cursosService.actualizar(editId.value, datos)
      : await cursosService.crear(datos);
    dialogo.value = false;
    toast("success", data.msg);
    cargar();
  } catch (e) {
    apiError(e);
  } finally {
    guardando.value = false;
  }
};

const desactivar = async (curso) => {
  const ok = await confirmar(
    "¿Desactivar curso?",
    `${curso.nombre}\nUn curso inactivo no se podrá asignar a nuevos aprendices.`,
    "Sí, desactivar"
  );
  if (!ok) return;
  try {
    const { data } = await cursosService.desactivar(curso._id);
    toast("success", data.msg);
    cargar();
  } catch (e) {
    apiError(e);
  }
};

const activar = async (curso) => {
  try {
    const { data } = await cursosService.activar(curso._id);
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
      <div class="etiqueta">Catálogo de formación</div>
      <h1 class="display pagina-titulo">Cursos</h1>
      <div class="resumen">
        <div class="pildora"><b>{{ filas.length }}</b> cursos</div>
        <div class="pildora"><b>{{ activosLista }}</b> activos</div>
        <div class="pildora"><b>{{ horasLista.toLocaleString("es-CO") }}</b> horas en total</div>
      </div>
    </div>
    <q-btn color="primary" unelevated no-caps icon="add" class="btn-sena btn-redondo" label="Nuevo curso" @click="abrirDialogo()" />
  </div>

  <div class="barra-herr">
    <q-input v-model="buscar" outlined dense clearable color="primary" class="buscador" placeholder="Buscar por código o nombre">
      <template #prepend><q-icon name="search" /></template>
    </q-input>
    <FiltroEstado v-model="filtro" />
    <q-btn-toggle v-model="vista" class="vista-sel" unelevated no-caps toggle-color="primary" color="hoja" text-color="tinta" toggle-text-color="white" :options="[{ icon: 'grid_view', value: 'portadas' }, { icon: 'view_list', value: 'lista' }]" />
  </div>

  <div v-if="cargando" class="flex flex-center q-pa-xl"><q-spinner-dots color="primary" size="48px" /></div>
  <div v-else-if="!filas.length" class="vacio"><q-icon name="school" size="44px" /><div>No hay cursos para mostrar</div></div>

  <div v-else-if="vista === 'portadas'" class="rejilla">
    <article v-for="(c, i) in visibles" :key="c._id" class="cc" :class="{ off: c.status !== 0 }" :style="{ '--c': color(i), animationDelay: Math.min(i, 12) * 0.04 + 's' }">
      <div class="cc-tapa">
        <div class="cc-fila"><span class="codigo">{{ c.codigo }}</span><EstadoMarca :status="c.status" /></div>
        <div class="cc-medio">
          <div class="anillo" :style="{ '--p': pct(c) }"><b>{{ c.duracion }}</b><small>horas</small></div>
          <div>
            <h3 class="cc-titulo" :title="c.nombre">{{ c.nombre }}</h3>
            <div class="etiqueta">Curso de formación</div>
          </div>
        </div>
        <span class="cc-marca">{{ (c.nombre || "?").charAt(0).toUpperCase() }}</span>
      </div>
      <div class="cc-pie">
        <q-btn flat dense no-caps icon="edit" class="btn-sena btn-suave" label="Editar" @click="abrirDialogo(c)" />
        <q-btn v-if="c.status === 0" flat dense no-caps icon="block" class="btn-sena btn-suave rojo" label="Desactivar" @click="desactivar(c)" />
        <q-btn v-else flat dense no-caps icon="check_circle" class="btn-sena btn-suave" label="Activar" @click="activar(c)" />
      </div>
    </article>
  </div>

  <div v-else class="directorio">
    <div class="dir-cab cur etiqueta"><span>Código</span><span>Curso</span><span>Duración</span><span>Estado</span><span style="text-align: right">Acciones</span></div>
    <div v-for="(c, i) in visibles" :key="c._id" class="dir-fila cur" :class="{ off: c.status !== 0 }" :style="{ animationDelay: Math.min(i, 12) * 0.03 + 's' }">
      <span class="chip-curso">{{ c.codigo }}</span>
      <div class="dir-nom" :title="c.nombre">{{ c.nombre }}</div>
      <div class="horas">{{ c.duracion }} <span class="dir-sub">h</span></div>
      <EstadoMarca :status="c.status" />
      <div class="dir-acc">
        <q-btn flat round dense icon="edit" title="Editar" @click="abrirDialogo(c)" />
        <q-btn v-if="c.status === 0" flat round dense color="negative" icon="block" title="Desactivar" @click="desactivar(c)" />
        <q-btn v-else flat round dense color="primary" icon="check_circle" title="Activar" @click="activar(c)" />
      </div>
    </div>
  </div>

  <div v-if="filas.length > limite" class="flex flex-center q-mt-lg">
    <q-btn outline rounded no-caps color="tinta" class="btn-sena" :label="`Mostrar más (${filas.length - limite})`" @click="limite += 12" />
  </div>

  <!-- Ficha crear / editar -->
  <q-dialog v-model="dialogo" persistent>
    <q-card square class="ficha" style="width: 460px; max-width: 94vw">
      <div class="ficha-cabecera">
        <span class="display">{{ editId ? "Editar curso" : "Nuevo curso" }}</span>
        <q-btn flat round dense icon="close" color="white" v-close-popup />
      </div>

      <q-card-section class="q-pa-lg">
        <CampoForm etiqueta="Código" ayuda="Ejemplo: ADSO-2874521">
          <q-input v-model="form.codigo" outlined square color="tinta" bg-color="hoja" />
        </CampoForm>
        <CampoForm etiqueta="Nombre del curso">
          <q-input v-model="form.nombre" outlined square color="tinta" bg-color="hoja" />
        </CampoForm>
        <CampoForm etiqueta="Duración (horas)">
          <q-input v-model="form.duracion" outlined square color="tinta" bg-color="hoja" inputmode="numeric" @keyup.enter="guardar" />
        </CampoForm>
      </q-card-section>

      <q-card-actions align="right" class="q-px-lg q-pb-lg q-pt-none q-gutter-sm">
        <q-btn flat square no-caps class="btn-sena" label="Cancelar" v-close-popup />
        <q-btn color="primary" text-color="negro" square unelevated no-caps class="btn-sena" label="Guardar" :loading="guardando" @click="guardar" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
