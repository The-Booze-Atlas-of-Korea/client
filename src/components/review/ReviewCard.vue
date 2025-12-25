<script setup lang="ts">
import { computed } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import Button from 'primevue/button'
import Card from 'primevue/card'
import StarRating from './StarRating.vue'
import type { ReviewListItemDto } from '@/api/responses/ReviewListItemDto'

/**
 * 개별 리뷰 카드 컴포넌트
 * 리뷰 표시 및 수정/삭제/신고 액션 제공
 */
interface Props {
  /** 리뷰 데이터 */
  review: ReviewListItemDto
  /** 현재 로그인 사용자 ID (권한 체크용) */
  currentUserId?: number
}

interface Emits {
  (e: 'edit', reviewId: number): void
  (e: 'delete', reviewId: number): void
  (e: 'report', reviewId: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const toast = useToast()
const confirm = useConfirm()

/** 본인 리뷰 여부 */
const isMine = computed(() => {
  return props.currentUserId !== undefined && props.review.userId === props.currentUserId
})

/** 작성일 포맷 */
const formattedDate = computed(() => {
  const date = new Date(props.review.createdAt)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

/** 수정 버튼 클릭 */
const handleEdit = () => {
  emit('edit', props.review.id)
}

/** 삭제 버튼 클릭 (확인 다이얼로그 포함) */
const handleDelete = () => {
  confirm.require({
    message: '이 리뷰를 삭제하시겠습니까?',
    header: '리뷰 삭제',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: '취소',
    acceptLabel: '삭제',
    accept: () => {
      emit('delete', props.review.id)
    },
  })
}

/** 신고 버튼 클릭 */
const handleReport = () => {
  emit('report', props.review.id)
}
</script>

<template>
  <Card class="review-card">
    <template #content>
      <div class="space-y-3">
        <!-- 작성자 및 별점 -->
        <div class="flex items-start justify-between">
          <div>
            <div class="flex items-center gap-2">
              <StarRating :model-value="review.rating" readonly />
              <span class="text-sm text-gray-500">{{ formattedDate }}</span>
            </div>
            <div class="text-xs text-gray-400 mt-1">사용자 {{ review.userId }}</div>
          </div>

          <!-- 액션 버튼 -->
          <div v-if="currentUserId" class="flex gap-1">
            <template v-if="isMine">
              <Button
                icon="pi pi-pencil"
                size="small"
                severity="secondary"
                text
                rounded
                @click="handleEdit"
              />
              <Button
                icon="pi pi-trash"
                size="small"
                severity="danger"
                text
                rounded
                @click="handleDelete"
              />
            </template>
            <template v-else>
              <Button
                icon="pi pi-flag"
                size="small"
                severity="warning"
                text
                rounded
                @click="handleReport"
              />
            </template>
          </div>
        </div>

        <!-- 리뷰 내용 -->
        <div class="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {{ review.content }}
        </div>

        <!-- 미디어 첨부 (썸네일) -->
        <div v-if="review.mediaUrls && review.mediaUrls.length > 0" class="flex gap-2 flex-wrap">
          <img
            v-for="(url, index) in review.mediaUrls"
            :key="index"
            :src="url"
            :alt="`리뷰 이미지 ${index + 1}`"
            class="w-20 h-20 object-cover rounded border border-gray-200"
          />
        </div>
      </div>
    </template>
  </Card>
</template>

<style scoped>
.review-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.review-card :deep(.p-card-content) {
  padding: 1rem;
}
</style>
