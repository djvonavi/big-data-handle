<script setup lang="ts">
import { computed } from 'vue'

import { useMeteoArchiveStore } from '../../store/meteoArchiveStore'

import { SEARCH_YEARS } from "../../consts";

import VSelect from "../UI/VSelect.vue";



const meteoStore = useMeteoArchiveStore()

const fromYear = computed({
  get() {
    return meteoStore.fromYear
  },
  set(value: number) {
    meteoStore.setFromYear(value)
  }
})

const toYear = computed({
  get() {
    return meteoStore.toYear
  },
  set(value: number) {
    meteoStore.setToYear(value)
  }
})


const yearsSelectList: number[] = [];
for (let i = SEARCH_YEARS.FROM; i <= SEARCH_YEARS.TO; i++) {
  yearsSelectList.push(i);
}

</script>

<template>
  <div>
    <VSelect :options="yearsSelectList" v-model="fromYear"  />
    <VSelect :options="yearsSelectList" v-model="toYear"  />
  </div>
</template>
