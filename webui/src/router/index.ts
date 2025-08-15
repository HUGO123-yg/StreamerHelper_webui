import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'SystemStatus',
      component: () => import('../views/SystemStatus.vue')
    },
    {
      path: '/streamers',
      name: 'StreamerManagement',
      component: () => import('../views/StreamerManagement.vue')
    },
    {
      path: '/files',
      name: 'RecordedFiles',
      component: () => import('../views/RecordedFiles.vue')
    },
    {
      path: '/config',
      name: 'ConfigManagement',
      component: () => import('../views/ConfigManagement.vue')
    },
    {
      path: '/logs',
      name: 'LogViewer',
      component: () => import('../views/LogViewer.vue')
    }
  ]
})

export default router