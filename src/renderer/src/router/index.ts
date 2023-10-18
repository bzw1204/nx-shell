import { RouteRecordRaw, createRouter, createWebHashHistory } from 'vue-router'
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
      },
      {
        path: 'explorer',
        name: 'Explorer',
        component: () => import('@renderer/views/explorer/index.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: [...root]
})

export default router
