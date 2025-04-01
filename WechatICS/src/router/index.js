import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/ticket-history'
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/Register.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/ticket-history',
      name: 'ticket-history',
      component: () => import('@/views/TicketHistory.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/submit-ticket',
      name: 'submit-ticket',
      component: () => import('@/views/SubmitTicket.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/ticket-detail/:id',
      name: 'ticket-detail',
      component: () => import('@/views/TicketDetail.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFound.vue')
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const isAuthenticated = userStore.isLoggedIn

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if ((to.path === '/login' || to.path === '/register') && isAuthenticated) {
    next('/ticket-history')
  } else {
    next()
  }
})

export default router
