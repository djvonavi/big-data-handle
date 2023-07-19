<script setup lang="ts">
import MeteoComponent from './components/Meteo/Meteo.vue'

</script>

<template>
  <div class="app">
    <MeteoComponent />
  </div>
</template>

<style scoped lang="scss">
    .app {
        width: 100%;
        height: 100vh;
        @include flex(row, center, center);
    }
</style>
