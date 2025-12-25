<script setup lang="ts">
import MainPageLayout from '@/layout/MainPageLayout.vue'
import { computed, nextTick, onMounted, ref } from 'vue'
import { NaverMap, NaverMarker } from 'vue3-naver-maps'
import { useToast } from 'primevue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import ScrollPanel from 'primevue/scrollpanel'
import Dialog from 'primevue/dialog'

import { BarController } from '@/api/BarController'
import { ApiResult } from '@/api/ApiResult'
import type { BarListItemDto } from '@/api/responses/BarListItemDto'
import { PlanApi } from '@/api/plan/planApi'
import type { Plan, PlanSpot } from '@/api/plan/types'
import BarMarkerImg from '@/assets/img/bar_marker.png'

import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'

import { AIRecommendController } from '@/api/AiRecommendController'
import type { GetRecommendedBarsResponseDto } from '@/api/responses/RecommendedBarItemResponseDto'

const toast = useToast()

const map = ref<any>(null)

type MapBarItem = BarListItemDto & {
  recommendRank?: number
  recommendReason?: string
}

const bars = ref<MapBarItem[]>([]) // 기존 BarListItemDto[] → MapBarItem[] 로 변경
const selectedBarForAdd = ref<MapBarItem | null>(null) // 타입 맞춰주기
const selectedBarId = ref<number | null>(null)

const keyword = ref('')
const isLoading = ref(false)

// 플랜 관련 상태
const showPlanDialog = ref(false)
const userPlans = ref<Plan[]>([])
const addingToPlan = ref(false)

const mapOptions = ref({
  latitude: 36.35044,
  longitude: 127.384951,
  zoom: 16,
  zoomControl: false,
  zoomControlOptions: { position: 'TOP_RIGHT' },
})

const initLayers = ['BACKGROUND', 'BACKGROUND_DETAIL', 'POI_KOREAN', 'TRANSIT', 'ENGLISH']

const errToast = (summary: string, detail: string) => {
  toast.add({ severity: 'error', summary, detail, life: 3500 })
}

// 마커 렌더 토글(핵심)
const renderMarkers = ref(true)

// bars를 안전하게 교체: 마커 언마운트 -> bars 교체 -> 마커 마운트
const setBarsSafely = async (nextBars: BarListItemDto[]) => {
  // 1) 다이얼로그가 닫히도록 먼저 한 틱 렌더 기회를 줌
  await nextTick()

  // 2) 마커 먼저 내리기(언마운트)
  renderMarkers.value = false
  await nextTick()

  // 3) 데이터 교체
  bars.value = nextBars
  selectedBarId.value = nextBars[0]?.id ?? null

  await nextTick()

  // 4) 마커 다시 올리기(마운트)
  renderMarkers.value = true
  await nextTick()

  await refreshMapLayout()
}

const triggerMapResize = () => {
  const m = map.value
  if (!m) return

  const naverAny = (window as any).naver
  naverAny?.maps?.Event?.trigger?.(m, 'resize') // ✅ 네이버맵 리사이즈 트리거
  naverAny?.maps?.refresh?.(true)
}

// 레이아웃/데이터 변경 직후에 안전하게 리페인트
const refreshMapLayout = async () => {
  await nextTick()
  requestAnimationFrame(() => {
    triggerMapResize()
    // flex 레이아웃 갱신 직후 한 번 더(경험상 이게 효과 큼)
    setTimeout(triggerMapResize, 0)
  })
}

const getCenter = () => {
  const center = map.value?.getCenter?.()
  // naver.maps.LatLng 형태면 lat()/lng()가 있음
  const lat = typeof center?.lat === 'function' ? center.lat() : mapOptions.value.latitude
  const lng = typeof center?.lng === 'function' ? center.lng() : mapOptions.value.longitude
  return { lat, lng }
}

let reqSeq = 0
const findNearbyBars = async (lat: number, lng: number) => {
  const mySeq = ++reqSeq
  isLoading.value = true
  const res = await BarController.nearby({
    latitude: lat,
    longitude: lng,
    category: '',
    count: 30,
    keyword: keyword.value,
    sort: 'distance',
    radiusMeters: 2000,
  })
  if (mySeq !== reqSeq) return
  isLoading.value = false

  if (ApiResult.isFail(res)) {
    errToast('근처의 술집을 찾는데 실패했습니다.', `${res.error.message} : ${res.error.status}`)
    return
  }

  await setBarsSafely(res.data ?? [])
}

const searchHere = async () => {
  const { lat, lng } = getCenter()
  await findNearbyBars(lat, lng)
}

const onLoadMap = async (mapObject: any) => {
  map.value = mapObject
  await findNearbyBars(mapOptions.value.latitude, mapOptions.value.longitude)
}

const selectBar = (bar: BarListItemDto) => {
  selectedBarId.value = bar.id ?? null

  // 지도 중심 이동
  const naverAny = (window as any).naver
  const LatLng = naverAny?.maps?.LatLng
  if (map.value?.setCenter && LatLng) {
    map.value.setCenter(new LatLng(bar.latitude, bar.longitude))
  } else {
    // fallback
    mapOptions.value = { ...mapOptions.value, latitude: bar.latitude, longitude: bar.longitude }
  }
}

const selectedBar = computed(
  () => bars.value.find((b) => (b.id ?? null) === selectedBarId.value) ?? null,
)

// 플랜 목록 로드
const loadUserPlans = async () => {
  const res = await PlanApi.listPlans()
  if (res.ok) {
    const data = res.data as any
    userPlans.value = Array.isArray(data) ? data : data?.content || []
  } else {
    errToast('플랜 목록 조회 실패', res.error.message || '')
  }
}

// 플랜에 추가 다이얼로그 열기
const openPlanDialog = async (bar: BarListItemDto) => {
  selectedBarForAdd.value = bar
  await loadUserPlans()
  showPlanDialog.value = true
}

// 플랜에 장소 추가
const addBarToPlan = async (planId: number) => {
  if (!selectedBarForAdd.value) return

  addingToPlan.value = true

  try {
    // 기존 플랜 데이터 조회
    const planRes = await PlanApi.getPlanDetail(planId)
    if (!planRes.ok) {
      errToast('플랜 조회 실패', planRes.error.message || '')
      return
    }

    const plan = planRes.data
    const existingSpots = plan.spots || []

    // 새 spot 생성
    const newSpot: PlanSpot = {
      placeId: selectedBarForAdd.value.id,
      placeNameSnapshot: selectedBarForAdd.value.name,
      placeAddressSnapshot: selectedBarForAdd.value.address,
      latitude: selectedBarForAdd.value.latitude,
      longitude: selectedBarForAdd.value.longitude,
      sequence: existingSpots.length + 1,
      memo: '',
    }

    // PUT 요청으로 업데이트
    const updateRes = await PlanApi.updatePlan(planId, {
      spots: [...existingSpots, newSpot],
    })

    if (updateRes.ok) {
      toast.add({
        severity: 'success',
        summary: '플랜에 추가되었습니다',
        detail: `"${selectedBarForAdd.value.name}"이(가) "${plan.title}"에 추가되었습니다.`,
        life: 3000,
      })
      showPlanDialog.value = false
    } else {
      errToast('플랜 추가 실패', updateRes.error.message || '')
    }
  } finally {
    addingToPlan.value = false
  }
}

// AI 추천 관련 상태
const showAiDialog = ref(false)
const aiLoading = ref(false)
const aiMaxDistance = ref<number>(2000) // 기본값(원하면 3000 등)
const aiUserPrompt = ref('')

// AI 다이얼로그 열기
const openAiDialog = () => {
  // 필요하면 여기서 기본 프롬프트 세팅 가능
  aiUserPrompt.value = '조용한 곳, 2차로 가기 좋은...'
  showAiDialog.value = true
}

// AI 추천 실행 (성공 시 bars 갱신 + 마커 갱신)
const runAiRecommend = async () => {
  const prompt = aiUserPrompt.value.trim()
  if (!prompt) {
    toast.add({
      severity: 'warn',
      summary: '입력 필요',
      detail: '원하는 조건을 입력해 주세요.',
      life: 2500,
    })
    return
  }
  if (prompt.length > 300) {
    toast.add({
      severity: 'warn',
      summary: '길이 초과',
      detail: 'userPrompt는 300자 이하로 입력해 주세요.',
      life: 2500,
    })
    return
  }
  if (aiMaxDistance.value < 50 || aiMaxDistance.value > 20000) {
    toast.add({
      severity: 'warn',
      summary: '거리 범위 오류',
      detail: 'maxDistance는 50 ~ 20000 (m) 범위로 입력해 주세요.',
      life: 2500,
    })
    return
  }

  const { lat, lng } = getCenter()

  aiLoading.value = true
  const res = await AIRecommendController.recommendBars({
    lat,
    lon: lng,
    maxDistance: aiMaxDistance.value,
    userPrompt: prompt,
  })
  aiLoading.value = false

  if (ApiResult.isFail(res)) {
    errToast('AI 추천에 실패했습니다.', `${res.error.message} : ${res.error.status}`)
    return
  }

  const items = (res.data ?? []) as GetRecommendedBarsResponseDto
  if (items.length === 0) {
    toast.add({
      severity: 'info',
      summary: '결과 없음',
      detail: 'AI 추천 결과가 없습니다.',
      life: 2500,
    })
    return
  }

  showAiDialog.value = false
  await nextTick()

  // ✅ 여기서 bars를 AI 결과로 교체 → 리스트/마커가 같이 갱신됨
  const results = items.map((i) => ({
    // BarListItemDto에 필요한 최소 필드들(구조적 타이핑이라 추가 필드 붙여도 OK)
    id: i.id,
    name: i.name,
    address: i.address,
    latitude: i.latitude,
    longitude: i.longitude,

    // AI 부가정보
    recommendRank: i.recommendRank,
    recommendReason: i.recommendReason,

    // (BarListItemDto에 아래 필드가 있다면 같이 넣어주면 좋음)
    // baseCategoryName: i.baseCategoryName ?? '',
    // openInformation: i.openInformation ?? '',
  })) as MapBarItem[]

  await setBarsSafely(results ?? [])

  toast.add({
    severity: 'success',
    summary: 'AI 추천 완료',
    detail: `${items.length}개 추천을 불러왔습니다.`,
    life: 2500,
  })
}

// 컴포넌트 마운트 시 플랜 목록 미리 로드 (선택 사항)
onMounted(() => {
  loadUserPlans()
})
</script>

<template>
  <MainPageLayout>
    <div class="h-full min-h-0 flex flex-col md:flex-row gap-3">
      <!-- 사이드 패널 -->
      <aside
        class="md:w-[360px] w-full shrink-0 border border-gray-200 rounded-lg bg-white min-h-[260px] md:min-h-0 flex flex-col overflow-hidden"
      >
        <div class="p-3 border-b border-gray-100 flex items-center gap-2 shrink-0">
          <span class="font-semibold">근처 술집</span>
          <span class="text-xs text-gray-500">({{ bars.length }})</span>
        </div>

        <div class="p-3 flex gap-1 shrink-0">
          <InputText
            v-model="keyword"
            placeholder="키워드 (상호/카테고리 등)"
            class="w-full"
            @keyup.enter="searchHere"
          />
          <Button :loading="isLoading" label="검색" @click="searchHere" />
        </div>

        <div class="px-3 pb-3 shrink-0">
          <Button
            :loading="isLoading"
            icon="pi pi-map-marker"
            label="현재 지도에서 다시 검색"
            class="w-full"
            severity="secondary"
            @click="searchHere"
          />
        </div>

        <div class="px-3 pb-3 shrink-0">
          <Button
            :loading="isLoading || aiLoading"
            icon="pi pi-star"
            label="AI 추천 받기"
            class="w-full"
            severity="help"
            @click="openAiDialog"
          />
        </div>

        <ScrollPanel class="px-3 pb-3 flex-1 min-h-0">
          <div v-if="isLoading" class="text-sm text-gray-500 py-6 text-center">불러오는 중...</div>

          <div v-else-if="bars.length === 0" class="text-sm text-gray-500 py-10 text-center">
            검색 결과가 없습니다.
          </div>

          <ul v-else class="space-y-2">
            <li
              v-for="(bar, idx) in bars"
              :key="bar.id ?? `${bar.latitude}-${bar.longitude}-${idx}`"
              class="p-3 rounded-lg border cursor-pointer transition"
              :class="
                (bar.id ?? null) === selectedBarId
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-200 hover:bg-gray-50'
              "
              @click="selectBar(bar)"
            >
              <div v-if="(bar as any).recommendReason" class="text-xs text-gray-500 mt-1">
                <span class="font-semibold text-purple-600">AI</span>
                {{ (bar as any).recommendRank }}위 · {{ (bar as any).recommendReason }}
              </div>

              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <div class="font-semibold truncate">{{ bar.name }}</div>
                  <div class="text-xs text-gray-600 truncate">{{ bar.address }}</div>
                </div>
              </div>
            </li>
          </ul>
        </ScrollPanel>

        <div v-if="selectedBar" class="p-3 border-t border-gray-100 shrink-0 mt-auto bg-white">
          <div class="text-xs text-gray-600 mb-2">
            선택됨: <span class="font-semibold text-gray-800">{{ selectedBar.name }}</span>
          </div>
          <Button
            label="플랜에 추가"
            icon="pi pi-plus"
            class="w-full"
            severity="contrast"
            @click="openPlanDialog(selectedBar)"
          />
        </div>
      </aside>

      <!-- 지도 -->
      <section
        class="flex-1 min-w-0 min-h-[55vh] md:min-h-0 border border-gray-200 rounded-lg overflow-hidden"
      >
        <naver-map
          style="width: 100%; height: 100%"
          :mapOptions="mapOptions"
          :initLayers="initLayers"
          @onLoad="onLoadMap"
        >
          <template v-if="renderMarkers">
            <NaverMarker
              v-for="bar in bars"
              :key="bar.id ?? `${bar.latitude}-${bar.longitude}`"
              :latitude="bar.latitude"
              :longitude="bar.longitude"
              :htmlIcon="{ size: { width: 64, height: 64 }, anchor: { x: 32, y: 64 } }"
              @click="selectBar(bar)"
            >
              <div class="relative flex items-end justify-center w-full h-full">
                <img
                  :src="BarMarkerImg"
                  alt="marker"
                  class="block"
                  style="width: 64px; height: 64px"
                />

                <div
                  v-if="(bar as any).recommendRank"
                  class="absolute bottom-2 right-2 text-xs px-2 py-0.5 rounded-full bg-black/70 text-white"
                >
                  {{ (bar as any).recommendRank }}
                </div>
              </div>
            </NaverMarker>
          </template>
        </naver-map>
      </section>
    </div>

    <!-- 플랜 선택 다이얼로그 -->
    <Dialog
      v-model:visible="showPlanDialog"
      header="플랜에 추가"
      :modal="true"
      :style="{ width: '90vw', maxWidth: '500px' }"
    >
      <div v-if="selectedBarForAdd" class="mb-4">
        <div class="text-sm text-gray-600">추가할 장소:</div>
        <div class="font-semibold text-lg">{{ selectedBarForAdd.name }}</div>
        <div class="text-xs text-gray-500">{{ selectedBarForAdd.address }}</div>
      </div>

      <div v-if="userPlans.length === 0" class="text-center py-6 text-gray-500">
        <i class="pi pi-inbox text-4xl mb-3"></i>
        <div>플랜이 없습니다.</div>
        <div class="text-xs">먼저 플랜을 생성해주세요.</div>
      </div>

      <div v-else class="space-y-2 max-h-[60vh] overflow-y-auto">
        <div
          v-for="plan in userPlans"
          :key="plan.id || plan.planId"
          class="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition"
          @click="addBarToPlan(plan.id || plan.planId!)"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0">
              <div class="font-semibold truncate">{{ plan.title || '제목 없음' }}</div>
              <div class="text-xs text-gray-600 truncate">{{ plan.description }}</div>
              <div class="flex items-center gap-2 mt-1">
                <span
                  v-if="plan.theme"
                  class="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded"
                >
                  {{ plan.theme }}
                </span>
                <span class="text-xs text-gray-500">{{ plan.spots?.length || 0 }}개 장소</span>
              </div>
            </div>
            <i class="pi pi-angle-right text-gray-400"></i>
          </div>
        </div>
      </div>

      <template #footer>
        <Button label="취소" severity="secondary" outlined @click="showPlanDialog = false" />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="showAiDialog"
      header="AI 추천"
      :modal="true"
      :style="{ width: '90vw', maxWidth: '520px' }"
    >
      <div class="space-y-4">
        <div>
          <div class="text-xs text-gray-600 mb-1">최대 거리 (m)</div>
          <InputNumber
            v-model="aiMaxDistance"
            :min="50"
            :max="20000"
            class="w-full"
            inputClass="w-full"
          />
          <div class="text-[11px] text-gray-400 mt-1">50 ~ 20000m</div>
        </div>

        <div>
          <div class="text-xs text-gray-600 mb-1">원하는 조건 (분위기/가격/2차/안주 등)</div>
          <Textarea v-model="aiUserPrompt" rows="4" autoResize class="w-full" />
          <div class="text-[11px] text-gray-400 mt-1">300자 이하</div>
        </div>

        <div class="text-xs text-gray-500">현재 지도 중심 좌표 기준으로 추천합니다.</div>
      </div>

      <template #footer>
        <Button label="취소" severity="secondary" outlined @click="showAiDialog = false" />
        <Button label="AI 추천" icon="pi pi-star" :loading="aiLoading" @click="runAiRecommend" />
      </template>
    </Dialog>
  </MainPageLayout>
</template>
