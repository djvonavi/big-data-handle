<script setup lang="ts">
const emits = defineEmits(["click"]);

const handleClick = (event: MouseEvent) => {
  emits("click", event);
};

const props = defineProps({
  active: Boolean,
});
</script>

<template>
  <button class="v-button" :class="{ '-active': active }" @click="handleClick">
    <slot></slot>
  </button>
</template>

<style scoped lang="scss">
.v-button {
  @include flex(row, flex-start, center);
  background-color: grey;
  color: white;
  cursor: pointer;
  font-weight: 500;
  height: 2.25rem;
  width: 100%;
  outline: none;
  border: none;

  &.-active {
    background-color: #393939;
  }
}
</style>
