<template>
  <div class="ticket-detail">
    <!-- 顶部导航栏 -->
    <van-nav-bar
      title="工单详情"
      left-arrow
      @click-left="onClickLeft"
    />

    <!-- 工单详情内容 -->
    <div class="detail-content" v-if="ticket">
      <van-cell-group inset>
        <!-- 工单基本信息 -->
        <van-cell title="工单号" :value="ticket.ticketNo" />
        <van-cell title="提交时间" :value="formatDate(ticket.createTime)" />
        <van-cell title="状态">
          <template #value>
            <van-tag :type="getStatusType(ticket.status)">
              {{ getStatusText(ticket.status) }}
            </van-tag>
          </template>
        </van-cell>

        <!-- 工单内容 -->
        <van-cell title="机型" :value="ticket.device_model" />
        <van-cell title="客户" :value="ticket.customer" />
        <van-cell title="故障现象" :value="ticket.fault_phenomenon" />
        <van-cell title="故障原因" :value="ticket.fault_reason" />
        <van-cell title="处理方法" :value="ticket.handling_method" />
      </van-cell-group>

      <!-- 操作按钮 -->
      <div class="action-buttons" v-if="ticket.status === 0">
        <van-button
          type="danger"
          block
          class="action-button"
          @click="handleCancel"
        >
          取消工单
        </van-button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-else-if="loading" class="loading-state">
      <van-loading type="spinner" color="#1989fa" />
    </div>

    <!-- 错误状态 -->
    <div v-else class="error-state">
      <van-empty description="获取工单详情失败" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTicketStore } from '@/stores/ticket'
import { showToast, showDialog } from 'vant'

const router = useRouter()
const route = useRoute()
const ticketStore = useTicketStore()
const ticket = ref(null)
const loading = ref(true)

// 获取工单详情
const getTicketDetail = async () => {
  try {
    const result = await ticketStore.getTicketDetailAction(route.params.id)
    ticket.value = result
  } catch (error) {
    console.error('获取工单详情失败:', error)
    showToast('获取工单详情失败')
  } finally {
    loading.value = false
  }
}

// 取消工单
const handleCancel = () => {
  showDialog({
    title: '确认取消',
    message: '确定要取消这个工单吗？',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(async () => {
    try {
      await ticketStore.cancelTicketAction(ticket.value.id)
      showToast('取消成功')
      router.back()
    } catch (error) {
      console.error('取消工单失败:', error)
      showToast('取消失败，请重试')
    }
  })
}

// 返回上一页
const onClickLeft = () => {
  router.back()
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString()
}

// 获取状态类型
const getStatusType = (status) => {
  const statusMap = {
    0: 'warning',   // 待处理
    1: 'primary',   // 处理中
    2: 'success',   // 已完成
    3: 'danger'     // 已取消
  }
  return statusMap[status] || 'default'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    0: '待处理',
    1: '处理中',
    2: '已完成',
    3: '已取消'
  }
  return statusMap[status] || '未知状态'
}

onMounted(() => {
  getTicketDetail()
})
</script>

<style scoped>
.ticket-detail {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.detail-content {
  padding: 16px;
}

.action-buttons {
  margin-top: 24px;
  padding: 0 16px;
}

.action-button {
  margin-bottom: 16px;
}

.loading-state,
.error-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

:deep(.van-cell__value) {
  text-align: left;
}

:deep(.van-tag) {
  margin-left: 8px;
}
</style> 