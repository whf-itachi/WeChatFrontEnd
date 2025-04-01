import { defineStore } from 'pinia'
import {
  submitTicket,
  getTicketList,
  getTicketDetail,
  updateTicket,
  deleteTicket,
  cancelTicket,
  confirmTicket,
  reviewTicket
} from '@/api/ticket'

export const useTicketStore = defineStore('ticket', {
  state: () => ({
    ticketList: [],
    currentTicket: null,
    loading: false,
    error: null,
    total: 0,
    currentPage: 1,
    pageSize: 10
  }),

  getters: {
    getTicketById: (state) => (id) => {
      return state.ticketList.find(ticket => ticket.id === id)
    }
  },

  actions: {
    // 设置加载状态
    setLoading(status) {
      this.loading = status
    },

    // 设置错误信息
    setError(error) {
      this.error = error
    },

    // 清除错误信息
    clearError() {
      this.error = null
    },

    // 提交工单
    async submitTicketAction(ticketData) {
      this.setLoading(true)
      this.clearError()
      try {
        const result = await submitTicket(ticketData)
        this.ticketList.unshift(result)
        this.total++
        return result
      } catch (error) {
        this.setError(error.message || '提交工单失败')
        throw error
      } finally {
        this.setLoading(false)
      }
    },

    // 获取工单列表
    async getTicketListAction(params) {
      this.setLoading(true)
      this.clearError()
      try {
        const result = await getTicketList(params)
        this.ticketList = result.records
        this.total = result.total
        this.currentPage = result.current
        this.pageSize = result.size
        return result
      } catch (error) {
        this.setError(error.message || '获取工单列表失败')
        throw error
      } finally {
        this.setLoading(false)
      }
    },

    // 获取工单详情
    async getTicketDetailAction(id) {
      this.setLoading(true)
      this.clearError()
      try {
        const result = await getTicketDetail(id)
        this.currentTicket = result
        return result
      } catch (error) {
        this.setError(error.message || '获取工单详情失败')
        throw error
      } finally {
        this.setLoading(false)
      }
    },

    // 更新工单
    async updateTicketAction(id, ticketData) {
      this.setLoading(true)
      this.clearError()
      try {
        const result = await updateTicket(id, ticketData)
        const index = this.ticketList.findIndex(ticket => ticket.id === id)
        if (index !== -1) {
          this.ticketList[index] = result
        }
        if (this.currentTicket?.id === id) {
          this.currentTicket = result
        }
        return result
      } catch (error) {
        this.setError(error.message || '更新工单失败')
        throw error
      } finally {
        this.setLoading(false)
      }
    },

    // 删除工单
    async deleteTicketAction(id) {
      this.setLoading(true)
      this.clearError()
      try {
        await deleteTicket(id)
        this.ticketList = this.ticketList.filter(ticket => ticket.id !== id)
        if (this.currentTicket?.id === id) {
          this.currentTicket = null
        }
        this.total--
      } catch (error) {
        this.setError(error.message || '删除工单失败')
        throw error
      } finally {
        this.setLoading(false)
      }
    },

    // 取消工单
    async cancelTicketAction(id) {
      this.setLoading(true)
      this.clearError()
      try {
        const result = await cancelTicket(id)
        const index = this.ticketList.findIndex(ticket => ticket.id === id)
        if (index !== -1) {
          this.ticketList[index] = result
        }
        if (this.currentTicket?.id === id) {
          this.currentTicket = result
        }
        return result
      } catch (error) {
        this.setError(error.message || '取消工单失败')
        throw error
      } finally {
        this.setLoading(false)
      }
    },

    // 确认工单
    async confirmTicketAction(id) {
      this.setLoading(true)
      this.clearError()
      try {
        const result = await confirmTicket(id)
        const index = this.ticketList.findIndex(ticket => ticket.id === id)
        if (index !== -1) {
          this.ticketList[index] = result
        }
        if (this.currentTicket?.id === id) {
          this.currentTicket = result
        }
        return result
      } catch (error) {
        this.setError(error.message || '确认工单失败')
        throw error
      } finally {
        this.setLoading(false)
      }
    },

    // 评价工单
    async reviewTicketAction(id, reviewData) {
      this.setLoading(true)
      this.clearError()
      try {
        const result = await reviewTicket(id, reviewData)
        const index = this.ticketList.findIndex(ticket => ticket.id === id)
        if (index !== -1) {
          this.ticketList[index] = result
        }
        if (this.currentTicket?.id === id) {
          this.currentTicket = result
        }
        return result
      } catch (error) {
        this.setError(error.message || '评价工单失败')
        throw error
      } finally {
        this.setLoading(false)
      }
    }
  }
}) 