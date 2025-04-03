import { defineStore } from 'pinia'
import {
  login,
  register,
  getUserInfo,
  changePassword,
  updateUserInfo
} from '@/api/user'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null,
    token: localStorage.getItem('token') || '',
    isLoggedIn: !!localStorage.getItem('token'),
    loading: false,
    error: null
  }),

  getters: {
    name: (state) => state.userInfo?.name || '',
    phone: (state) => state.userInfo?.phone || '',
    email: (state) => state.userInfo?.email || '',
    userId: (state) => state.userInfo?.id
  },

  actions: {
    setLoading(status) {
      this.loading = status
    },

    setError(error) {
      this.error = error
    },

    clearError() {
      this.error = null
    },

    setToken(token) {
      this.token = token
      this.isLoggedIn = !!token
      if (token) {
        localStorage.setItem('token', token)
      } else {
        localStorage.removeItem('token')
      }
    },

    setUserInfo(info) {
      this.userInfo = info
    },

    async loginAction(data) {
      try {
        this.setLoading(true)
        this.clearError()
        const result = await login(data)
        if (result.token) {
          this.setToken(result.token)
          if (result.user) {
            this.setUserInfo(result.user)
          }
          return true
        }
        return false
      } catch (error) {
        this.setError(error.message || '登录失败')
        return false
      } finally {
        this.setLoading(false)
      }
    },

    async registerAction(data) {
      try {
        this.setLoading(true)
        this.clearError()
        const result = await register(data)
        this.setUserInfo(result)
        return true
      } catch (error) {
        this.setError(error.message || '注册失败')
        return false
      } finally {
        this.setLoading(false)
      }
    },

    async getUserInfoAction() {
      try {
        this.setLoading(true)
        this.clearError()
        const data = await getUserInfo()
        this.setUserInfo(data)
        return true
      } catch (error) {
        this.setError(error.message || '获取用户信息失败')
        return false
      } finally {
        this.setLoading(false)
      }
    },

    logoutAction() {
      this.token = ''
      this.userInfo = null
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    },

    async changePasswordAction(data) {
      try {
        this.setLoading(true)
        this.clearError()
        await changePassword(data)
        return true
      } catch (error) {
        this.setError(error.message || '修改密码失败')
        return false
      } finally {
        this.setLoading(false)
      }
    },

    async updateUserInfoAction(data) {
      try {
        this.setLoading(true)
        this.clearError()
        const result = await updateUserInfo(data)
        this.setUserInfo({ ...this.userInfo, ...result })
        return true
      } catch (error) {
        this.setError(error.message || '更新用户信息失败')
        return false
      } finally {
        this.setLoading(false)
      }
    }
  }
})
