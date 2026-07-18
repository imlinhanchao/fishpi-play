import { createRouter, createWebHashHistory } from 'vue-router'
import { GameSDK } from 'fishpi-play'
import { useUserStore } from '../store/user'

const sdk = new GameSDK('', '')

export const routes = [
  {
      path: '/',
      meta: { hidden: true },
      redirect: '/register'
  },
  {
    path: '/login',
    meta: { hidden: true },
    component: () => import('../views/Login.vue')
  },
  {
    path: '/register',
    meta: { icon: 'mdi:plus-circle-outline', title: '游戏注册' },
    component: () => import('../views/GameRegister.vue')
  },
  {
    path: '/admin',
    meta: { icon: 'mdi:controller-classic-outline', title: '游戏管理' },
    component: () => import('../views/GameAdmin.vue')
  },
  {
    path: '/super-admin',
    component: () => import('../views/SuperAdmin.vue'),
    meta: { icon: 'mdi:shield-account', title: '超级管理', requiresAdmin: true }
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  if (to.path === '/login') {
    return next()
  }

  const isAuthed = await sdk.isAuthenticated()
  if (!isAuthed) {
    return next('/login')
  }

  const userStore = useUserStore()
  if (!userStore.userInfo) {
    try {
      await userStore.fetchUserInfo()
    } catch (e) {
      return next('/login')
    }
  }

  if (to.meta.requiresAdmin && !userStore.userInfo?.isAdmin) {
    return next('/')
  }

  next()
})

export default router
