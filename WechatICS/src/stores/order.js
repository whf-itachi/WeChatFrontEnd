import { defineStore } from 'pinia'
import {
  submitOrder,
  getOrderList,
  getOrderDetail,
  updateOrder,
  deleteOrder,
  cancelOrder,
  confirmOrder,
  reviewOrder
} from '@/api/order'

export const useOrderStore = defineStore('order', {
  state: () => ({
    orderList: [],
    currentOrder: null,
    total: 0,
    loading: false,
    error: null,
    currentPage: 1,
    pageSize: 10
  }),

  getters: {
    hasMore: (state) => state.orderList.length < state.total
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

    async submitOrderAction(orderData) {
      try {
        this.setLoading(true)
        this.clearError()
        const result = await submitOrder(orderData)
        return result
      } catch (error) {
        this.setError(error.message || '提交订单失败')
        return null
      } finally {
        this.setLoading(false)
      }
    },

    async getOrderListAction(params = {}) {
      try {
        this.setLoading(true)
        this.clearError()
        const { data, total } = await getOrderList({
          page: this.currentPage,
          pageSize: this.pageSize,
          ...params
        })
        this.orderList = this.currentPage === 1 ? data : [...this.orderList, ...data]
        this.total = total
        return true
      } catch (error) {
        this.setError(error.message || '获取订单列表失败')
        return false
      } finally {
        this.setLoading(false)
      }
    },

    async getOrderDetailAction(orderId) {
      try {
        this.setLoading(true)
        this.clearError()
        const data = await getOrderDetail(orderId)
        this.currentOrder = data
        return true
      } catch (error) {
        this.setError(error.message || '获取订单详情失败')
        return false
      } finally {
        this.setLoading(false)
      }
    },

    async updateOrderAction(orderId, data) {
      try {
        this.setLoading(true)
        this.clearError()
        const result = await updateOrder(orderId, data)
        if (this.currentOrder?.id === orderId) {
          this.currentOrder = { ...this.currentOrder, ...result }
        }
        return true
      } catch (error) {
        this.setError(error.message || '更新订单失败')
        return false
      } finally {
        this.setLoading(false)
      }
    },

    async deleteOrderAction(orderId) {
      try {
        this.setLoading(true)
        this.clearError()
        await deleteOrder(orderId)
        this.orderList = this.orderList.filter(order => order.id !== orderId)
        if (this.currentOrder?.id === orderId) {
          this.currentOrder = null
        }
        return true
      } catch (error) {
        this.setError(error.message || '删除订单失败')
        return false
      } finally {
        this.setLoading(false)
      }
    },

    async cancelOrderAction(orderId) {
      try {
        this.setLoading(true)
        this.clearError()
        const result = await cancelOrder(orderId)
        if (this.currentOrder?.id === orderId) {
          this.currentOrder = { ...this.currentOrder, ...result }
        }
        return true
      } catch (error) {
        this.setError(error.message || '取消订单失败')
        return false
      } finally {
        this.setLoading(false)
      }
    },

    async confirmOrderAction(orderId) {
      try {
        this.setLoading(true)
        this.clearError()
        const result = await confirmOrder(orderId)
        if (this.currentOrder?.id === orderId) {
          this.currentOrder = { ...this.currentOrder, ...result }
        }
        return true
      } catch (error) {
        this.setError(error.message || '确认收货失败')
        return false
      } finally {
        this.setLoading(false)
      }
    },

    async reviewOrderAction(orderId, data) {
      try {
        this.setLoading(true)
        this.clearError()
        const result = await reviewOrder(orderId, data)
        if (this.currentOrder?.id === orderId) {
          this.currentOrder = { ...this.currentOrder, ...result }
        }
        return true
      } catch (error) {
        this.setError(error.message || '评价订单失败')
        return false
      } finally {
        this.setLoading(false)
      }
    },

    resetState() {
      this.orderList = []
      this.currentOrder = null
      this.total = 0
      this.currentPage = 1
      this.error = null
    }
  }
}) 