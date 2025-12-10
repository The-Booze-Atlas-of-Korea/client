<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <landing-login-header/>

    <!-- Hero Section -->
    <main class="relative flex-1 flex items-center justify-center">
      <!-- Background Image -->
      <div 
        class="absolute inset-0 bg-cover bg-center"
        :style="{ backgroundImage: `url(${backgroundImage})` }"
      >
        <!-- Dark Overlay -->
        <div class="absolute inset-0 bg-black/50"></div>
        <!-- Network Pattern Overlay -->
      </div>

      <!-- Content -->
      <div class="relative z-10 text-center px-4">
        <h1 class="text-5xl md:text-6xl font-bold text-white mb-4 tracking-wide">
          술동여지도
        </h1>
        <p class="text-gray-300 text-lg mb-8">
          내 주변 최고의 술집 찾기
        </p>
        <Button 
          class="text-white font-semibold px-8 py-3 rounded"
        >
          <RouterLink to="/login"> 시작하기 </RouterLink>
        </Button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button';
import backgroundImage from '../assets/img/landingbackground.png'
import LandingLoginHeader from '@/components/LandingLoginHeader.vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import LoginPage from './LoginPage.vue'

const router = useRouter()
const route = useRoute()

</script>