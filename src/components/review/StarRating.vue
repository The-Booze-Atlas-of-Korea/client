<script setup lang="ts">
import { computed } from 'vue'
import Rating from 'primevue/rating'

/**
 * 별점 컴포넌트
 * PrimeVue Rating 기반, 1~5 정수 별점만 지원
 */
interface Props {
  /** 별점 값 (1~5) */
  modelValue: number
  /** 읽기 전용 모드 */
  readonly?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: number): void
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
})

const emit = defineEmits<Emits>()

const internalValue = computed({
  get: () => props.modelValue,
  set: (value: number) => emit('update:modelValue', value),
})
</script>

<template>
  <Rating
    v-model="internalValue"
    :readonly="readonly"
    :cancel="false"
    :stars="5"
  />
</template>
