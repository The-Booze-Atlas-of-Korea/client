import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'


const naverMapsEntry = fileURLToPath(
  new URL('./node_modules/vue3-naver-maps/dist/index.js', import.meta.url),
)
// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'vue3-naver-maps': naverMapsEntry,
    },
  },
  optimizeDeps: {
    include: ['vue3-naver-maps'],
  },
})
