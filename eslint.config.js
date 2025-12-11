// eslint.config.js
import globals from 'globals'
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import pluginVitest from '@vitest/eslint-plugin'
import pluginPlaywright from 'eslint-plugin-playwright'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'

export default defineConfigWithVueTs(
  // 어떤 파일을 린트할지
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,mjs,jsx,ts,mts,tsx,vue}'],
  },

  // 무시할 경로
  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  // 전역(global) 설정
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },

  // 기본 JS 룰
  js.configs.recommended,

  // Vue 3용 essential 룰
  pluginVue.configs['flat/essential'],

  // TypeScript + Vue(.vue)용 룰 & 파서 설정
  vueTsConfigs.recommended,

  // Vitest
  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/*'],
  },

  // Playwright
  {
    ...pluginPlaywright.configs['flat/recommended'],
    files: ['e2e/**/*.{test,spec}.{js,ts,jsx,tsx}'],
  },

  // Prettier와 충돌 방지
  skipFormatting,
)
