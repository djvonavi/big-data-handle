import { defineStore } from "pinia";
import { ref } from "vue";

import type { MeteoDataType, GroupDataType } from "../types";

import { SEARCH_YEARS, STORE_NAMES, GROUP_DATA_TYPES } from "../consts";

export const useMeteoArchiveStore = defineStore("meteo", () => {
  // реактивное состояние выбираемых годов
  const fromYear = ref<number>(SEARCH_YEARS.FROM);
  const toYear = ref<number>(SEARCH_YEARS.TO);
  function setFromYear(value: number): void {
    fromYear.value = value;
  }
  function setToYear(value: number): void {
    toYear.value = value;
  }

  // реактивное состояние выбираемых типов данных
  const currentMeteoDataType = ref<MeteoDataType>(STORE_NAMES.TEMPERATURE);
  function setCurrentMeteodataType(meteoDataType: MeteoDataType) {
    currentMeteoDataType.value = meteoDataType;
  }

  // реактивное состояние группировки данных для отрисовки
  const currentGroupDataType = ref<GroupDataType>(GROUP_DATA_TYPES.MONTH);
  function setCurrentGroupDataType(groupDataType: GroupDataType) {
    currentGroupDataType.value = groupDataType;
  }

  return {
    fromYear,
    toYear,
    setFromYear,
    setToYear,
    currentMeteoDataType,
    setCurrentMeteodataType,
    currentGroupDataType,
    setCurrentGroupDataType,
  };
});
