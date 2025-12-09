import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';

import App from './App.vue'
import router from './router'


const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
          // 다크 모드 완전히 비활성화 (항상 라이트 모드)
          darkModeSelector: false,   // 또는 'none'
        }
    }
});

app.mount('#app')
