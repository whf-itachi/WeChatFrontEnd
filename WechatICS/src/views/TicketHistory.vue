<template>
  <div class="ticket-history">
    <!-- 顶部导航栏 -->
    <van-nav-bar
      title="所有工单"
      left-arrow
      @click-left="onClickLeft"
    />

    <!-- 工单列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <div class="ticket-list">
          <div v-for="ticket in ticketList" :key="ticket.id" class="ticket-card" @click="goToDetail(ticket.id)">
            <div class="ticket-header">
              <span class="ticket-id">工单号：{{ ticket.id }}</span>
              <span class="ticket-time">{{ formatDate(ticket.create_at) }}</span>
            </div>
            <div class="ticket-content">
              <div class="ticket-item">
                <span class="label">机型：</span>
                <span class="value">{{ ticket.device_model }}</span>
              </div>
              <div class="ticket-item">
                <span class="label">客户：</span>
                <span class="value">{{ ticket.customer }}</span>
              </div>
              <div class="ticket-item">
                <span class="label">故障现象：</span>
                <span class="value">{{ truncateText(ticket.fault_phenomenon) }}</span>
              </div>
              <div class="ticket-item">
                <span class="label">故障原因：</span>
                <span class="value">{{ truncateText(ticket.fault_reason) }}</span>
              </div>
              <div class="ticket-item">
                <span class="label">处理方法：</span>
                <span class="value">{{ truncateText(ticket.handling_method) }}</span>
              </div>
              <div class="ticket-item">
                <span class="label">处理人：</span>
                <span class="value">{{ ticket.handler }}</span>
              </div>
              <!-- 添加附件显示 -->
              <div v-if="ticket.attachments && ticket.attachments.length > 0" class="ticket-item">
                <span class="label">附件：</span>
                <span class="value">
                  <van-tag 
                    v-for="(file, index) in ticket.attachments" 
                    :key="file.id"
                    type="primary"
                    plain
                    class="file-tag"
                  >
                    {{ file.file_name }}
                  </van-tag>
                </span>
              </div>
            </div>
          </div>
        </div>
      </van-list>
    </van-pull-refresh>

    <!-- 空状态 -->
    <van-empty v-if="!loading && ticketList.length === 0" description="暂无工单记录" />

    <!-- 底部提交按钮 -->
    <div class="submit-button">
      <van-button
        round
        block
        type="primary"
        @click="goToSubmitTicket"
      >
        新建工单
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTicketStore } from '@/stores/ticket'
import { showToast } from 'vant'
import { formatDate } from '@/utils/date'

const router = useRouter()
const ticketStore = useTicketStore()
const ticketList = ref([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

// 获取工单列表
const getTicketList = async () => {
  try {
    const result = await ticketStore.getTicketListAction()
    if (refreshing.value) {
      ticketList.value = []
      refreshing.value = false
    }
    ticketList.value = result
    loading.value = false
    finished.value = true
  } catch (error) {
    console.error('获取工单列表失败:', error)
    showToast('获取工单列表失败')
    loading.value = false
  }
}

// 下拉刷新
const onRefresh = () => {
  finished.value = false
  getTicketList()
}

// 上拉加载
const onLoad = () => {
  finished.value = true
  loading.value = false
}

// 跳转到详情页
const goToDetail = (id) => {
  router.push(`/ticket-detail/${id}`)
}

// 返回上一页
const onClickLeft = () => {
  router.back()
}

// 跳转到提交工单页面
const goToSubmitTicket = () => {
  router.push('/submit-ticket')
}

// 截断文本
const truncateText = (text, maxLength = 50) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

onMounted(() => {
  getTicketList()
})
</script>

<style scoped>
.ticket-history {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 80px;
}

.ticket-list {
  padding: 16px;
}

.ticket-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f5f5f5;
}

.ticket-id {
  font-weight: bold;
  color: #323233;
}

.ticket-time {
  color: #969799;
  font-size: 14px;
}

.ticket-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ticket-item {
  display: flex;
  align-items: flex-start;
  font-size: 14px;
  line-height: 1.5;
}

.ticket-item .label {
  color: #969799;
  width: 70px;
  flex-shrink: 0;
}

.ticket-item .value {
  color: #323233;
  flex: 1;
}

.submit-button {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background-color: #fff;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
}

.file-tag {
  margin-right: 8px;
  margin-bottom: 4px;
}
</style>

