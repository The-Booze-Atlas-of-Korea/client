<script setup lang="ts">
import MainPageLayout from '@/layout/MainPageLayout.vue'
import { ref } from 'vue'
import { NaverMap } from 'vue3-naver-maps'

const map = ref()

const mapOptions = {
  latitude: 36.35044, // 지도 중앙 위도
  longitude: 127.384951, // 지도 중앙 경도
  zoom: 16,
  zoomControl: false,
  zoomControlOptions: { position: 'TOP_RIGHT' },
}

const initLayers = ['BACKGROUND', 'BACKGROUND_DETAIL', 'POI_KOREAN', 'TRANSIT', 'ENGLISH']

const onLoadMap = (mapObject: any) => {
  map.value = mapObject
}
</script>

<template>
  <MainPageLayout>
    <div class="flex-1 min-h-0 h-full border border-gray-200 rounded-lg">
      <naver-map
        style="width: 100%; height: 100%; overflow: hidden"
        :mapOptions="mapOptions"
        :initLayers="initLayers"
        @onLoad="onLoadMap"
      />
    </div>
  </MainPageLayout>
</template>

<style scoped></style>
