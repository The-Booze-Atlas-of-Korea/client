<script setup lang="ts">
import MainPageLayout from '@/layout/MainPageLayout.vue'
import { computed, onMounted, ref } from 'vue'
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

const toast = useToast()

const map = ref<any>(null)
const bars = ref<BarListItemDto[]>([])
const selectedBarId = ref<number | null>(null)

const keyword = ref('')
const isLoading = ref(false)

// 플랜 관련 상태
const showPlanDialog = ref(false)
const selectedBarForAdd = ref<BarListItemDto | null>(null)
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

  bars.value = res.data ?? []
  map.value?.refresh?.(true)
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
    userPlans.value = Array.isArray(data) ? data : (data?.content || [])
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
        class="md:w-[360px] w-full shrink-0 border border-gray-200 rounded-lg bg-white min-h-[260px] md:min-h-0"
      >
        <div class="p-3 border-b border-gray-100 flex items-center gap-2">
          <span class="font-semibold">근처 술집</span>
          <span class="text-xs text-gray-500">({{ bars.length }})</span>
        </div>

        <div class="p-3 flex gap-1">
          <InputText
            v-model="keyword"
            placeholder="키워드 (상호/카테고리 등)"
            class="w-full"
            @keyup.enter="searchHere"
          />
          <Button :loading="isLoading" label="검색" @click="searchHere" />
        </div>

        <div class="px-3 pb-3">
          <Button
            :loading="isLoading"
            icon="pi pi-map-marker"
            label="현재 지도에서 다시 검색"
            class="w-full"
            severity="secondary"
            @click="searchHere"
          />
        </div>

        <ScrollPanel style="height: calc(100% - 156px)" class="px-3 pb-3">
          <div v-if="isLoading" class="text-sm text-gray-500 py-6 text-center">불러오는 중...</div>

          <div v-else-if="bars.length === 0" class="text-sm text-gray-500 py-10 text-center">
            검색 결과가 없습니다.
          </div>

          <ul v-else class="space-y-2">
            <li
              v-for="bar in bars"
              :key="bar.id ?? `${bar.latitude}-${bar.longitude}`"
              class="p-3 rounded-lg border cursor-pointer transition"
              :class="
                (bar.id ?? null) === selectedBarId
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-200 hover:bg-gray-50'
              "
              @click="selectBar(bar)"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <div class="font-semibold truncate">{{ bar.name }}</div>
                  <div class="text-xs text-gray-600 truncate">{{ bar.address }}</div>
                </div>
              </div>
              <!-- 필요하면 dto 필드에 맞춰 추가 표시 -->
              <!-- <div class="text-xs text-gray-500 mt-1">카테고리: {{ bar.baseCategoryName }}</div> -->
            </li>
          </ul>
        </ScrollPanel>

        <div v-if="selectedBar" class="p-3 border-t border-gray-100">
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
          <NaverMarker
            v-for="bar in bars"
            :key="bar.id ?? `${bar.latitude}-${bar.longitude}`"
            :latitude="bar.latitude"
            :longitude="bar.longitude"
            :htmlIcon="{ size: { width: 64, height: 64 }, anchor: { x: 32, y: 64 } }"
            @click="selectBar(bar)"
          >
            <div class="flex items-end justify-center w-full h-full">
              <img
                :src="BarMarkerImg"
                alt="marker"
                class="block"
                style="width: 64px; height: 64px"
              />
            </div>
          </NaverMarker>
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
                <span v-if="plan.theme" class="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
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
        <Button
          label="취소"
          severity="secondary"
          outlined
          @click="showPlanDialog = false"
        />
      </template>
    </Dialog>
  </MainPageLayout>
</template>
