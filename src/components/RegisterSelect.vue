<template>
  <div class="mb-3 w-full ml-1">
    <!-- 라벨 + 필수 표시 -->
    <label
      v-if="label"
      class="block text-left text-sm font-medium text-gray-700 mb-1"
    >
      <span>{{ label }}</span>
      <span v-if="isRequired" class="text-red-500 ml-1">*</span>
    </label>

    <!-- 입력 필드 -->
    <Select 
      v-model="inputValue"
      :placeholder="placeholder"
      :options="options"
      class="w-full"
      @blur="touched = true"
      showIcon
      fluid
      iconDisplay="input"
    />

    <!-- 에러 메시지 -->
    <p
      v-if="touched && !isValid && validErrorMessage"
      class="block text-left text-xs font-medium text-red-500 mt-1"
    >
      {{ validErrorMessage }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Select from 'primevue/select'

interface RegisterSelectProps {
  modelValue: string
  label?: string
  placeholder?: string
  options?: string[]
  validErrorMessage?: string
  isRequired?: boolean
}

const props = withDefaults(defineProps<RegisterSelectProps>(), {
  modelValue: '',
  label: '',
  placeholder: '',
  options: () => [],
  validErrorMessage: '',
  isRequired: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'validity-change', value: boolean): void
}>()

const isValid = ref<boolean>(true)
const touched = ref<boolean>(false)

// v-model 래퍼
const inputValue = computed<string>({
  get: () => props.modelValue ?? '',
  set: (val: string) => {
    emit('update:modelValue', val)
  },
})

// 실제 검증 로직
const validate = (value: string): boolean => {
  const v = (value ?? '').trim()

  if (!props.isRequired) return true
  return v.length > 0
}

// modelValue가 변할 때마다 검증 + validity-change emit
watch(
  () => props.modelValue,
  (val) => {
    const nextValid = validate(val ?? '')
    isValid.value = nextValid
    emit('validity-change', nextValid)
  },
  { immediate: true },
)
</script>

<style scoped>
</style>
