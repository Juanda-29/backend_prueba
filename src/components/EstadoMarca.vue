<script setup>
// Estado de un registro: etiqueta verde = Activo (status 0), roja = Inactivo (status 1)
defineProps({ status: { type: Number, required: true } });
</script>

<template>
  <span class="estado" :class="status === 0 ? 'estado-on' : 'estado-off'"><i></i>{{ status === 0 ? "Activo" : "Inactivo" }}</span>
</template>
