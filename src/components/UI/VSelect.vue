<script setup lang="ts" generic="T extends string | number">
defineProps<{
  options: T[]
  modelValue: T
}>();

const emit = defineEmits(['update:modelValue'])

function selectedHandler(e: Event) {
  const value = (e.target as HTMLInputElement).value as T
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="v-select">
    <span>{{ modelValue }}</span>
    <select :value="modelValue" @change="selectedHandler">
      <option v-for="(option, i) in options" :key="i" :value="option">
        {{ option }}
      </option>
    </select>
    <div class="v-select__right"></div>
  </div>
</template>

<style scoped lang="scss">
.v-select {
  @include flex(row, flex-start, center);
  border: 1px solid grey;
  color: grey;
  font-weight: 500;
  height: 100%;
  width: 100%;
  outline: none;
  position: relative;
  padding-left: 5px;

  &:not(:last-child) {
    border-right: none;
  }
  > select {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    min-height: 100%;
    min-width: 100%;
    opacity: 0;
    z-index: 1;
  }

  &__right {
    position: absolute;
    right: 0;
    top: 0;
    height: 100%;
    width: 2rem;
    border-left: 1px solid grey;

    &::after {
      content: "▼";
      width: 100%;
      height: 100%;
      @include flex(row, center, center);
    }
  }
}
</style>
