<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import Sidebar from 'primevue/sidebar'
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'
import InputText from 'primevue/inputtext'

const route = useRoute()
const router = useRouter()
const mobileOpen = ref(false)

const items = [
  { label: 'Home', icon: 'pi pi-home', to: '/home' },
  { label: 'Plans', icon: 'pi pi-list', to: '/plans' },
  // { label: 'Calendar', icon: 'pi pi-calendar', to: '/calendar' }, // TODO: CalendarPage 추가 후 활성화
  { label: 'History', icon: 'pi pi-history', to: '/history' },
]

const isActive = (to: string) => route.path === to || route.path.startsWith(to + '/')

const createNewPlan = () => {
  router.push('/plans/new')
}
</script>

<template>
  <div class="h-screen min-h-0 bg-slate-50 flex flex-col">
    <!-- 모바일 상단바 -->
    <header class="md:hidden sticky top-0 z-50 bg-white border-b">
      <div class="flex items-center gap-3 px-4 py-3">
        <Button icon="pi pi-bars" text rounded aria-label="Open menu" @click="mobileOpen = true" />
        <div class="font-semibold">Dashboard</div>

        <div class="ml-auto w-44">
          <span class="p-input-icon-left w-full">
            <i class="pi pi-search" />
            <InputText class="w-full" placeholder="Search" />
          </span>
        </div>
      </div>
    </header>

    <div class="flex-1 min-h-0 flex">
      <!-- 데스크톱 사이드바 -->
      <aside
        class="hidden md:flex flex-col w-20 shrink-0 sticky top-4 h-[calc(100vh-2rem)] bg-white/90 border border-slate-200 rounded-2xl shadow-lg overflow-hidden m-4"
      >
        <!-- 로고 -->
        <div class="flex items-center justify-center h-16">
          <div
            class="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center bg-white"
          >
            <i class="pi pi-box text-lg"></i>
          </div>
        </div>

        <!-- 플랜 생성 버튼 -->
        <div class="px-3 pt-2">
          <button
            @click="createNewPlan"
            class="w-full h-11 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold shadow-lg hover:shadow-xl hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
            v-tooltip.right="'새 플랜 만들기'"
          >
            <i class="pi pi-plus text-lg"></i>
          </button>
        </div>

        <!-- 아이콘 메뉴 -->
        <nav class="flex-1 flex flex-col items-center gap-2 py-4">
          <RouterLink
            v-for="item in items"
            :key="item.to"
            :to="item.to"
            v-tooltip.right="item.label"
            class="w-11 h-11 rounded-xl flex items-center justify-center transition"
            :class="
              isActive(item.to)
                ? 'bg-slate-900 text-white shadow'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
            "
          >
            <i :class="item.icon" />
          </RouterLink>
        </nav>

        <!-- 하단(설정/프로필) -->
        <div class="p-3 flex flex-col items-center gap-3 border-t border-slate-200 bg-white/60">
          <button
            class="w-11 h-11 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition"
            v-tooltip.right="'Settings'"
          >
            <i class="pi pi-cog" />
          </button>
          <Avatar shape="circle" />
        </div>
      </aside>

      <!-- 모바일 오버레이 메뉴 (PrimeVue Sidebar) -->
      <Sidebar v-model:visible="mobileOpen" position="left" class="w-72" :showCloseIcon="false">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 rounded-xl border flex items-center justify-center">
            <i class="pi pi-box text-lg"></i>
          </div>
          <div class="font-semibold">Menu</div>
          <Button class="ml-auto" icon="pi pi-times" text rounded @click="mobileOpen = false" />
        </div>

        <!-- 플랜 생성 버튼 (모바일) -->
        <Button
          label="새 플랜 만들기"
          icon="pi pi-plus"
          class="w-full mb-4 bg-gradient-to-r from-green-500 to-emerald-600 border-none"
          @click="createNewPlan(); mobileOpen = false"
        />

        <div class="flex flex-col gap-1">
          <RouterLink
            v-for="item in items"
            :key="item.to"
            :to="item.to"
            @click="mobileOpen = false"
            class="flex items-center gap-3 px-3 py-2 rounded-lg transition"
            :class="
              isActive(item.to) ? 'bg-slate-900 text-white' : 'hover:bg-slate-100 text-slate-700'
            "
          >
            <i :class="item.icon"></i>
            <span>{{ item.label }}</span>
          </RouterLink>
        </div>
      </Sidebar>

      <!-- 컨텐츠 -->
      <main class="flex-1 min-h-0 p-6 flex flex-col overflow-auto">
        <slot />
      </main>
    </div>
  </div>
</template>
