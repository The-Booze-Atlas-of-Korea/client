<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-4">
      <div class="flex items-center gap-2">
        <span class="text-2xl">🍺</span>
        <span class="text-white font-bold text-lg">술동여지도</span>
      </div>
      <nav class="flex items-center gap-6">
        <a href="#" class="text-white hover:text-orange-400 transition-colors">About</a>
        <a href="#" class="text-white hover:text-orange-400 transition-colors">Contact</a>
      </nav>
    </header>

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
          시작하기
        </Button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Button } from 'primevue';
import backgroundImage from '../assets/img/landingbackground.png'

</script>