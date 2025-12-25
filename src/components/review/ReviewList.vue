<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import Dropdown from 'primevue/dropdown'
import ScrollPanel from 'primevue/scrollpanel'
import Skeleton from 'primevue/skeleton'
import ReviewCard from './ReviewCard.vue'
import { ReviewController } from '@/api/ReviewController'
import type { ReviewListItemDto } from '@/api/responses/ReviewListItemDto'

/**
 * 리뷰 목록 컴포넌트
 * 무한 스크롤 지원
 */
interface Props {
  /** 바 ID */
  barId: number
  /** 현재 로그인 사용자 ID (권한 체크용) */
  currentUserId?: number
}

interface Emits {
  (e: 'refreshSummary'): void
  (e: 'editReview', reviewId: number): void
  (e: 'reportReview', reviewId: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const toast = useToast()

const loading = ref(false)
const reviews = ref<ReviewListItemDto[]>([])
const currentPage = ref(0)
const pageSize = 10
const hasNext = ref(true)

const sortOptions = [
  { label: '최신순', value: 'LATEST' },
]
const selectedSort = ref('LATEST')

/** 리뷰 목록 로드 */
const loadReviews = async (reset = false) => {
  if (loading.value) return
  if (!reset && !hasNext.value) return

  loading.value = true

  if (reset) {
    currentPage.value = 0
    reviews.value = []
    hasNext.value = true
  }

  const res = await ReviewController.listReviews(props.barId, {
    sort: selectedSort.value,
    page: currentPage.value,
    size: pageSize,
  })

  if (res.ok) {
    const newReviews = res.data
    if (reset) {
      reviews.value = newReviews
    } else {
      reviews.value.push(...newReviews)
    }

    // 다음 페이지 존재 여부 판단
    hasNext.value = newReviews.length === pageSize
    currentPage.value++
  } else {
    toast.add({
      severity: 'error',
      summary: '리뷰 목록 조회 실패',
      detail: res.error.message,
      life: 3000,
    })
  }

  loading.value = false
}

/** 무한 스크롤 IntersectionObserver */
const scrollSentinel = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const setupInfiniteScroll = () => {
  if (!scrollSentinel.value) return

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && hasNext.value && !loading.value) {
        loadReviews()
      }
    },
    { threshold: 0.1 },
  )

  observer.observe(scrollSentinel.value)
}

onMounted(() => {
  loadReviews(true)
  setupInfiniteScroll()
})

// barId가 변경되면 리셋 후 다시 로드
watch(() => props.barId, () => loadReviews(true))

// 정렬 변경 시 리셋
watch(selectedSort, () => loadReviews(true))

/** 외부에서 갱신 가능하도록 expose */
const refresh = () => {
  loadReviews(true)
  emit('refreshSummary')
}

defineExpose({ refresh })

/** 리뷰 삭제 핸들러 */
const handleDeleteReview = async (reviewId: number) => {
  const res = await ReviewController.deleteReview(reviewId)

  if (res.ok) {
    toast.add({
      severity: 'success',
      summary: '리뷰 삭제 완료',
      life: 2000,
    })
    refresh()
  } else {
    toast.add({
      severity: 'error',
      summary: '리뷰 삭제 실패',
      detail: res.error.message,
      life: 3000,
    })
  }
}
</script>

<template>
  <div class="review-list">
    <!-- 정렬 옵션 -->
    <div class="flex items-center justify-between mb-3 px-2">
      <span class="text-sm font-semibold text-gray-700">리뷰 {{ reviews.length }}개</span>
      <Dropdown
        v-model="selectedSort"
        :options="sortOptions"
        option-label="label"
        option-value="value"
        class="w-32"
      />
    </div>

    <!-- 리뷰 목록 -->
    <ScrollPanel style="height: 400px" class="px-2">
      <div class="space-y-3">
        <ReviewCard
          v-for="review in reviews"
          :key="review.id"
          :review="review"
          :current-user-id="currentUserId"
          @edit="emit('editReview', $event)"
          @delete="handleDeleteReview"
          @report="emit('reportReview', $event)"
        />

        <!-- 로딩 스켈레톤 -->
        <div v-if="loading" class="space-y-3">
          <Skeleton height="120px" />
          <Skeleton height="120px" />
        </div>

        <!-- 빈 상태 -->
        <div
          v-if="!loading && reviews.length === 0"
          class="text-center py-10 text-gray-500"
        >
          <i class="pi pi-inbox text-4xl mb-3"></i>
          <div class="text-sm">아직 리뷰가 없습니다.</div>
        </div>

        <!-- 무한 스크롤 센티널 -->
        <div ref="scrollSentinel" class="h-4"></div>
      </div>
    </ScrollPanel>
  </div>
</template>

<style scoped>
.review-list {
  padding: 1rem 0;
}
</style>
