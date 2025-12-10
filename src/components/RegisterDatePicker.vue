<template>
  <div class="mb-3 w-full mr-1">
    <!-- 라벨 + 필수 표시 -->
    <label
      v-if="label"
      class="block text-left text-sm font-medium text-gray-700 mb-1"
    >
      <span>{{ label }}</span>
      <span v-if="isRequired" class="text-red-500 ml-1">*</span>
    </label>

    <!-- 입력 필드 -->
    <DatePicker 
      v-model="inputValue"
      :placeholder="placeholder"
      class="w-full"
      :maxDate="maxDate"
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
import DatePicker from 'primevue/datepicker'

type DateModel = Date | null

interface RegisterDatePickerProps {
  modelValue: DateModel
  label?: string
  placeholder?: string
  validErrorMessage?: string
  isRequired?: boolean
  maxDate?: Date
}

const props = withDefaults(defineProps<RegisterDatePickerProps>(), {
  modelValue: null,
  label: '',
  placeholder: '',
  validErrorMessage: '',
  isRequired: false,
  maxDate: () => new Date(),
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: DateModel): void
  (e: 'validity-change', value: boolean): void
}>()

const isValid = ref<boolean>(true)
const touched = ref<boolean>(false)

// v-model 래퍼 (양방향 바인딩)
const inputValue = computed<DateModel>({
  get: () => props.modelValue,
  set: (val: DateModel) => {
    emit('update:modelValue', val)
  },
})

// 실제 검증 로직
const validate = (value: DateModel): boolean => {
  if (!props.isRequired) return true
  return value != null;
}

// modelValue가 변할 때마다 검증 + validity-change emit
watch(
  () => props.modelValue,
  (val) => {
    const nextValid = validate(val)
    isValid.value = nextValid
    emit('validity-change', nextValid)
  },
  { immediate: true },
)
</script>

<style scoped>
</style>
