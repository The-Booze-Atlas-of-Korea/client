import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura'

import App from './App.vue'
import router from './router'
import { ToastService } from 'primevue'

import 'primeicons/primeicons.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
          // 다크 모드 완전히 비활성화 (항상 라이트 모드)
          darkModeSelector: false,   // 또는 'none'
        },
    },
    locale: {
            // 여기서 PrimeVue 컴포넌트에 쓰이는 텍스트들을 한글로 바꿈
            startsWith: '시작 문자',
            contains: '포함',
            notContains: '미포함',
            endsWith: '끝 문자',
            equals: '같음',
            notEquals: '같지 않음',
            noFilter: '필터 없음',
            lt: '보다 작음',
            lte: '이하',
            gt: '보다 큼',
            gte: '이상',
            dateIs: '같은 날짜',
            dateIsNot: '다른 날짜',
            dateBefore: '이전 날짜',
            dateAfter: '이후 날짜',
            clear: '초기화',
            apply: '적용',
            matchAll: '모두 일치',
            matchAny: '하나 이상 일치',
            addRule: '규칙 추가',
            removeRule: '규칙 삭제',
            accept: '확인',
            reject: '취소',
            // DatePicker / Calendar 같은 데서 씀
            dayNames: ['일요일','월요일','화요일','수요일','목요일','금요일','토요일'],
            dayNamesShort: ['일','월','화','수','목','금','토'],
            dayNamesMin: ['일','월','화','수','목','금','토'],
            monthNames: [
              '1월','2월','3월','4월','5월','6월',
              '7월','8월','9월','10월','11월','12월',
            ],
            monthNamesShort: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
            today: '오늘',
            weekHeader: '주',
            // FileUpload, Pagination 등등도 필요하면 추가 가능
    },
});
app.use(ToastService)

app.mount('#app')
