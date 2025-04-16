import axios from 'axios'
import { showToast } from 'vant'
// import router from '@/router'
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
    
    // 如果是FormData，不设置Content-Type，让浏览器自动设置
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
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
    console.error('请求错误：', error)
    const { response } = error
    
    if (!response) {
      showToast('网络错误，请检查网络连接')
      return Promise.reject(error)
    }

    const status = response.status
    const data = response.data

    // 处理认证失败的情况
    if (status === 401) {
      // 清除用户信息
      const userStore = useUserStore()
      userStore.logoutAction()
      
      // 使用 window.location.href 进行跳转
      setTimeout(() => {
        window.location.href = '/login'
      }, 1000)
      
      return Promise.reject(new Error('未认证'))
    }

    // 获取错误信息
    let message = '请求失败'
    if (data) {
      if (typeof data === 'string') {
        message = data
      } else if (data.detail) {
        message = typeof data.detail === 'string' ? data.detail : data.detail.message || '请求失败'
      } else if (data.message) {
        message = data.message
      }
    }
    console.log('message信息: ', message)
    return Promise.reject(new Error(message))
  }
)

export default request
