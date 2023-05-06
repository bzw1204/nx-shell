import { RouteRecordRaw, createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@renderer/layout/MainLayout.vue'

const root: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'MainLayout',
    component: MainLayout,
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('@renderer/views/Home.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: [...root]
})

export default router
