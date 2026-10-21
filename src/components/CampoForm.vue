<script setup>
// Etiqueta arriba + el campo (slot) + texto de ayuda opcional, como una ficha en papel
defineProps({
  etiqueta: { type: String, required: true },
  ayuda: { type: String, default: "" },
});
</script>

<template>
  <div class="campo">
    <label class="campo-etiqueta">{{ etiqueta }}</label>
    <slot />
    <div v-if="ayuda" class="campo-ayuda">{{ ayuda }}</div>
  </div>
</template>
