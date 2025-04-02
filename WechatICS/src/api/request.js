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
    if (error.response) {
      const { status, data } = error.response
      
      // 处理未认证的情况
      if (status === 401 || 
          (data && data.detail === 'Not authenticated') ||
          (data && data.detail && data.detail.message === '无效的认证令牌')) {
        const userStore = useUserStore()
        // 清除用户信息
        userStore.logoutAction()
        // 显示提示
        showToast('登录已过期，请重新登录')
        // 跳转到登录页面
        router.push('/login')
        return Promise.reject(new Error('未认证'))
      }

      // 处理其他错误
      const message = data?.detail?.message || data?.message || data?.detail || '请求失败'
      showToast(message)
    } else {
      showToast('网络错误，请检查网络连接')
    }
    return Promise.reject(error)
  }
)

export default request
