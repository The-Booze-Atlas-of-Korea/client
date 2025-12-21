import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import LandingPage from '@/views/LandingPage.vue'
import LoginPage from '@/views/LoginPage.vue'
import RegisterPage from '@/views/RegisterPage.vue'
import HomePage from '@/views/HomePage.vue'
import PlansListPage from '@/views/PlansListPage.vue' // TODO: 백엔드 listPlans 엔드포인트 추가 후 활성화
import PlanFormPage from '@/views/PlanFormPage.vue'
import PlanDetailPage from '@/views/PlanDetailPage.vue'
import ScheduleCreatePage from '@/views/ScheduleCreatePage.vue'
import ScheduleHistoryPage from '@/views/ScheduleHistoryPage.vue'


const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'LandingPage',
    component: LandingPage,
  },
  {
    path: '/login',
    name: 'LoginPage',
    component: LoginPage,
  },
  {
    path: '/register',
    name: 'RegisterPage',
    component: RegisterPage,
  },
  {
    path: '/home',
    name: 'HomePage',
    component: HomePage,
  },
  //플랜 관련 라우트 (Issue #27)
  {
    path: '/plans',
    name: 'PlansList',
    component: PlansListPage,
  },
  {
    path: '/plans/new',
    name: 'PlanFormCreate',
    component: PlanFormPage,
  },
  {
    path: '/plans/:planId',
    name: 'PlanDetail',
    component: PlanDetailPage,
  },
  {
    path: '/plans/:planId/edit',
    name: 'PlanFormEdit',
    component: PlanFormPage,
  },
  {
    path: '/plans/:planId/schedule/create',
    name: 'ScheduleCreate',
    component: ScheduleCreatePage,
  },
  // 캘린더 및 이력 라우트 (Issue #27)
  {
    path: '/history',
    name: 'ScheduleHistory',
    component: ScheduleHistoryPage,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
