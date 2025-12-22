<script setup lang="ts">
import MainPageLayout from '@/layout/MainPageLayout.vue'
import { computed, ref } from 'vue'
import { NaverMap, NaverMarker } from 'vue3-naver-maps'
import { useToast } from 'primevue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import ScrollPanel from 'primevue/scrollpanel'

import { BarController } from '@/api/BarController'
import { ApiResult } from '@/api/ApiResult'
import type { BarListItemDto } from '@/api/responses/BarListItemDto'
import BarMarkerImg from '@/assets/img/bar_marker.png'

const toast = useToast()

const map = ref<any>(null)
const bars = ref<BarListItemDto[]>([])
const selectedBarId = ref<number | null>(null)

const keyword = ref('')
const isLoading = ref(false)

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

const findNearbyBars = async (lat: number, lng: number) => {
  isLoading.value = true
  const res = await BarController.nearby({
    latitude: lat,
    longitude: lng,
    category: '',
    count: 30,
    keyword: keyword.value,
    sort: 'distance',
    radiusMeters: 1000,
  })

  isLoading.value = false

  if (ApiResult.isFail(res)) {
    errToast('근처의 술집을 찾는데 실패했습니다.', `${res.error.message} : ${res.error.status}`)
    return
  }

  bars.value = res.data ?? []
  // 첫 항목 자동 선택(원치 않으면 제거)
  selectedBarId.value = bars.value[0]?.id ?? null
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

const markerHtmlIcon = (bar: BarListItemDto) => {
  const selected = (bar.id ?? null) === selectedBarId.value
  const size = selected ? 58 : 42
  return {
    size: { width: size, height: size },
    anchor: { x: size / 2, y: size }, // 핀 아래가 좌표를 찍는 느낌
  }
}

const selectedBar = computed(
  () => bars.value.find((b) => (b.id ?? null) === selectedBarId.value) ?? null,
)
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

        <div v-if="selectedBar" class="p-3 border-t border-gray-100 text-xs text-gray-600">
          선택됨: <span class="font-semibold text-gray-800">{{ selectedBar.name }}</span>
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
  </MainPageLayout>
</template>
