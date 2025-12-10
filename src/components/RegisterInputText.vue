<template>
  <div class="mb-3 w-full">
    <!-- 라벨 + 필수 표시 -->
    <label
      v-if="label"
      class="block text-left text-sm font-medium text-gray-700 mb-1"
    >
      <span>{{ label }}</span>
      <span v-if="isRequired" class="text-red-500 ml-1">*</span>
    </label>

    <!-- 입력 필드 -->
    <div class="w-full">
      <InputText
      class="w-full"
      v-model="inputValue"
      :type="type"
      :placeholder="placeholder"
      :invalid="touched && !isValid"
      @blur="touched = true"
      />
    </div>

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
import InputText from 'primevue/inputtext'
import debounce from 'lodash/debounce' // 필요에 따라 'lodash-es/debounce' 로 변경 가능

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
  // 정규식: RegExp 또는 문자열 (예: "^[a-z0-9]{4,20}$")
  regex: {
    type: [RegExp, String],
    default: null,
  },
  validErrorMessage: {
    type: String,
    default: '',
  },
  isRequired: {
    type: Boolean,
    default: false,
  },
  // input type (text, email, password 등)
  type: {
    type: String,
    default: 'text',
  },
  // 디바운스 시간(ms)
  debounceMs: {
    type: Number,
    default: 250,
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
  const v = value ?? ''

  // regex 없으면: 필수 여부만 검사
  if (!props.regex) {
    if (!props.isRequired) return true
    return v.trim().length > 0
  }

  const pattern =
    props.regex instanceof RegExp ? props.regex : new RegExp(props.regex)

  // 필수가 아니고 값이 비어 있으면 통과
  if (!props.isRequired && !v) return true

  return pattern.test(v)
}

// 디바운스된 검증 함수
const debouncedValidate = debounce((value) => {
  const nextValid = validate(value)
  isValid.value = nextValid
  emit('validity-change', nextValid)
}, props.debounceMs)

// modelValue가 변할 때마다 디바운스 검증
watch(
  () => props.modelValue,
  (val) => {
    debouncedValidate(val)
  },
)

// 컴포넌트 unmount 시 디바운스 타이머 정리
onBeforeUnmount(() => {
  if (debouncedValidate.cancel) {
    debouncedValidate.cancel()
  }
})
</script>

<style scoped>
</style>
