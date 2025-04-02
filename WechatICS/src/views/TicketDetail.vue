<template>
  <div class="ticket-detail">
    <!-- 顶部导航栏 -->
    <van-nav-bar
      :title="isEditing ? '编辑工单' : '工单详情'"
      left-arrow
      @click-left="onClickLeft"
    />

    <!-- 工单内容 -->
    <div class="detail-content">
      <van-form @submit="onSubmit" v-if="ticket">
        <!-- 工单基本信息 -->
        <van-cell-group inset class="info-group">
          <van-cell title="工单号" :value="ticket.id" />
          <van-cell title="提交时间" :value="formatDate(ticket.create_at)" />
        </van-cell-group>

        <!-- 工单表单 -->
        <van-cell-group inset class="form-group">
          <!-- 机型 -->
          <van-field
            v-model="formData.device_model"
            name="device_model"
            label="机型"
            placeholder="请输入机型"
            :rules="[{ required: true, message: '请输入机型' }]"
            :readonly="!isEditing"
          />

          <!-- 客户 -->
          <van-field
            v-model="formData.customer"
            name="customer"
            label="客户"
            placeholder="请输入客户名称"
            :rules="[{ required: true, message: '请输入客户名称' }]"
            :readonly="!isEditing"
          />

          <!-- 故障现象 -->
          <van-field
            v-model="formData.fault_phenomenon"
            name="fault_phenomenon"
            label="故障现象"
            type="textarea"
            rows="3"
            placeholder="请描述故障现象"
            :rules="[{ required: true, message: '请输入故障现象' }]"
            :readonly="!isEditing"
          />

          <!-- 故障原因 -->
          <van-field
            v-model="formData.fault_reason"
            name="fault_reason"
            label="故障原因"
            type="textarea"
            rows="3"
            placeholder="请描述故障原因"
            :rules="[{ required: true, message: '请输入故障原因' }]"
            :readonly="!isEditing"
          />

          <!-- 处理方法 -->
          <van-field
            v-model="formData.handling_method"
            name="handling_method"
            label="处理方法"
            type="textarea"
            rows="3"
            placeholder="请描述处理方法"
            :rules="[{ required: true, message: '请输入处理方法' }]"
            :readonly="!isEditing"
          />
        </van-cell-group>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <template v-if="isEditing">
            <van-button
              round
              block
              type="primary"
              native-type="submit"
              :loading="loading"
            >
              保存修改
            </van-button>
            <van-button
              round
              block
              plain
              type="default"
              @click="cancelEdit"
            >
              取消编辑
            </van-button>
          </template>
          <template v-else>
            <van-button
              round
              block
              type="primary"
              @click="startEdit"
            >
              编辑工单
            </van-button>
          </template>
        </div>
      </van-form>

      <!-- 加载状态 -->
      <div v-else-if="loading" class="loading-state">
        <van-loading type="spinner" color="#1989fa" />
      </div>

      <!-- 错误状态 -->
      <div v-else class="error-state">
        <van-empty description="获取工单详情失败" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTicketStore } from '@/stores/ticket'
import { showToast, showLoadingToast, closeToast } from 'vant'

const router = useRouter()
const route = useRoute()
const ticketStore = useTicketStore()
const ticket = ref(null)
const loading = ref(false)
const isEditing = ref(false)

// 表单数据
const formData = reactive({
  device_model: '',
  customer: '',
  fault_phenomenon: '',
  fault_reason: '',
  handling_method: ''
})

// 获取工单详情
const getTicketDetail = async () => {
  loading.value = true
  try {
    const result = await ticketStore.getTicketDetailAction(route.params.id)
    ticket.value = result
    // 初始化表单数据
    Object.assign(formData, result)
  } catch (error) {
    console.error('获取工单详情失败:', error)
    showToast('获取工单详情失败')
  } finally {
    loading.value = false
  }
}

// 开始编辑
const startEdit = () => {
  isEditing.value = true
}

// 取消编辑
const cancelEdit = () => {
  isEditing.value = false
  // 恢复原始数据
  Object.assign(formData, ticket.value)
}

// 提交表单
const onSubmit = async (values) => {
  loading.value = true
  showLoadingToast({
    message: '保存中...',
    forbidClick: true,
  })

  try {
    await ticketStore.updateTicketAction({
      id: ticket.value.id,
      ...values
    })
    closeToast()
    showToast('保存成功')
    isEditing.value = false
    // 重新获取工单详情
    await getTicketDetail()
  } catch (error) {
    console.error('保存工单失败:', error)
    showToast('保存失败，请重试')
  } finally {
    loading.value = false
  }
}

// 返回上一页
const onClickLeft = () => {
  if (isEditing.value) {
    showToast('请先保存或取消编辑')
    return
  }
  router.back()
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString()
}

onMounted(() => {
  getTicketDetail()
})
</script>

<style scoped>
.ticket-detail {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 80px;
}

.detail-content {
  padding: 16px;
}

.info-group,
.form-group {
  margin-bottom: 16px;
}

.action-buttons {
  margin-top: 24px;
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.loading-state,
.error-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

:deep(.van-field__label) {
  width: 4em;
  justify-content: flex-end;
}

:deep(.van-field__control--readonly) {
  color: #323233;
}
</style> 