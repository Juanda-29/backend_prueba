<script setup>
// Filtro Todos / Activos / Inactivos. Se usa con v-model:  <FiltroEstado v-model="filtro" />
defineProps({ modelValue: { type: String, required: true } });
defineEmits(["update:modelValue"]);

const opciones = [
  { label: "Todos", value: "todos" },
  { label: "Activos", value: "activos" },
  { label: "Inactivos", value: "inactivos" },
];
</script>

<template>
  <q-btn-toggle
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :options="opciones"
    no-caps
    unelevated
    toggle-color="primary"
    color="hoja"
    text-color="tinta"
    toggle-text-color="white"
    class="btn-sena"
  />
</template>
