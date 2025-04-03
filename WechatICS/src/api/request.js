import axios from 'axios'
import { showToast } from 'vant'
import router from '@/router'
import { useUserStore } from '@/stores/user'

// 创建 axios 实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    const { response } = error
    const status = response?.status
    const data = response?.data

    // 处理认证失败的情况
    if (status === 401 || 
        (data && data.detail === 'Not authenticated') ||
        (data && data.detail && data.detail.message === '无效的认证令牌') ||
        (data && data.detail && data.detail.errors && data.detail.errors.includes('令牌已过期或无效'))) {
      // 清除用户信息
      const userStore = useUserStore()
      userStore.logoutAction()
      
      // 显示提示信息
      showToast({ 
        message: '登录已过期，请重新登录',
        duration: 2000
      })

      // 延迟跳转到登录页面
      setTimeout(() => {
        router.push('/login')
      }, 1500)
      return Promise.reject(new Error('未认证'))
    }

    // 获取错误信息
    const message = data?.detail?.message || data?.message || data?.detail || '请求失败'
    showToast(message)
    return Promise.reject(error)
  }
)

export default request
