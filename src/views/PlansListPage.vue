<template>
  <MainPageLayout>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50">
    <!-- 헤더 -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-900">플랜 목록</h1>
        <Button
          label="플랜 만들기"
          icon="pi pi-plus"
          severity="contrast"
          @click="navigateToCreatePlan"
        />
      </div>
    </header>

    <!-- 메인 컨텐츠 -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 로딩 상태 -->
      <div v-if="loading" class="text-center py-16">
        <p class="text-lg text-gray-600">로딩 중...</p>
      </div>

      <!-- 에러 상태 -->
      <div v-else-if="errorMessage" class="text-center py-16">
        <div class="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <i class="pi pi-exclamation-triangle text-red-500 text-4xl mb-4"></i>
          <h2 class="text-xl font-semibold text-red-800 mb-2">오류가 발생했습니다</h2>
          <p class="text-red-700">{{ errorMessage }}</p>
        </div>
      </div>

      <!-- 빈 상태 -->
      <div v-else-if="plans.length === 0" class="text-center py-16">
        <div class="bg-white rounded-3xl shadow-lg p-12 max-w-md mx-auto border border-gray-100">
          <i class="pi pi-inbox text-gray-400 text-6xl mb-6"></i>
          <h2 class="text-2xl font-bold text-gray-900 mb-3">플랜이 없습니다</h2>
          <p class="text-gray-600 mb-6">첫 번째 플랜을 만들어보세요!</p>
          <Button
            label="플랜 만들기"
            icon="pi pi-plus"
            severity="contrast"
            size="large"
            @click="navigateToCreatePlan"
          />
        </div>
      </div>

      <!-- 성공 상태: 플랜 목록 -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="plan in plans"
          :key="plan.planId"
          class="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer transform hover:-translate-y-1"
          @click="navigateToPlanDetail(plan.planId!)"
        >
          <div class="p-6">
            <!-- 테마 배지 -->
            <div v-if="plan.theme" class="mb-3">
              <span
                class="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
              >
                {{ plan.theme }}
              </span>
            </div>

            <!-- 제목 -->
            <h3 class="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
              {{ plan.title || '제목 없음' }}
            </h3>

            <!-- 설명 -->
            <p class="text-gray-600 text-sm mb-4 line-clamp-3">
              {{ plan.description || '설명이 없습니다.' }}
            </p>

            <!-- 하단 정보 -->
            <div class="flex items-center justify-between pt-4 border-t border-gray-100">
              <!-- 예산 -->
              <div v-if="plan.totalBudget" class="flex items-center text-sm text-gray-700">
                <i class="pi pi-wallet mr-2 text-green-600"></i>
                <span class="font-semibold">{{ formatBudget(plan.totalBudget) }}원</span>
              </div>
              <div v-else class="flex items-center text-sm text-gray-400">
                <i class="pi pi-wallet mr-2"></i>
                <span>예산 미정</span>
              </div>

              <!-- 장소 수 -->
              <div class="flex items-center text-sm text-gray-700">
                <i class="pi pi-map-marker mr-2 text-blue-600"></i>
                <span>{{ plan.spots?.length || 0 }}개 장소</span>
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
// TODO: #27 머지 후 /plans 라우트 등록 및 동작 확인
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import { PlanApi } from '@/api/plan/planApi'
import type { Plan } from '@/api/plan/types'
import MainPageLayout from '@/layout/MainPageLayout.vue'

const router = useRouter()

// 상태 관리
const loading = ref<boolean>(true)
const errorMessage = ref<string>('')
const plans = ref<Plan[]>([])

// 응답 정규화 헬퍼 - Plan[] 또는 {content: Plan[]} 모두 처리
const normalizePlans = (data: Plan[] | { content?: Plan[] } | null | undefined): Plan[] => {
  if (Array.isArray(data)) return data
  if (data?.content && Array.isArray(data.content)) return data.content
  return []
}

// 데이터 로드
const loadPlans = async () => {
  loading.value = true
  errorMessage.value = ''

  const res = await PlanApi.listPlans()

  if (res.ok) {
    plans.value = normalizePlans(res.data)
  } else {
    errorMessage.value = res.error.message || '플랜 목록을 불러오는데 실패했습니다.'
  }

  loading.value = false
}

// 네비게이션
const navigateToPlanDetail = (planId: number) => {
  router.push(`/plans/${planId}`)
}

const navigateToCreatePlan = () => {
  router.push('/plans/new')
}

// 예산 포맷팅
const formatBudget = (budget: number): string => {
  return budget.toLocaleString('ko-KR')
}

// 컴포넌트 마운트 시 데이터 로드
onMounted(() => {
  loadPlans()
})
</script>

<style scoped>
/* line-clamp 유틸리티 (Tailwind CSS 3.x+에서 기본 제공) */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
