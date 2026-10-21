<script setup>
import { useTemaStore } from "../stores/tema";

const tema = useTemaStore();
</script>

<template>
  <q-btn
    flat
    dense
    rounded
    no-caps
    class="btn-sena boton-tema"
    :icon="tema.oscuro ? 'light_mode' : 'dark_mode'"
    :label="tema.oscuro ? 'Modo día' : 'Modo noche'"
    :aria-label="tema.oscuro ? 'Cambiar a modo día' : 'Cambiar a modo noche'"
    @click="tema.alternar()"
  />
</template>
