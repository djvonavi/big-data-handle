<script setup lang="ts">
import { computed } from 'vue'

import type { MeteoDataType } from "../../types";

import { useMeteoArchiveStore } from '../../store/meteoArchiveStore'
import { STORE_NAMES } from "../../consts";

import VButton from "../UI/VButton.vue";

interface StoreType {
  id: MeteoDataType;
  title: string;
}

const storeTypes: StoreType[] = [
  {
    id: STORE_NAMES.TEMPERATURE,
    title: "Температура",
  },
  {
    id: STORE_NAMES.PRECIPITATION,
    title: "Осадки",
  },
];

const meteoStore = useMeteoArchiveStore()
const currentMeteoDataType = computed({
  get() {
    return meteoStore.currentMeteoDataType
  },
  set(meteoDataType: MeteoDataType) {
    meteoStore.setCurrentMeteodataType(meteoDataType)
  }
})

</script>

<template>
  <div class="meteo-body__leftside">
    <VButton 
        v-for="storeType in storeTypes" 
        :key="storeType.id"
        :active="storeType.id === currentMeteoDataType"
        @click="currentMeteoDataType = storeType.id"
    >{{
        storeType.title
    }}</VButton>
    </div>
</template>
