<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import Skeleton from 'primevue/skeleton'
import { MemoController } from '@/api/MemoController'

/**
 * 개인 메모 컴포넌트
 * 로그인 사용자만 사용 가능
 */
interface Props {
  /** 바 ID */
  barId: number
}

const props = defineProps<Props>()

const toast = useToast()

const loading = ref(false)
const saving = ref(false)
const content = ref('')
const memoId = ref<number | null>(null)

/** 메모 로드 */
const loadMemo = async () => {
  loading.value = true

  const res = await MemoController.getMemo(props.barId)

  if (res.ok) {
    content.value = res.data.content
    memoId.value = res.data.id
  } else {
    // 404는 메모가 없는 것이므로 정상 처리
    if (res.error.status === 404) {
      content.value = ''
      memoId.value = null
    } else if (res.error.status !== 401) {
      // 401은 로그인 필요 (이미 handleUnauthorized로 처리됨)
      toast.add({
        severity: 'error',
        summary: '메모 조회 실패',
        detail: res.error.message,
        life: 3000,
      })
    }
  }

  loading.value = false
}

/** 메모 저장 */
const saveMemo = async () => {
  if (content.value.trim().length === 0) {
    toast.add({
      severity: 'warn',
      summary: '입력 확인',
      detail: '메모 내용을 입력해 주세요.',
      life: 2500,
    })
    return
  }

  saving.value = true

  const res = await MemoController.upsertMemo(props.barId, {
    content: content.value.trim(),
  })

  if (res.ok) {
    toast.add({
      severity: 'success',
      summary: '메모 저장 완료',
      life: 2000,
    })
    memoId.value = res.data.id
  } else {
    toast.add({
      severity: 'error',
      summary: '메모 저장 실패',
      detail: res.error.message,
      life: 3000,
    })
  }

  saving.value = false
}

// barId 변경 시 다시 로드
watch(() => props.barId, loadMemo, { immediate: true })

onMounted(() => {
  loadMemo()
})
</script>

<template>
  <div class="bar-memo">
    <div class="mb-3">
      <div class="flex items-center gap-2">
        <i class="pi pi-lock text-sm text-gray-500"></i>
        <span class="text-sm font-semibold text-gray-700">나만 보는 메모</span>
      </div>
      <div class="text-xs text-gray-500 mt-1">
        이 메모는 본인만 볼 수 있습니다.
      </div>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="loading" class="space-y-2">
      <Skeleton height="80px" />
      <Skeleton height="36px" width="80px" />
    </div>

    <!-- 메모 입력 -->
    <div v-else class="space-y-2">
      <Textarea
        v-model="content"
        rows="4"
        placeholder="이 장소에 대한 개인 메모를 남겨보세요..."
        class="w-full"
      />
      <Button
        label="저장"
        icon="pi pi-save"
        size="small"
        :loading="saving"
        @click="saveMemo"
      />
    </div>
  </div>
</template>

<style scoped>
.bar-memo {
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}
</style>
