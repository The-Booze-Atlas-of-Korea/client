<template>
  <MainPageLayout>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50">
    <!-- 헤더 -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <h1 class="text-2xl font-bold text-gray-900">스케줄 생성</h1>
      </div>
    </header>

    <!-- 메인 컨텐츠 -->
    <main class="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 로딩 상태 (플랜 정보 로드 중) -->
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
            label="플랜 상세로 돌아가기"
            icon="pi pi-arrow-left"
            severity="secondary"
            class="mt-4"
            @click="goToPlanDetail"
          />
        </div>
      </div>

      <!-- 폼 -->
      <div v-else class="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
        <!-- 플랜 정보 표시 -->
        <div class="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p class="text-sm text-blue-800">
            <i class="pi pi-info-circle mr-2"></i>
            플랜: <span class="font-semibold">{{ plan?.title || '제목 없음' }}</span>
          </p>
        </div>

        <form @submit.prevent="handleSubmit">
          <!-- 제목 (필수) -->
          <div class="mb-6">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              제목 <span class="text-red-500">*</span>
            </label>
            <InputText
              v-model="formData.title"
              placeholder="스케줄 제목을 입력하세요"
              class="w-full"
              :class="{ 'border-red-500': titleError }"
            />
            <p v-if="titleError" class="text-xs text-red-500 mt-1">{{ titleError }}</p>
          </div>

          <!-- 시작 날짜/시간 (필수) -->
          <div class="mb-6">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              시작 날짜/시간 <span class="text-red-500">*</span>
            </label>
            <Calendar
              v-model="formData.startAt"
              showTime
              hourFormat="24"
              dateFormat="yy-mm-dd"
              placeholder="시작 날짜와 시간을 선택하세요"
              class="w-full"
              :class="{ 'border-red-500': startAtError }"
            />
            <p v-if="startAtError" class="text-xs text-red-500 mt-1">{{ startAtError }}</p>
          </div>

          <!-- 종료 날짜/시간 (필수) -->
          <div class="mb-6">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              종료 날짜/시간 <span class="text-red-500">*</span>
            </label>
            <Calendar
              v-model="formData.endAt"
              showTime
              hourFormat="24"
              dateFormat="yy-mm-dd"
              placeholder="종료 날짜와 시간을 선택하세요"
              class="w-full"
              :class="{ 'border-red-500': endAtError }"
            />
            <p v-if="endAtError" class="text-xs text-red-500 mt-1">{{ endAtError }}</p>
          </div>

          <!-- 타입 -->
          <div class="mb-6">
            <label class="block text-sm font-semibold text-gray-700 mb-2">타입</label>
            <Dropdown
              v-model="formData.type"
              :options="typeOptions"
              placeholder="스케줄 타입을 선택하세요 (선택사항)"
              class="w-full"
            />
          </div>

          <!-- 에러 메시지 -->
          <div v-if="submitError" class="mb-6">
            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
              <p class="text-sm text-red-700">{{ submitError }}</p>
            </div>
          </div>

          <!-- 버튼 그룹 -->
          <div class="flex gap-3">
            <Button
              label="스케줄 생성"
              icon="pi pi-check"
              severity="contrast"
              class="flex-1"
              type="submit"
              :loading="submitting"
              :disabled="submitting"
            />
            <Button
              label="취소"
              icon="pi pi-times"
              severity="secondary"
              outlined
              class="flex-1"
              @click="goToPlanDetail"
              type="button"
              :disabled="submitting"
            />
          </div>
        </form>
      </div>
    </main>
  </div>
  </MainPageLayout>
</template>

<script setup lang="ts">
// TODO: 라우터 등록 후 /plans/:planId/schedule/create 경로 확인
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Calendar from 'primevue/calendar'
import Dropdown from 'primevue/dropdown'
import { PlanApi } from '@/api/plan/planApi'
import { ScheduleApi } from '@/api/plan/scheduleApi'
import type { Plan, CreateScheduleRequest } from '@/api/plan/types'
import MainPageLayout from '@/layout/MainPageLayout.vue'

const router = useRouter()
const route = useRoute()
const toast = useToast()

// planId 추출
const planId = Number(route.params.planId)

// 상태 관리
const loading = ref<boolean>(false)
const submitting = ref<boolean>(false)
const loadError = ref<string>('')
const submitError = ref<string>('')
const titleError = ref<string>('')
const startAtError = ref<string>('')
const endAtError = ref<string>('')

const plan = ref<Plan | null>(null)

// 폼 데이터
interface FormData {
  title: string
  startAt: Date | null
  endAt: Date | null
  type: string
}

const formData = ref<FormData>({
  title: '',
  startAt: null,
  endAt: null,
  type: '',
})

// 타입 옵션
const typeOptions = ['여행', '회의', '이벤트', '약속', '기타']

// 플랜 정보 로드
const loadPlanDetail = async () => {
  if (!planId) {
    loadError.value = '유효하지 않은 플랜 ID입니다.'
    return
  }

  loading.value = true
  loadError.value = ''

  const res = await PlanApi.getPlanDetail(planId)

  if (res.ok) {
    plan.value = res.data
    // 플랜 제목을 스케줄 제목 기본값으로 설정
    formData.value.title = plan.value.title || ''
  } else {
    loadError.value = res.error.message || '플랜 정보를 불러오는데 실패했습니다.'
  }

  loading.value = false
}

// 유효성 검증
const validateForm = (): boolean => {
  titleError.value = ''
  startAtError.value = ''
  endAtError.value = ''
  submitError.value = ''

  if (!formData.value.title.trim()) {
    titleError.value = '제목은 필수 항목입니다.'
    return false
  }

  if (!formData.value.startAt) {
    startAtError.value = '시작 날짜/시간은 필수 항목입니다.'
    return false
  }

  if (!formData.value.endAt) {
    endAtError.value = '종료 날짜/시간은 필수 항목입니다.'
    return false
  }

  // 시작일이 종료일보다 앞서야 함
  if (formData.value.startAt >= formData.value.endAt) {
    submitError.value = '시작 날짜/시간은 종료 날짜/시간보다 앞서야 합니다.'
    return false
  }

  return true
}

// 폼 제출
const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  submitting.value = true

  try {
    const payload: CreateScheduleRequest = {
      planId: planId,
      title: formData.value.title,
      startAt: formData.value.startAt!.toISOString(),
      endAt: formData.value.endAt!.toISOString(),
      type: formData.value.type || undefined,
    }

    const res = await ScheduleApi.createSchedule(payload)

    if (res.ok) {
      // 성공 Toast 표시
      toast.add({
        severity: 'success',
        summary: '스케줄 생성 완료',
        detail: '스케줄이 성공적으로 생성되었습니다.',
        life: 3000,
      })

      // 플랜 상세 페이지로 이동
      setTimeout(() => {
        router.push(`/plans/${planId}`)
      }, 500)
    } else {
      submitError.value = res.error.message || '스케줄 생성에 실패했습니다.'
    }
  } finally {
    submitting.value = false
  }
}

// 플랜 상세로 이동
const goToPlanDetail = () => {
  router.push(`/plans/${planId}`)
}

// 컴포넌트 마운트
onMounted(() => {
  loadPlanDetail()
})
</script>

<style scoped>
/* 추가 스타일이 필요한 경우 여기에 작성 */
</style>
