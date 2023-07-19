<script setup lang="ts">
import Graph from "./Graph.vue";
import GroupTypeSelect from "./GroupTypeSelect.vue"
import TypesButtons from "./TypesButtons.vue";
import YearsSelects from "./YearsSelects.vue";

</script>

<template>
  <div class="meteo">
    <h3>Архив метеослужбы</h3>
    <div class="meteo-body">
      <TypesButtons />
      <div class="meteo-body__rightside">
        <YearsSelects class="rightside-selects" />
        <Graph />
        <GroupTypeSelect />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.meteo {
  width: 100%;
  height: 100vh;

  &-body {
    @include flex(row, flex-start, flex-start);

    &__leftside {
      width: 10%;

      > button {
        margin-bottom: 5px;
      }
    }

    &__rightside {
      width: 80%;
      margin-left: 10px;
      @include flex(column, flex-start, flex-start);

      .rightside-selects {
        width: 100%;
        height: 2rem;
        margin-bottom: 5px;

        @include flex(row, flex-start, flex-start);
      }
    }
  }
}
</style>
