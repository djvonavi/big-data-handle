<script setup lang="ts">
import { computed, ref, watch, watchPostEffect, nextTick } from "vue";
import type { ItemData } from "../../types";
import { STORE_NAMES, GROUP_DATA_TYPES } from "../../consts";

import { getDataByYears } from "../../services/useDataStore";
import { useMeteoArchiveStore } from "../../store/meteoArchiveStore";
import { useLoadingStatus } from "../../composes/useLoadingStatus";

import {
  drawTemperatureGraph,
  drawPrecipitationGraph,
} from "../../services/drawGraphs";
import { groupDataByMonth, groupDataByYear } from "../../services/groupData";

const meteoStore = useMeteoArchiveStore();
const currentMeteoDataType = computed(() => meteoStore.currentMeteoDataType);

const dataToDraw = ref<ItemData[]>([]);

const grouppedDataToDraw = computed(() => {
  if (meteoStore.currentGroupDataType === GROUP_DATA_TYPES.YEAR) {
    return groupDataByYear(dataToDraw.value);
  } else if (meteoStore.currentGroupDataType === GROUP_DATA_TYPES.MONTH) {
    return groupDataByMonth(dataToDraw.value);
  }
  return dataToDraw.value;
});

const { loadingStatus, startLoading, stopLoading } = useLoadingStatus();

const showCanvasState = ref(true);

watchPostEffect(async () => {
  startLoading("Загрузка данных");
  const drawData = await getDataByYears<ItemData>(
    meteoStore.currentMeteoDataType,
    meteoStore.fromYear,
    meteoStore.toYear
  );
  dataToDraw.value = drawData;
});

let timerStatus = 0;

watch(grouppedDataToDraw, async (data) => {
  clearTimeout(timerStatus);
  /**
   * showCanvasState.value = false
   * await nextTick()
   * showCanvasState.value = true
   * await nextTick()
   * это необходимо чтобы создавать каждый раз новый Canvas, чтобы отмененная задача не рисовала в нашем канвасе если уже не нужно это
   */
  showCanvasState.value = false;
  await nextTick();
  showCanvasState.value = true;
  await nextTick();
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  startLoading("Рисуем");
  if (currentMeteoDataType.value === STORE_NAMES.TEMPERATURE) {
    await drawTemperatureGraph(canvas, data);
  } else {
    await drawPrecipitationGraph(canvas, data);
  }
  timerStatus = setTimeout(() => {
    stopLoading();
  }, 150);
});
</script>

<template>
  <div class="graph">
    <div v-if="loadingStatus" class="graph-loading">
      {{ loadingStatus }}
    </div>
    <canvas
      v-if="showCanvasState"
      id="canvas"
      width="1280"
      height="600"
    ></canvas>
  </div>
</template>

<style scoped lang="scss">
.graph {
  width: 100%;
  height: auto;
  border: 1px solid grey;
  position: relative;
  overflow: scroll;

  &-loading {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    @include flex(row, center, center);
    z-index: 1;
    background: white;
  }
}
</style>
