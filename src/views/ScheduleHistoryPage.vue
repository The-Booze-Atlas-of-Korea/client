<template>
  <MainPageLayout>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50">
    <!-- 헤더 -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <h1 class="text-2xl font-bold text-gray-900">일정/이력</h1>
      </div>
    </header>

    <!-- 메인 컨텐츠 -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 로딩 상태 -->
      <div v-if="loading" class="text-center py-16">
        <p class="text-lg text-gray-600">이력을 불러오는 중...</p>
      </div>

      <!-- 에러 상태 -->
      <div v-else-if="loadError" class="text-center py-16">
        <div class="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <i class="pi pi-exclamation-triangle text-red-500 text-4xl mb-4"></i>
          <h2 class="text-xl font-semibold text-red-800 mb-2">오류가 발생했습니다</h2>
          <p class="text-red-700">{{ loadError }}</p>
        </div>
      </div>

      <!-- 빈 상태 -->
      <div v-else-if="schedules.length === 0" class="text-center py-16">
        <div class="bg-white rounded-3xl shadow-lg p-12 max-w-md mx-auto border border-gray-100">
          <i class="pi pi-inbox text-gray-400 text-6xl mb-6"></i>
          <h2 class="text-2xl font-bold text-gray-900 mb-3">등록된 이력이 없습니다</h2>
          <p class="text-gray-600 mb-6">아직 생성된 스케줄이 없습니다.</p>
        </div>
      </div>

      <!-- 성공 상태: 스케줄 이력 목록 -->
      <div v-else class="grid grid-cols-1 gap-4">
        <div
          v-for="schedule in schedules"
          :key="schedule.scheduleId"
          class="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer transform hover:-translate-y-1"
          :class="{ 'opacity-50 cursor-not-allowed': !schedule.planId }"
          @click="navigateToPlanDetail(schedule.planId)"
        >
          <div class="p-6">
            <div class="flex items-start justify-between">
              <!-- 왼쪽: 제목 및 시간 정보 -->
              <div class="flex-1">
                <!-- 제목 -->
                <h3 class="text-xl font-bold text-gray-900 mb-3">
                  {{ schedule.title || '제목 없음' }}
                </h3>

                <!-- 시간 정보 -->
                <div class="space-y-2">
                  <!-- 시작 시간 -->
                  <div class="flex items-center text-sm text-gray-700">
                    <i class="pi pi-calendar text-blue-600 mr-2"></i>
                    <span class="font-medium mr-2">시작:</span>
                    <span>{{ formatDateTime(schedule.startAt) }}</span>
                  </div>

                  <!-- 종료 시간 -->
                  <div class="flex items-center text-sm text-gray-700">
                    <i class="pi pi-calendar text-green-600 mr-2"></i>
                    <span class="font-medium mr-2">종료:</span>
                    <span>{{ formatDateTime(schedule.endAt) }}</span>
                  </div>
                </div>
              </div>

              <!-- 오른쪽: 플랜 ID 및 아이콘 -->
              <div class="flex flex-col items-end ml-4">
                <div v-if="schedule.planId" class="text-sm text-gray-500 mb-2">
                  <span class="font-medium">플랜 #{{ schedule.planId }}</span>
                </div>
                <i
                  v-if="schedule.planId"
                  class="pi pi-arrow-right text-blue-600 text-xl"
                ></i>
                <span v-else class="text-xs text-gray-400">플랜 정보 없음</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
  </MainPageLayout>
</template>

<script setup lang="ts">
// TODO: 라우터 등록 후 /history 경로 확인
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ScheduleApi } from '@/api/plan/scheduleApi'
import type { Schedule } from '@/api/plan/types'
import MainPageLayout from '@/layout/MainPageLayout.vue'

const router = useRouter()

// 상태 관리
const loading = ref<boolean>(false)
const loadError = ref<string>('')
const schedules = ref<ScheduleHistoryItem[]>([])

// 스케줄 이력 로드
const loadScheduleHistory = async () => {
  loading.value = true
  loadError.value = ''

  const res = await ScheduleApi.getScheduleHistory({
    page: 0,
    size: 20,
  })

  if (res.ok) {
    // content가 배열이면 사용, 아니면 빈 배열
    const content = res.data.content || []

    // 최신순 정렬 (startAt 기준 내림차순)
    schedules.value = [...content].sort((a, b) => {
      const dateA = a.startAt ? new Date(a.startAt).getTime() : 0
      const dateB = b.startAt ? new Date(b.startAt).getTime() : 0
      return dateB - dateA // 내림차순 (최신순)
    })
  } else {
    loadError.value = res.error.message || '이력을 불러오는데 실패했습니다.'
  }

  loading.value = false
}

// 날짜/시간 포맷팅
const formatDateTime = (dateString: string | undefined): string => {
  if (!dateString) return '-'

  const date = new Date(dateString)
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 플랜 상세로 이동
const navigateToPlanDetail = (planId: number | undefined) => {
  if (!planId) {
    // planId가 없으면 이동하지 않음
    return
  }
  router.push(`/plans/${planId}`)
}

// 컴포넌트 마운트
onMounted(() => {
  loadScheduleHistory()
})
</script>

<style scoped>
/* 추가 스타일이 필요한 경우 여기에 작성 */
</style>
