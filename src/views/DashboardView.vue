<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { cursosService } from "../services/cursos.service";
import { aprendicesService } from "../services/aprendices.service";
import { useAuthStore } from "../stores/auth";
import { apiError } from "../utils/alert";
import EstadoMarca from "../components/EstadoMarca.vue";

const auth = useAuthStore();
const cursos = ref([]);
const aprendices = ref([]);
const cargando = ref(true);

// Se piden TODOS los cursos y aprendices y las cifras se calculan aqui.
// (El backend no tiene endpoint de estadisticas, por eso no se inventa uno.)
onMounted(async () => {
  try {
    const [c, a] = await Promise.all([cursosService.listar(), aprendicesService.listar()]);
    cursos.value = c.data;
    aprendices.value = a.data;
  } catch (e) {
    apiError(e);
  } finally {
    cargando.value = false;
  }
});

const resumen = (lista) => {
  const total = lista.length;
  const activos = lista.filter((x) => x.status === 0).length;
  return { total, activos, inactivos: total - activos, pct: total ? Math.round((activos * 100) / total) : 0 };
};
const rCursos = computed(() => resumen(cursos.value));
const rAprendices = computed(() => resumen(aprendices.value));

// Relacion aprendiz - curso: aprendices ACTIVOS de cada curso.
// aprendiz.curso llega como objeto gracias al populate del backend.
const porCurso = computed(() => {
  const filas = cursos.value.map((c) => ({
    id: c._id,
    codigo: c.codigo,
    nombre: c.nombre,
    status: c.status,
    total: aprendices.value.filter((a) => a.status === 0 && a.curso?._id === c._id).length,
  }));
  const sinCurso = aprendices.value.filter((a) => a.status === 0 && !a.curso).length;
  if (sinCurso) filas.push({ id: "sin", codigo: "—", nombre: "Sin curso asignado", status: 0, total: sinCurso });
  return filas.sort((x, y) => y.total - x.total);
});
// Numero que sube animado hasta su valor (contador)
const contar = (getter) => {
  const v = ref(0);
  watch(getter, (n) => {
    const t0 = performance.now();
    const paso = (t) => {
      const p = Math.min(1, (t - t0) / 1000);
      v.value = Math.round(n * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
  }, { immediate: true });
  return v;
};
const horas = computed(() => cursos.value.filter((c) => c.status === 0).reduce((s, c) => s + (Number(c.duracion) || 0), 0));
const promedio = computed(() => (rCursos.value.activos ? (rAprendices.value.activos / rCursos.value.activos).toFixed(1) : "0"));
const nCursos = contar(() => rCursos.value.activos);
const nAprendices = contar(() => rAprendices.value.activos);
const nHoras = contar(() => horas.value);
const fmt = (n) => n.toLocaleString("es-CO");

const saludo = (() => { const h = new Date().getHours(); return h < 12 ? "Buenos días" : h < 19 ? "Buenas tardes" : "Buenas noches"; })();
const fechaTxt = new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const paleta = ["var(--verde)", "var(--cian)", "var(--amar)", "var(--verde)", "var(--mor)", "var(--azul)"];
const color = (i) => paleta[i % paleta.length];

// Ultimos aprendices registrados (por fecha si existe, si no por orden de llegada)
const ultimos = computed(() => {
  const l = [...aprendices.value];
  return (l[0]?.createdAt ? l.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : l.reverse()).slice(0, 6);
});
const hace = (f) => {
  if (!f) return "";
  const d = Math.floor((Date.now() - new Date(f)) / 86400000);
  return d < 1 ? "hoy" : `hace ${d} día${d === 1 ? "" : "s"}`;
};
const maximo = computed(() => Math.max(1, ...porCurso.value.map((f) => f.total)));
</script>

<template>
  <section class="hero-g">
    <div style="position: relative; z-index: 1">
      <div class="etiqueta">{{ fechaTxt }}</div>
      <h1 class="display">{{ saludo }}, <em>{{ auth.usuario?.nombre }}.</em></h1>
    </div>
    <div class="acciones">
      <q-btn unelevated no-caps icon="add" class="btn-sena btn-blanco" label="Curso" to="/cursos" />
      <q-btn flat no-caps icon="add" class="btn-sena btn-fantasma" label="Aprendiz" to="/aprendices" />
    </div>
  </section>

  <div v-if="cargando" class="flex flex-center q-pa-xl"><q-spinner-dots color="primary" size="48px" /></div>

  <template v-else>
    <div class="metricas">
      <div class="metrica">
        <q-icon name="school" class="ico" size="22px" />
        <div class="etiqueta">Cursos activos</div>
        <div class="cifra">{{ nCursos }}</div>
        <div class="mini"><span :style="{ width: rCursos.pct + '%' }"></span></div>
        <small>{{ rCursos.inactivos }} inactivos de {{ rCursos.total }}</small>
      </div>
      <div class="metrica">
        <q-icon name="groups" class="ico" size="22px" />
        <div class="etiqueta">Aprendices activos</div>
        <div class="cifra">{{ nAprendices }}</div>
        <div class="mini"><span :style="{ width: rAprendices.pct + '%' }"></span></div>
        <small>{{ rAprendices.inactivos }} inactivos de {{ rAprendices.total }}</small>
      </div>
      <div class="metrica">
        <q-icon name="schedule" class="ico" size="22px" />
        <div class="etiqueta">Horas de formación</div>
        <div class="cifra">{{ fmt(nHoras) }}</div>
        <small>Suma de cursos activos</small>
      </div>
      <div class="metrica">
        <q-icon name="balance" class="ico" size="22px" />
        <div class="etiqueta">Promedio por curso</div>
        <div class="cifra">{{ promedio }}</div>
        <small>Aprendices por curso</small>
      </div>
    </div>

    <div class="tablero">
      <section class="panel">
        <div class="panel-cab"><h2>Aprendices por curso</h2><span class="etiqueta">Solo activos</span></div>
        <div v-for="(f, i) in porCurso" :key="f.id" class="fila" :style="{ '--c': color(i), animationDelay: i * 0.05 + 's' }">
          <span class="rango">{{ i + 1 }}</span>
          <div class="col" style="min-width: 0">
            <div class="fila-tit"><span class="nom" :title="f.nombre">{{ f.nombre }}</span><span class="num">{{ f.total }}</span></div>
            <div class="barra"><span :style="{ width: (f.total * 100) / maximo + '%' }"></span></div>
            <div class="cod">{{ f.codigo }}</div>
          </div>
        </div>
        <div v-if="!porCurso.length" class="texto-suave q-pa-lg">Aún no hay cursos registrados</div>
      </section>

      <div class="col-der">
        <section class="panel">
          <div class="panel-cab"><h2>Estado de aprendices</h2></div>
          <div class="donut-caja">
            <div class="donut" :style="{ background: `conic-gradient(var(--verde) 0 ${rAprendices.pct}%, var(--rojo) 0)` }"><b>{{ rAprendices.pct }}%</b></div>
            <div class="leyenda">
              <div><i style="background: var(--verde)"></i>{{ rAprendices.activos }} activos</div>
              <div><i style="background: var(--rojo)"></i>{{ rAprendices.inactivos }} inactivos</div>
            </div>
          </div>
        </section>

        <section class="panel">
          <div class="panel-cab"><h2>Últimos registros</h2><router-link to="/aprendices" class="etiqueta">Ver todos →</router-link></div>
          <div v-for="(a, i) in ultimos" :key="a._id" class="fila" :style="{ '--c': color(i + 2), animationDelay: i * 0.05 + 's' }">
            <div class="avatar" :style="{ '--c': color(i + 2) }">{{ a.nombre.charAt(0).toUpperCase() }}</div>
            <div class="col" style="min-width: 0">
              <div class="reg-nom">{{ a.nombre }}</div>
              <div class="reg-cod">{{ a.curso?.codigo || "Sin curso" }}</div>
            </div>
            <span class="etiqueta">{{ hace(a.createdAt) }}</span>
          </div>
          <div v-if="!ultimos.length" class="texto-suave q-pa-md">Aún no hay aprendices registrados</div>
        </section>
      </div>
    </div>
  </template>
</template>
