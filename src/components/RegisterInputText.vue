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

<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount } from 'vue'
import InputText from 'primevue/inputtext'
import debounce from 'lodash/debounce' // 또는 'lodash.debounce'

// ---- Props 타입 정의 ----
interface RegisterInputTextProps {
  modelValue: string
  label?: string
  placeholder?: string
  regex?: RegExp | string | null
  validErrorMessage?: string
  isRequired?: boolean
  type?: string
  debounceMs?: number
}

// 기본값 포함한 props
const props = withDefaults(defineProps<RegisterInputTextProps>(), {
  modelValue: '',
  label: '',
  placeholder: '',
  regex: null,
  validErrorMessage: '',
  isRequired: false,
  type: 'text',
  debounceMs: 250,
})

// ---- Emits 타입 정의 ----
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'validity-change', value: boolean): void
}>()

const isValid = ref<boolean>(true)
const touched = ref<boolean>(false)

// v-model 래퍼 (양방향 바인딩)
const inputValue = computed<string>({
  get: () => props.modelValue ?? '',
  set: (val: string) => {
    emit('update:modelValue', val)
  },
})

// 실제 검증 로직
const validate = (value: string): boolean => {
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
const debouncedValidate = debounce((value: string) => {
  const nextValid = validate(value)
  isValid.value = nextValid
  emit('validity-change', nextValid)
}, props.debounceMs)

// modelValue가 변할 때마다 디바운스 검증
watch(
  () => props.modelValue,
  (val: string) => {
    debouncedValidate(val)
  },
  { immediate: true },
)

// 컴포넌트 unmount 시 디바운스 타이머 정리
onBeforeUnmount(() => {
  debouncedValidate.cancel()
})
</script>

<style scoped>
</style>
