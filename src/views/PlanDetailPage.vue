<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50">
    <!-- 헤더 -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-900">플랜 상세</h1>
        <Button
          label="목록으로"
          icon="pi pi-list"
          severity="secondary"
          outlined
          @click="goToList"
        />
      </div>
    </header>

    <!-- 메인 컨텐츠 -->
    <main class="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 로딩 상태 -->
      <div v-if="loading" class="text-center py-16">
        <p class="text-lg text-gray-600">플랜 정보를 불러오는 중...</p>
      </div>

      <!-- 에러 상태 -->
      <div v-else-if="loadError" class="text-center py-16">
        <div class="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <i class="pi pi-exclamation-triangle text-red-500 text-4xl mb-4"></i>
          <h2 class="text-xl font-semibold text-red-800 mb-2">오류가 발생했습니다</h2>
          <p class="text-red-700">{{ loadError }}</p>
          <Button
            label="목록으로 돌아가기"
            icon="pi pi-arrow-left"
            severity="secondary"
            class="mt-4"
            @click="goToList"
          />
        </div>
      </div>

      <!-- 플랜 상세 정보 -->
      <div v-else-if="plan" class="space-y-6">
        <!-- 메타 정보 카드 -->
        <div class="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
          <!-- 테마 배지 -->
          <div v-if="plan.theme" class="mb-4">
            <span
              class="inline-block px-4 py-2 text-sm font-semibold rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
            >
              {{ plan.theme }}
            </span>
          </div>

          <!-- 제목 -->
          <h2 class="text-4xl font-bold text-gray-900 mb-4">
            {{ plan.title || '제목 없음' }}
          </h2>

          <!-- 설명 -->
          <p class="text-gray-700 text-lg mb-6 whitespace-pre-wrap">
            {{ plan.description || '설명이 없습니다.' }}
          </p>

          <!-- 메타 정보 그리드 -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pt-6 border-t border-gray-200">
            <!-- 예산 -->
            <div class="flex items-center">
              <i class="pi pi-wallet text-green-600 text-2xl mr-3"></i>
              <div>
                <p class="text-xs text-gray-500">총 예산</p>
                <p class="text-lg font-semibold text-gray-900">
                  {{ plan.totalBudget ? formatBudget(plan.totalBudget) + '원' : '미정' }}
                </p>
              </div>
            </div>

            <!-- 장소 수 -->
            <div class="flex items-center">
              <i class="pi pi-map-marker text-blue-600 text-2xl mr-3"></i>
              <div>
                <p class="text-xs text-gray-500">장소 수</p>
                <p class="text-lg font-semibold text-gray-900">{{ plan.spots?.length || 0 }}개</p>
              </div>
            </div>

            <!-- 생성일 -->
            <div class="flex items-center">
              <i class="pi pi-calendar text-purple-600 text-2xl mr-3"></i>
              <div>
                <p class="text-xs text-gray-500">생성일</p>
                <p class="text-lg font-semibold text-gray-900">
                  {{ plan.createdAt ? formatDate(plan.createdAt) : '-' }}
                </p>
              </div>
            </div>
          </div>

          <!-- 액션 버튼 -->
          <div class="flex gap-3">
            <Button
              label="수정하기"
              icon="pi pi-pencil"
              severity="contrast"
              class="flex-1"
              @click="goToEdit"
            />
            <Button
              label="삭제하기"
              icon="pi pi-trash"
              severity="danger"
              outlined
              class="flex-1"
              :loading="deleting"
              @click="handleDelete"
            />
          </div>
        </div>

        <!-- 코스 목록 카드 -->
        <div class="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
          <h3 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <i class="pi pi-map text-blue-600 mr-3"></i>
            코스 목록
          </h3>

          <!-- 장소가 없을 경우 -->
          <div v-if="!plan.spots || plan.spots.length === 0" class="text-center py-8">
            <i class="pi pi-inbox text-gray-400 text-5xl mb-3"></i>
            <p class="text-gray-600">등록된 장소가 없습니다.</p>
          </div>

          <!-- 장소 목록 -->
          <div v-else class="space-y-4">
            <div
              v-for="(spot, index) in sortedSpots"
              :key="index"
              class="border border-gray-200 rounded-xl p-5 bg-gradient-to-r from-gray-50 to-white hover:shadow-md transition-shadow"
            >
              <!-- 장소 번호 -->
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center">
                  <span
                    class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold text-lg mr-3"
                  >
                    {{ index + 1 }}
                  </span>
                  <h4 class="text-xl font-bold text-gray-900">{{ spot.placeNameSnapshot }}</h4>
                </div>
              </div>

              <!-- 주소 -->
              <div v-if="spot.placeAddressSnapshot" class="flex items-start mb-2 ml-13">
                <i class="pi pi-map-marker text-gray-500 text-sm mr-2 mt-1"></i>
                <p class="text-gray-700">{{ spot.placeAddressSnapshot }}</p>
              </div>

              <!-- 메모 -->
              <div v-if="spot.memo" class="flex items-start ml-13">
                <i class="pi pi-comment text-gray-500 text-sm mr-2 mt-1"></i>
                <p class="text-gray-600 italic">{{ spot.memo }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 삭제 확인 다이얼로그 -->
    <ConfirmDialog></ConfirmDialog>
  </div>
</template>

<script setup lang="ts">
// TODO: 라우터 등록 후 /plans/:planId 경로 확인
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Button from 'primevue/button'
import ConfirmDialog from 'primevue/confirmdialog'
import { useConfirm } from 'primevue/useconfirm'
import { PlanApi } from '@/api/plan/planApi'
import type { Plan } from '@/api/plan/types'

const router = useRouter()
const route = useRoute()
const confirm = useConfirm()

// planId 추출
const planId = computed(() => {
  const id = route.params.planId
  return id ? Number(id) : null
})

// 상태 관리
const loading = ref<boolean>(false)
const deleting = ref<boolean>(false)
const loadError = ref<string>('')
const plan = ref<Plan | null>(null)

// spots 정렬 (sequence 기준)
const sortedSpots = computed(() => {
  if (!plan.value?.spots) return []
  return [...plan.value.spots].sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
})

// 플랜 데이터 로드
const loadPlanDetail = async () => {
  if (!planId.value) {
    loadError.value = '유효하지 않은 플랜 ID입니다.'
    return
  }

  loading.value = true
  loadError.value = ''

  const res = await PlanApi.getPlanDetail(planId.value)

  if (res.ok) {
    plan.value = res.data
  } else {
    loadError.value = res.error.message || '플랜 정보를 불러오는데 실패했습니다.'
  }

  loading.value = false
}

// 예산 포맷팅
const formatBudget = (budget: number): string => {
  return budget.toLocaleString('ko-KR')
}

// 날짜 포맷팅
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// 목록으로 이동
const goToList = () => {
  router.push('/plans')
}

// 수정 페이지로 이동
const goToEdit = () => {
  if (planId.value) {
    router.push(`/plans/${planId.value}/edit`)
  }
}

// 삭제 처리
const handleDelete = () => {
  confirm.require({
    message: '정말로 이 플랜을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
    header: '플랜 삭제 확인',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: '삭제',
    rejectLabel: '취소',
    acceptClass: 'p-button-danger',
    accept: async () => {
      await deletePlan()
    },
  })
}

// 삭제 API 호출
const deletePlan = async () => {
  if (!planId.value) return

  deleting.value = true

  const res = await PlanApi.deletePlan(planId.value)

  if (res.ok) {
    // 성공 시 목록으로 이동
    router.push('/plans')
  } else {
    // 실패 시 에러 메시지 표시
    confirm.require({
      message: res.error.message || '플랜 삭제에 실패했습니다.',
      header: '삭제 실패',
      icon: 'pi pi-times-circle',
      acceptLabel: '확인',
      rejectClass: 'hidden',
    })
  }

  deleting.value = false
}

// 컴포넌트 마운트
onMounted(() => {
  loadPlanDetail()
})
</script>

<style scoped>
.ml-13 {
  margin-left: 3.25rem; /* w-10 + mr-3 = 2.5rem + 0.75rem */
}
</style>
