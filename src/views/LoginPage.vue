<template>
  <div class="min-h-screen flex flex-col">
    <!-- 헤더 -->
    <landing-login-header />

    <!-- 배경 + 카드 -->
    <main class="relative flex-1 flex items-center justify-center">
      <!-- Background Image -->
      <div
        class="absolute inset-0 bg-cover bg-center"
        :style="{ backgroundImage: `url(${backgroundImage})` }"
      />
      <!-- 어둡게 오버레이 -->
      <div class="absolute inset-0 bg-black/40"></div>

      <!-- 가운데 카드 래퍼 -->
      <div class="relative z-10 w-full max-w-5xl px-4">
        <div
          class="bg-white rounded-3xl shadow-2xl grid grid-cols-1 md:grid-cols-2 overflow-hidden border-white border"
        >
          <!-- 왼쪽: 환영 패널 -->
          <section
            class="bg-gradient-to-br from-blue-500 via-indigo-500 to-fuchsia-500 text-white flex flex-col justify-center items-center px-10 py-12 md:py-16"
          >
            <h2 class="text-3xl md:text-4xl font-bold mb-4">환영합니다</h2>
            <p class="text-center text-2xl md:text-base">
              안전하고 편리한 로그인으로<br />
              서비스를 시작하세요
            </p>
          </section>

          <!-- 오른쪽: 로그인 폼 -->
          <section class="bg-white px-10 py-12 md:py-16 flex flex-col justify-center">
            <h2 class="text-2xl md:text-3xl font-bold mb-2 text-gray-900">로그인</h2>
            <p class="text-sm text-gray-500 mb-8">이메일과 비밀번호를 입력하여 로그인하세요</p>

            <!-- 이메일 -->
            <label class="block text-left text-sm font-medium text-gray-700 mb-1"> 이메일 </label>
            <InputText v-model="loginId" placeholder="아이디을 입력하세요" class="w-full mb-4" />

            <!-- 비밀번호 -->
            <label class="block text-left text-sm font-medium text-gray-700 mb-1"> 비밀번호 </label>
            <Password
              v-model="password"
              :feedback="false"
              toggleMask
              inputClass="w-full"
              placeholder="비밀번호를 입력하세요"
              class="w-full mb-4"
            />

            <!-- 로그인 상태 유지 -->
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-2">
                <Checkbox v-model="rememberMe" :binary="true" inputId="remember" />
                <label for="remember" class="text-sm text-gray-700"> 로그인 상태 유지 </label>
              </div>
            </div>

            <!-- 로그인 버튼 -->
            <Button
              label="로그인"
              icon="pi pi-sign-in"
              class="w-full mb-4"
              severity="contrast"
              :loading="submitLoading"
              @click="onSubmit"
            />

            <p
              v-if="errorMsg.length != 0"
              class="block text-xs font-medium text-red-500 w-full justify-center text-center"
            >
              {{ errorMsg }}
            </p>

            <!-- 하단 링크 -->
            <div class="flex justify-center text-xs md:text-sm text-gray-500 mb-6">
              <button class="hover:text-gray-900">비밀번호 찾기</button>
              <span class="text-gray-500 px-2.5">|</span>
              <button class="hover:text-gray-900">
                <RouterLink to="/register">회원가입</RouterLink>
              </button>
            </div>

            <!-- 테스트 계정 -->
            <div
              class="text-xs md:text-sm text-left bg-blue-50 border border-blue-200 rounded-lg p-3"
            >
              <p class="font-semibold text-blue-800 mb-1">테스트 계정:</p>
              <p class="text-blue-700">아이디: test123</p>
              <p class="text-blue-700">비밀번호: password123!</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LandingLoginHeader from '@/components/LandingLoginHeader.vue'
import backgroundImage from '@/assets/img/login_background.png'

// PrimeVue 컴포넌트
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'
import { RouterLink, useRouter } from 'vue-router'
import { AuthController } from '@/api/AuthController'
import { ApiResult } from '@/api/ApiResult'

const router = useRouter()

const loginId = ref<string>('')
const password = ref<string>('')
const rememberMe = ref<boolean>(false)
const errorMsg = ref<string>('')
const submitLoading = ref<boolean>(false)

const onSubmit = async () => {
  submitLoading.value = true
  const res = await AuthController.login({
    loginId: loginId.value,
    password: password.value,
  })
  if (ApiResult.isFail(res)) {
    if (res.error.status === 0) {
      errorMsg.value = res.error.message
    } else {
      errorMsg.value = '로그인 실패'
    }
    submitLoading.value = false
    return
  }

  await router.push('/main')
}
</script>
