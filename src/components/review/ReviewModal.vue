<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Textarea from 'primevue/textarea'
import InputText from 'primevue/inputtext'
import StarRating from './StarRating.vue'
import { ReviewController } from '@/api/ReviewController'
import type { ReviewDetailDto } from '@/api/responses/ReviewDetailDto'
import type { CreateReviewRequestDto } from '@/api/requests/CreateReviewRequestDto'
import type { UpdateReviewRequestDto } from '@/api/requests/UpdateReviewRequestDto'

/**
 * 리뷰 작성/수정 모달
 * mode에 따라 작성 또는 수정 모드로 동작
 */
interface Props {
  /** 모달 표시 여부 */
  visible: boolean
  /** 모드: create(작성) 또는 update(수정) */
  mode: 'create' | 'update'
  /** 바 ID (작성 모드에서 필요) */
  barId?: number
  /** 기존 리뷰 데이터 (수정 모드에서 필요) */
  review?: ReviewDetailDto
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'submitted'): void
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'create',
})

const emit = defineEmits<Emits>()

const toast = useToast()

const submitting = ref(false)
const rating = ref(5)
const content = ref('')
const mediaUrls = ref<string>('')

/** 모달이 열릴 때 초기화 */
watch(
  () => props.visible,
  (isVisible) => {
    if (isVisible) {
      if (props.mode === 'update' && props.review) {
        // 수정 모드: 기존 데이터 로드
        rating.value = props.review.rating
        content.value = props.review.content
        mediaUrls.value = props.review.mediaUrls?.join('\n') || ''
      } else {
        // 작성 모드: 초기화
        rating.value = 5
        content.value = ''
        mediaUrls.value = ''
      }
    }
  },
)

/** 유효성 검사 */
const isValid = computed(() => {
  return rating.value >= 1 && rating.value <= 5 && content.value.trim().length > 0
})

/** 모달 제목 */
const modalTitle = computed(() => {
  return props.mode === 'create' ? '리뷰 작성' : '리뷰 수정'
})

/** 리뷰 제출 */
const handleSubmit = async () => {
  if (!isValid.value) {
    toast.add({
      severity: 'warn',
      summary: '입력 확인',
      detail: '별점과 리뷰 내용을 입력해 주세요.',
      life: 2500,
    })
    return
  }

  submitting.value = true

  try {
    const mediaUrlArray = mediaUrls.value
      .split('\n')
      .map((url) => url.trim())
      .filter((url) => url.length > 0)

    if (props.mode === 'create') {
      // 작성 모드
      if (!props.barId) {
        toast.add({
          severity: 'error',
          summary: '오류',
          detail: '바 ID가 필요합니다.',
          life: 3000,
        })
        return
      }

      const payload: CreateReviewRequestDto = {
        rating: rating.value,
        content: content.value.trim(),
        mediaUrls: mediaUrlArray.length > 0 ? mediaUrlArray : undefined,
      }

      const res = await ReviewController.createReview(props.barId, payload)

      if (res.ok) {
        toast.add({
          severity: 'success',
          summary: '리뷰 작성 완료',
          life: 2000,
        })
        emit('update:visible', false)
        emit('submitted')
      } else {
        toast.add({
          severity: 'error',
          summary: '리뷰 작성 실패',
          detail: res.error.message,
          life: 3000,
        })
      }
    } else {
      // 수정 모드
      if (!props.review) {
        toast.add({
          severity: 'error',
          summary: '오류',
          detail: '리뷰 데이터가 필요합니다.',
          life: 3000,
        })
        return
      }

      const payload: UpdateReviewRequestDto = {
        rating: rating.value,
        content: content.value.trim(),
        mediaUrls: mediaUrlArray.length > 0 ? mediaUrlArray : undefined,
      }

      const res = await ReviewController.updateReview(props.review.id, payload)

      if (res.ok) {
        toast.add({
          severity: 'success',
          summary: '리뷰 수정 완료',
          life: 2000,
        })
        emit('update:visible', false)
        emit('submitted')
      } else {
        toast.add({
          severity: 'error',
          summary: '리뷰 수정 실패',
          detail: res.error.message,
          life: 3000,
        })
      }
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
    :header="modalTitle"
    :modal="true"
    :style="{ width: '90vw', maxWidth: '600px' }"
    @update:visible="emit('update:visible', $event)"
  >
    <div class="space-y-4">
      <!-- 별점 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          별점 <span class="text-red-500">*</span>
        </label>
        <StarRating v-model="rating" />
      </div>

      <!-- 리뷰 내용 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          리뷰 내용 <span class="text-red-500">*</span>
        </label>
        <Textarea
          v-model="content"
          rows="6"
          placeholder="방문 경험을 공유해 주세요..."
          class="w-full"
        />
      </div>

      <!-- 미디어 URL (MVP: URL 텍스트 입력) -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          이미지 URL (선택, 한 줄에 하나씩)
        </label>
        <Textarea
          v-model="mediaUrls"
          rows="3"
          placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
          class="w-full"
        />
        <div class="text-xs text-gray-500 mt-1">
          ℹ️ MVP 버전에서는 이미지 URL을 직접 입력해 주세요. (한 줄에 하나씩)
        </div>
      </div>
    </div>

    <template #footer>
      <Button label="취소" severity="secondary" outlined @click="handleClose" />
      <Button
        :label="mode === 'create' ? '작성' : '수정'"
        :loading="submitting"
        :disabled="!isValid"
        @click="handleSubmit"
      />
    </template>
  </Dialog>
</template>
