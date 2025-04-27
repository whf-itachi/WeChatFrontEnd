import { defineStore } from 'pinia'
import {
  submitTicket,
  getTicketList,
  getTicketDetail,
  updateTicket,
  deleteTicket,
  cancelTicket,
  getAllTicketsByarg
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

    // 获取工单列表
    async getTicketListAction() {
      try {
        const result = await getTicketList()
        this.ticketList = result
        return result
      } catch (error) {
        console.error('获取工单列表失败:', error)
        throw error
      }
    },

    // 获取工单详情
    async getTicketDetailAction(id) {
      try {
        const result = await getTicketDetail(id)
        this.currentTicket = result
        return result
      } catch (error) {
        console.error('获取工单详情失败:', error)
        throw error
      }
    },

    // 提交工单
    async submitTicketAction(data) {
      try {
        const result = await submitTicket(data)
        return result
      } catch (error) {
        console.error('提交工单失败:', error)
        throw error
      }
    },

    // 更新工单
    async updateTicketAction(data) {
      try {
        const result = await updateTicket(data)
        return result
      } catch (error) {
        console.error('更新工单失败:', error)
        throw error
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
      try {
        const result = await cancelTicket(id)
        return result
      } catch (error) {
        console.error('取消工单失败:', error)
        throw error
      }
    },

    // 查询包含指定字符串的工单
    async getAllTicketsByarg(query) {
      this.setLoading(true)
      this.clearError()
      try {
        const result = await getAllTicketsByarg(query)
        this.ticketList = result.data
        this.total = result.total
        return result
      } catch (error) {
        this.setError(error.message || '查询工单失败')
        throw error
      } finally {
        this.setLoading(false)
      }
    }
  }
})