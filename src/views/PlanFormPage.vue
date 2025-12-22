<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50">
    <!-- 헤더 -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <h1 class="text-2xl font-bold text-gray-900">
          {{ isEditMode ? '플랜 수정' : '플랜 만들기' }}
        </h1>
      </div>
    </header>

    <!-- 메인 컨텐츠 -->
    <main class="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 로딩 상태 (수정 모드에서 데이터 로드 중) -->
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

      <!-- 폼 -->
      <div v-else class="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
        <form @submit.prevent="handleSubmit">
          <!-- 제목 (필수) -->
          <div class="mb-6">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              제목 <span class="text-red-500">*</span>
            </label>
            <InputText
              v-model="formData.title"
              placeholder="플랜 제목을 입력하세요"
              class="w-full"
              :class="{ 'border-red-500': titleError }"
            />
            <p v-if="titleError" class="text-xs text-red-500 mt-1">{{ titleError }}</p>
          </div>

          <!-- 설명 -->
          <div class="mb-6">
            <label class="block text-sm font-semibold text-gray-700 mb-2">설명</label>
            <Textarea
              v-model="formData.description"
              placeholder="플랜에 대한 설명을 입력하세요"
              rows="4"
              class="w-full"
            />
          </div>

          <!-- 테마 -->
          <div class="mb-6">
            <label class="block text-sm font-semibold text-gray-700 mb-2">테마</label>
            <InputText
              v-model="formData.theme"
              placeholder="예: 와인 투어, 전통주 탐방, 칵테일 바 등"
              class="w-full"
            />
          </div>

          <!-- 총 예산 -->
          <div class="mb-6">
            <label class="block text-sm font-semibold text-gray-700 mb-2">총 예산 (원)</label>
            <InputNumber
              v-model="formData.totalBudget"
              placeholder="예산을 입력하세요"
              :min="0"
              :useGrouping="true"
              class="w-full"
              locale="ko-KR"
            />
          </div>

          <!-- 장소 목록 -->
          <div class="mb-6">
            <label class="block text-sm font-semibold text-gray-700 mb-2">장소 목록</label>
            <p class="text-xs text-gray-500 mb-3">
              방문할 장소를 추가해보세요. 순서는 자동으로 정렬됩니다.
            </p>

            <!-- 장소 리스트 -->
            <div v-if="formData.spots.length > 0" class="space-y-3 mb-3">
              <div
                v-for="(spot, index) in formData.spots"
                :key="index"
                class="border border-gray-200 rounded-lg p-4 bg-gray-50"
              >
                <div class="flex items-start justify-between mb-2">
                  <span class="text-sm font-semibold text-gray-700">장소 {{ index + 1 }}</span>
                  <Button
                    icon="pi pi-trash"
                    severity="danger"
                    text
                    size="small"
                    @click="removeSpot(index)"
                  />
                </div>

                <div class="mb-2">
                  <label class="block text-xs font-medium text-gray-600 mb-1">
                    장소명 <span class="text-red-500">*</span>
                  </label>
                  <InputText
                    v-model="spot.placeNameSnapshot"
                    placeholder="장소 이름"
                    class="w-full"
                    size="small"
                  />
                </div>

                <div class="mb-2">
                  <label class="block text-xs font-medium text-gray-600 mb-1">주소</label>
                  <InputText
                    v-model="spot.placeAddressSnapshot"
                    placeholder="주소 (선택)"
                    class="w-full"
                    size="small"
                  />
                </div>

                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">메모</label>
                  <Textarea
                    v-model="spot.memo"
                    placeholder="메모 (선택)"
                    rows="2"
                    class="w-full"
                  />
                </div>
              </div>
            </div>

            <!-- 장소 추가 버튼 -->
            <Button
              label="장소 추가"
              icon="pi pi-plus"
              severity="secondary"
              outlined
              class="w-full"
              @click="addSpot"
              type="button"
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
              :label="isEditMode ? '수정하기' : '만들기'"
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
              @click="handleCancel"
              type="button"
              :disabled="submitting"
            />
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
// TODO: 라우터 등록 후 /plans/new, /plans/:planId/edit 경로 확인
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import InputNumber from 'primevue/inputnumber'
import { PlanApi } from '@/api/plan/planApi'
import type { CreatePlanRequest, UpdatePlanRequest, PlanSpot } from '@/api/plan/types'

const router = useRouter()
const route = useRoute()

// 모드 감지
const isEditMode = computed(() => {
  // /plans/:planId/edit 형태로 가정
  return route.params.planId !== undefined && route.path.includes('edit')
})

const planId = computed(() => {
  const id = route.params.planId
  return id ? Number(id) : null
})

// 상태 관리
const loading = ref<boolean>(false)
const submitting = ref<boolean>(false)
const loadError = ref<string>('')
const submitError = ref<string>('')
const titleError = ref<string>('')

// 폼 데이터
interface FormData {
  title: string
  description: string
  theme: string
  totalBudget: number | null
  spots: PlanSpot[]
}

const formData = ref<FormData>({
  title: '',
  description: '',
  theme: '',
  totalBudget: null,
  spots: [],
})

// 장소 추가
const addSpot = () => {
  formData.value.spots.push({
    placeNameSnapshot: '',
    placeAddressSnapshot: '',
    memo: '',
    sequence: formData.value.spots.length, // 자동 할당
  })
}

// 장소 제거
const removeSpot = (index: number) => {
  formData.value.spots.splice(index, 1)
  // sequence 재정렬
  formData.value.spots.forEach((spot, idx) => {
    spot.sequence = idx
  })
}

// 수정 모드일 경우 기존 데이터 로드
const loadPlanData = async () => {
  if (!isEditMode.value || !planId.value) return

  loading.value = true
  loadError.value = ''

  const res = await PlanApi.getPlanDetail(planId.value)

  if (res.ok) {
    const plan = res.data
    formData.value = {
      title: plan.title || '',
      description: plan.description || '',
      theme: plan.theme || '',
      totalBudget: plan.totalBudget || null,
      spots: plan.spots || [],
    }
  } else {
    loadError.value = res.error.message || '플랜 정보를 불러오는데 실패했습니다.'
  }

  loading.value = false
}

// 유효성 검증
const validateForm = (): boolean => {
  titleError.value = ''

  if (!formData.value.title.trim()) {
    titleError.value = '제목은 필수 항목입니다.'
    return false
  }

  // spots 검증: placeNameSnapshot이 비어있으면 안됨
  for (let i = 0; i < formData.value.spots.length; i++) {
    if (!formData.value.spots[i].placeNameSnapshot.trim()) {
      submitError.value = `장소 ${i + 1}의 이름을 입력해주세요.`
      return false
    }
  }

  return true
}

// 폼 제출
const handleSubmit = async () => {
  submitError.value = ''

  if (!validateForm()) {
    return
  }

  submitting.value = true

  try {
    if (isEditMode.value && planId.value) {
      // 수정 모드
      const payload: UpdatePlanRequest = {
        title: formData.value.title,
        description: formData.value.description || undefined,
        theme: formData.value.theme || undefined,
        totalBudget: formData.value.totalBudget || undefined,
        spots: formData.value.spots.length > 0 ? formData.value.spots : undefined,
      }

      const res = await PlanApi.updatePlan(planId.value, payload)

      if (res.ok) {
        // 성공 시 상세 페이지로 이동
        router.push(`/plans/${planId.value}`)
      } else {
        submitError.value = res.error.message || '플랜 수정에 실패했습니다.'
      }
    } else {
      // 생성 모드
      const payload: CreatePlanRequest = {
        title: formData.value.title,
        description: formData.value.description || undefined,
        theme: formData.value.theme || undefined,
        totalBudget: formData.value.totalBudget || undefined,
        spots: formData.value.spots.length > 0 ? formData.value.spots : undefined,
      }

      const res = await PlanApi.createPlan(payload)

      if (res.ok) {
        // 성공 시 목록으로 이동
        router.push('/plans')
      } else {
        submitError.value = res.error.message || '플랜 생성에 실패했습니다.'
      }
    }
  } finally {
    submitting.value = false
  }
}

// 취소
const handleCancel = () => {
  if (isEditMode.value && planId.value) {
    router.push(`/plans/${planId.value}`)
  } else {
    router.push('/plans')
  }
}

// 목록으로 이동
const goToList = () => {
  router.push('/plans')
}

// 컴포넌트 마운트
onMounted(() => {
  loadPlanData()
})
</script>

<style scoped>
/* 추가 스타일이 필요한 경우 여기에 작성 */
</style>
