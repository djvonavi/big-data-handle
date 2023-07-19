<script setup lang="ts">
import { computed } from "vue";
import type { GroupDataType } from "../../types";
import { GROUP_DATA_TYPES } from "../../consts";
import { useMeteoArchiveStore } from "../../store/meteoArchiveStore";

import VButton from "../UI/VButton.vue";

const meteoStore = useMeteoArchiveStore();

const currentType = computed({
  get() {
    return meteoStore.currentGroupDataType;
  },
  set(valueType: GroupDataType) {
    meteoStore.setCurrentGroupDataType(valueType);
  },
});

const renderTypes = [
  {
    id: GROUP_DATA_TYPES.MONTH,
    title: "Месяц",
  },
  {
    id: GROUP_DATA_TYPES.YEAR,
    title: "Год",
  },
];
</script>

<template>
  <div class="group-type-select">
    <div>Группировать:</div>
    <VButton
      v-for="renderType in renderTypes"
      :key="renderType.id"
      :active="renderType.id === currentType"
      @click="currentType = renderType.id"
      >{{ renderType.title }}</VButton
    >
  </div>
</template>
<style lang="scss" scoped>
.group-type-select {
  @include flex(row, flex-start, center);
  margin-top: 10px;

  div,
  button {
    margin-right: 10px;
  }
}
</style>
