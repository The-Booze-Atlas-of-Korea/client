<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import Skeleton from 'primevue/skeleton'
import Button from 'primevue/button'
import ProgressBar from 'primevue/progressbar'
import StarRating from './StarRating.vue'
import { ReviewController } from '@/api/ReviewController'
import type { ReviewSummaryDto } from '@/api/responses/ReviewSummaryDto'

/**
 * 리뷰 요약 통계 컴포넌트
 * 평균 별점, 총 리뷰 수, 별점 분포를 표시
 */
interface Props {
  /** 바 ID */
  barId: number
}

const props = defineProps<Props>()

const toast = useToast()

const loading = ref(false)
const error = ref(false)
const summary = ref<ReviewSummaryDto | null>(null)

/** 리뷰 요약 데이터 로드 */
const loadSummary = async () => {
  loading.value = true
  error.value = false

  const res = await ReviewController.getReviewSummary(props.barId)

  if (res.ok) {
    summary.value = res.data
  } else {
    error.value = true
    toast.add({
      severity: 'error',
      summary: '리뷰 요약 조회 실패',
      detail: res.error.message,
      life: 3000,
    })
  }

  loading.value = false
}

/** 외부에서 갱신 가능하도록 expose */
const refresh = () => {
  loadSummary()
}

defineExpose({ refresh })

// barId가 변경되면 다시 로드
watch(() => props.barId, loadSummary, { immediate: true })

onMounted(() => {
  loadSummary()
})

/** 별점별 비율 계산 (0~100) */
const getRatingPercentage = (rating: number): number => {
  if (!summary.value || summary.value.totalCount === 0) return 0
  const count = summary.value.ratingDistribution[rating] || 0
  return (count / summary.value.totalCount) * 100
}
</script>

<template>
  <div class="review-summary">
    <!-- 로딩 상태 -->
    <div v-if="loading" class="space-y-3">
      <Skeleton height="3rem" />
      <Skeleton height="2rem" class="mb-2" />
      <Skeleton height="1.5rem" />
      <Skeleton height="1.5rem" />
      <Skeleton height="1.5rem" />
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="error" class="text-center py-6">
      <i class="pi pi-exclamation-triangle text-4xl text-red-500 mb-3"></i>
      <div class="text-sm text-gray-600 mb-3">리뷰 요약을 불러오지 못했습니다.</div>
      <Button
        label="다시 시도"
        icon="pi pi-refresh"
        size="small"
        severity="secondary"
        @click="loadSummary"
      />
    </div>

    <!-- 정상 데이터 표시 -->
    <div v-else-if="summary" class="space-y-4">
      <!-- 평균 별점 및 총 개수 -->
      <div class="flex items-center gap-4">
        <div class="text-center">
          <div class="text-4xl font-bold text-gray-800">
            {{ summary.averageRating.toFixed(1) }}
          </div>
          <StarRating :model-value="Math.round(summary.averageRating)" readonly />
          <div class="text-xs text-gray-500 mt-1">{{ summary.totalCount }}개 리뷰</div>
        </div>

        <!-- 별점 분포 -->
        <div class="flex-1 space-y-1">
          <div
            v-for="rating in [5, 4, 3, 2, 1]"
            :key="rating"
            class="flex items-center gap-2 text-sm"
          >
            <span class="w-8 text-right text-gray-600">{{ rating }}점</span>
            <ProgressBar
              :value="getRatingPercentage(rating)"
              :show-value="false"
              class="flex-1"
              style="height: 8px"
            />
            <span class="w-8 text-left text-gray-500">
              {{ summary.ratingDistribution[rating] || 0 }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 데이터 없음 -->
    <div v-else class="text-center py-6 text-gray-500">
      <i class="pi pi-inbox text-4xl mb-3"></i>
      <div class="text-sm">아직 리뷰가 없습니다.</div>
    </div>
  </div>
</template>

<style scoped>
.review-summary {
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}
</style>
