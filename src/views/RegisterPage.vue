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
            <h2 class="text-3xl md:text-4xl font-bold mb-4">회원가입</h2>
            <p class="text-center text-2xl md:text-base">새로운 시작을 환영합니다.</p>
          </section>

          <!-- 오른쪽 -->
          <section class="bg-white px-10 py-12 md:py-16 flex flex-col justify-center">
            <h2 class="text-2xl md:text-3xl font-bold mb-2 text-gray-900">회원가입</h2>
            <p class="text-sm text-gray-500 mb-8">새 계정을 만들어 서비스를 이용하세요.</p>

            <!-- 아이디 -->
            <RegisterInputText
              v-model="loginId"
              label="아이디"
              placeholder="아이디를 입력하세요"
              :regex="loginIdRegex"
              validErrorMessage="4~20자, 영문 소문자 + 숫자만 사용 가능 합니다."
              :isRequired="true"
              type="text"
              @validity-change="(val) => (loginIdValid = val)"
            />

            <!-- 비밀번호 -->
            <RegisterInputText
              v-model="password"
              label="비밀번호"
              placeholder="비밀번호를 입력하세요"
              :regex="passwordRegex"
              validErrorMessage="8~20자, 영문/숫자/특수문자를 포함해야 합니다."
              :isRequired="true"
              type="password"
              @validity-change="(val) => (passwordValid = val)"
            />

            <!-- 이름 -->
            <RegisterInputText
              v-model="name"
              label="이름"
              placeholder="이름을 입력하세요"
              validErrorMessage="필수 항목입니다."
              :isRequired="true"
              type="text"
              @validity-change="(val) => (nameValid = val)"
            />

            <!-- 이메일 -->
            <RegisterInputText
              v-model="email"
              label="이메일"
              placeholder="이메일을 입력하세요"
              validErrorMessage="이메일 형식이 아닙니다."
              :regex="emailRegex"
              :isRequired="true"
              type="text"
              @validity-change="(val) => (emailValid = val)"
            />
            <!-- 폰 -->
            <RegisterInputText
              v-model="phone"
              label="전화번호"
              placeholder="전화번호를 입력하세요"
              validErrorMessage="전화번호 형식이 아닙니다."
              :regex="phoneRegex"
              :isRequired="true"
              type="text"
              @validity-change="(val) => (phoneValid = val)"
            />
            <!-- 주소 -->
            <RegisterInputText
              v-model="adress"
              label="주소"
              placeholder="주소를 입력하세요"
              validErrorMessage="필수항목 입니다."
              :isRequired="true"
              type="text"
              @validity-change="(val) => (adressValid = val)"
            />
            <div class="flex justify-between w-full">
              <RegisterDatePicker
                v-model="birthDay"
                label="생년월일"
                placeholder="생년월일"
                validErrorMessage="필수항목 입니다."
                :isRequired="true"
                @validity-change="(val) => (birthDayValid = val)"
              />
              <RegisterSelect
                v-model="gender"
                label="성별"
                placeholder="성별"
                validErrorMessage="필수항목 입니다."
                :options="genderOptions"
                :isRequired="true"
                @validity-change="(val) => (genderValid = val)"
              />
            </div>

            <!-- 가입 버튼 -->
            <Button
              label="회원가입"
              icon="pi pi-arrow-right"
              iconPos="right"
              class="w-full mt-4 !bg-black !border-black hover:!bg-gray-900"
              :loading="submitLoading"
              @click="onSubmit"
            />
            <div class="mb-4">
              <p
                v-if="submitErrorMsg.length != 0"
                class="block text-xs font-medium text-red-500 w-full justify-center text-center mt-1"
              >
                {{ submitErrorMsg }}
              </p>
            </div>
            <!-- 돌아가기 버튼 -->
            <Button
              label="로그인으로 돌아가기"
              icon="pi pi-arrow-right"
              iconPos="right"
              class="w-full mb-4 !bg-black !border-black hover:!bg-gray-900"
            >
              <RouterLink to="/login">로그인으로 돌아가기</RouterLink>
            </Button>
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
import RegisterInputText from '@/components/RegisterInputText.vue'
import RegisterDatePicker from '@/components/RegisterDatePicker.vue'
import RegisterSelect from '@/components/RegisterSelect.vue'

// PrimeVue 컴포넌트
import Button from 'primevue/button'
import { AuthController } from '@/api/AuthController'
import { ApiResult } from '@/api/ApiResult'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue'

const router = useRouter()
const toast = useToast()

const loginId = ref<string>('')
const password = ref<string>('')
const name = ref<string>('')
const email = ref<string>('')
const phone = ref<string>('')
const adress = ref<string>('')
const birthDay = ref<Date | null>(null)
const gender = ref<string>('')

const loginIdValid = ref<boolean>(false)
const passwordValid = ref<boolean>(false)
const nameValid = ref<boolean>(false)
const emailValid = ref<boolean>(false)
const phoneValid = ref<boolean>(false)
const adressValid = ref<boolean>(false)
const birthDayValid = ref<boolean>(false)
const genderValid = ref<boolean>(false)

const genderOptions = ['M', 'F', 'OTHER']

const passwordRegex: RegExp =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[~!@#$%^&*()_+\-=?{}\[\]|:;"'<>,.\/]).{8,20}$/
const loginIdRegex: RegExp = /^[a-z0-9]{4,20}$/
const emailRegex: RegExp = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
const phoneRegex: RegExp = /^01[016789]-?\d{3,4}-?\d{4}$/

const submitLoading = ref<boolean>(false)
const submitErrorMsg = ref<string>('')

const onSubmit = async () => {
  submitLoading.value = true

  if (
    !loginIdValid.value ||
    !passwordValid.value ||
    !nameValid.value ||
    !emailValid.value ||
    !phoneValid.value ||
    !adressValid.value ||
    !birthDayValid.value ||
    !genderValid.value
  ) {
    submitErrorMsg.value = '일부 항목들이 일치 하지 않는 형식이거나 입력되지 않았습니다.'
    submitLoading.value = false
    return
  }

  const res = await AuthController.signup({
    address: adress.value,
    birthday: birthDay.value!.toISOString(),
    gender: gender.value,
    loginId: loginId.value,
    name: name.value,
    password: password.value,
    phone: phone.value,
  })

  if (ApiResult.isFail(res)) {
    const err = res.error
    let errMsg = err.message
    if (err.status === 400) {
      errMsg = '일부 항목들이 일치 하지 않는 형식이거나 입력되지 않았습니다.'
    } else if (err.status === 407) {
      errMsg = '로그인 아이디가 이미 존재하거나 일치 하지 않는 형식입니다.'
    }
    submitErrorMsg.value = errMsg
    submitLoading.value = false
    return
  }

  toast.add({
    severity: 'success',
    summary: '회원가입 성공, 로그인 하세요.',
  })
  router.push('/login')
}
</script>
