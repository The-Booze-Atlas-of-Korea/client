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
      showIcon fluid iconDisplay="input"
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

<script setup>
import { computed, ref, watch, onBeforeUnmount } from 'vue'
import Select from 'primevue/select';

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  options: {
    type: Array,
    default: [],
  },
  validErrorMessage: {
    type: String,
    default: '',
  },
  isRequired: {
    type: Boolean,
    default: false,
  },
})

// 부모에 값 / 유효성 상태를 알려줄 이벤트
const emit = defineEmits(['update:modelValue', 'validity-change'])

const isValid = ref(true)
const touched = ref(false)

// v-model 래퍼 (양방향 바인딩)
const inputValue = computed({
  get: () => props.modelValue ?? '',
  set: (val) => {
    emit('update:modelValue', val)
  },
})

// 실제 검증 로직
const validate = (value) => {
    if (!props.isRequired) return true
    return v.trim().length > 0
}

// modelValue가 변할 때마다 디바운스 검증
watch(
  () => props.modelValue,
  (val) => {
    validate(val)
  },
)

</script>

<style scoped>
</style>
