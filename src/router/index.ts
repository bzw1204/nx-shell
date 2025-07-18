import { BaseLayout } from '@/layouts'
import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: BaseLayout,
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          component: () => import('@/views/index.vue')
        },
        {
          path: 'settings',
          component: () => import('@/views/settings/index.vue')
        }
      ]
    }
  ]
})
export default router
