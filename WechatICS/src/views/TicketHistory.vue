<template>
  <div class="ticket-history">
    <!-- 顶部导航栏 -->
    <van-nav-bar
      title="工单历史"
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
        <van-cell-group inset v-for="ticket in ticketList" :key="ticket.id">
          <van-cell
            :title="'工单号: ' + ticket.id"
            :value="formatDate(ticket.create_at)"
            @click="goToDetail(ticket.id)"
          />
          <van-cell title="机型" :value="ticket.device_model" />
          <van-cell title="客户" :value="ticket.customer" />
          <van-cell title="故障现象" :value="ticket.fault_phenomenon" />
          <van-cell title="故障原因" :value="ticket.fault_reason" />
          <van-cell title="处理方法" :value="ticket.handling_method" />
        </van-cell-group>
      </van-list>
    </van-pull-refresh>

    <!-- 空状态 -->
    <van-empty v-if="!loading && ticketList.length === 0" description="暂无工单记录" />

    <!-- 操作区域 -->
    <div class="action-section">
      <div class="action-buttons">
        <van-button
          type="primary"
          block
          class="action-button"
          @click="goToSubmitTicket"
        >
          新建工单
        </van-button>
        <van-button
          plain
          block
          class="action-button"
          @click="onClickLeft"
        >
          返回上一页
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTicketStore } from '@/stores/ticket'
import { showToast } from 'vant'

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

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString()
}

// 跳转到提交工单页面
const goToSubmitTicket = () => {
  router.push('/submit-ticket')
}

onMounted(() => {
  getTicketList()
})
</script>

<style scoped>
.ticket-history {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding: 16px;
}

:deep(.van-cell-group) {
  margin-bottom: 12px;
}

:deep(.van-cell__value) {
  text-align: left;
}

.action-section {
  padding: 16px;
  background-color: #fff;
  border-top: 1px solid #ebedf0;
}

.action-buttons {
  display: flex;
  gap: 16px;
}

.action-button {
  flex: 1;
}
</style>

