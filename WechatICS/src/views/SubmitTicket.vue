<template>
  <div class="submit-ticket">
    <!-- 顶部导航栏 -->
    <van-nav-bar
      title="提交工单"
      left-arrow
      @click-left="onClickLeft"
    />

    <!-- 表单区域 -->
    <div class="form-section">
      <van-form @submit="onSubmit">
        <!-- 机型 -->
        <van-field
          v-model="formData.device_model"
          name="device_model"
          label="机型"
          placeholder="请输入机型"
          :rules="[{ required: true, message: '请输入机型' }]"
        />

        <!-- 客户 -->
        <van-field
          v-model="formData.customer"
          name="customer"
          label="客户"
          placeholder="请输入客户名称"
          :rules="[{ required: true, message: '请输入客户名称' }]"
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
        />

        <!-- 处理人 -->
        <van-field
          v-model="formData.handler"
          name="handler"
          label="处理人"
          placeholder="请输入处理人"
          :rules="[{ required: true, message: '请输入处理人' }]"
        />

        <!-- 提交按钮 -->
        <div class="submit-button">
          <van-button
            round
            block
            type="primary"
            native-type="submit"
            :loading="loading"
          >
            提交工单
          </van-button>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useTicketStore } from '@/stores/ticket'
import { useUserStore } from '@/stores/user'
import { showToast, showLoadingToast, closeToast } from 'vant'

const router = useRouter()
const ticketStore = useTicketStore()
const userStore = useUserStore()
const loading = ref(false)

// 表单数据
const formData = reactive({
  device_model: '',
  customer: '',
  fault_phenomenon: '',
  fault_reason: '',
  handling_method: '',
  handler: '',
  user_id: userStore.userId
})

// 提交表单
const onSubmit = async (values) => {
  loading.value = true
  showLoadingToast({
    message: '提交中...',
    forbidClick: true,
  })

  try {
    const result = await ticketStore.submitTicketAction({
      ...values,
      user_id: userStore.userId
    })
    closeToast()
    showToast('提交成功')
    setTimeout(() => {
      router.push('/ticket-history')
    }, 1500)
  } catch (error) {
    console.error('提交工单失败:', error)
    showToast('提交失败，请重试')
  } finally {
    loading.value = false
  }
}

// 返回上一页
const onClickLeft = () => {
  router.back()
}
</script>

<style scoped>
.submit-ticket {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.form-section {
  padding: 16px;
}

.submit-button {
  margin-top: 24px;
  padding: 0 16px;
}

:deep(.van-field__label) {
  width: 4em;
  justify-content: flex-end;
}
</style>
