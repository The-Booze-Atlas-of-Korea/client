<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import Textarea from 'primevue/textarea'
import { ReviewController } from '@/api/ReviewController'

/**
 * 리뷰 신고 모달
 * 신고 사유 선택 및 기타 입력
 */
interface Props {
  /** 모달 표시 여부 */
  visible: boolean
  /** 신고할 리뷰 ID */
  reviewId: number
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'reported'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const toast = useToast()

const submitting = ref(false)
const selectedReason = ref('')
const customReason = ref('')

/** 신고 사유 옵션 */
const reasonOptions = [
  { label: '스팸/광고', value: 'SPAM' },
  { label: '욕설/비방', value: 'ABUSIVE' },
  { label: '허위 정보', value: 'FALSE_INFO' },
  { label: '개인정보 노출', value: 'PRIVACY_VIOLATION' },
  { label: '기타', value: 'OTHER' },
]

/** 모달이 열릴 때 초기화 */
watch(
  () => props.visible,
  (isVisible) => {
    if (isVisible) {
      selectedReason.value = ''
      customReason.value = ''
    }
  },
)

/** 유효성 검사 */
const isValid = computed(() => {
  if (!selectedReason.value) return false
  if (selectedReason.value === 'OTHER') {
    return customReason.value.trim().length > 0
  }
  return true
})

/** 신고 제출 */
const handleSubmit = async () => {
  if (!isValid.value) {
    toast.add({
      severity: 'warn',
      summary: '입력 확인',
      detail: '신고 사유를 선택하고 입력해 주세요.',
      life: 2500,
    })
    return
  }

  submitting.value = true

  try {
    const reason =
      selectedReason.value === 'OTHER'
        ? customReason.value.trim()
        : reasonOptions.find((opt) => opt.value === selectedReason.value)?.label ||
          selectedReason.value

    const res = await ReviewController.reportReview(props.reviewId, { reason })

    if (res.ok) {
      toast.add({
        severity: 'success',
        summary: '신고 완료',
        detail: '신고가 접수되었습니다.',
        life: 2000,
      })
      emit('update:visible', false)
      emit('reported')
    } else {
      // 중복 신고 등의 에러 처리
      toast.add({
        severity: 'error',
        summary: '신고 실패',
        detail: res.error.message,
        life: 3000,
      })
    }
  } finally {
    submitting.value = false
  }
}

/** 모달 닫기 */
const handleClose = () => {
  emit('update:visible', false)
}
</script>

<template>
  <Dialog
    :visible="visible"
    header="리뷰 신고"
    :modal="true"
    :style="{ width: '90vw', maxWidth: '500px' }"
    @update:visible="emit('update:visible', $event)"
  >
    <div class="space-y-4">
      <div class="text-sm text-gray-600">
        부적절한 리뷰를 신고해 주세요. 신고 내용은 관리자가 검토합니다.
      </div>

      <!-- 신고 사유 선택 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          신고 사유 <span class="text-red-500">*</span>
        </label>
        <Dropdown
          v-model="selectedReason"
          :options="reasonOptions"
          option-label="label"
          option-value="value"
          placeholder="사유를 선택하세요"
          class="w-full"
        />
      </div>

      <!-- 기타 사유 입력 -->
      <div v-if="selectedReason === 'OTHER'">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          상세 사유 <span class="text-red-500">*</span>
        </label>
        <Textarea
          v-model="customReason"
          rows="4"
          placeholder="신고 사유를 상세히 입력해 주세요..."
          class="w-full"
        />
      </div>
    </div>

    <template #footer>
      <Button label="취소" severity="secondary" outlined @click="handleClose" />
      <Button
        label="신고"
        severity="warning"
        :loading="submitting"
        :disabled="!isValid"
        @click="handleSubmit"
      />
    </template>
  </Dialog>
</template>
