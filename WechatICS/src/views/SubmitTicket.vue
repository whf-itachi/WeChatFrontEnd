<!-- views/SubmitTicket.vue -->
<template>
  <div class="submit-ticket">
    <!-- 顶部导航 -->
    <van-nav-bar
      title="提交工单"
      left-arrow
      @click-left="onClickLeft"
    />

    <!-- 表单 -->
    <div class="form-section">
      <van-form @submit="onSubmit">

        <!-- 使用组件 -->
        <DeviceSelector @select="onDeviceSelect" />

        <!-- 显示设备详情 -->
        <template v-if="selectedDeviceDetail.id">
          <van-field label="设备型号" :model-value="selectedDeviceDetail.device_model" readonly />
          <van-field label="客户" :model-value="selectedDeviceDetail.customer_name" readonly />
          <van-field label="地址" :model-value="selectedDeviceDetail.address" readonly />
        </template>

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

        <!-- 附件上传（修复版：只用 v-model） -->
        <van-field name="attachments" label="附件">
          <template #input>
            <van-uploader
              v-model="formData.attachments"
              :max-count="10"
              :max-size="600 * 1024 * 1024"
              :before-read="beforeRead"
              multiple
              accept="image/*,video/*"
              upload-text="上传图片或视频"
            />
          </template>
        </van-field>

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

    <van-overlay :show="loading" />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useTicketStore } from '@/stores/ticket'
import { useUserStore } from '@/stores/user'
import { showToast, showLoadingToast, closeToast } from 'vant'
import DeviceSelector from '@/components/DeviceSelector.vue'
// 注意：不再需要 afterRead / onDelete / beforeRead 返回 Promise 可保留

const router = useRouter()
const ticketStore = useTicketStore()
const userStore = useUserStore()

const loading = ref(false)
const selectedDeviceDetail = ref({})

// 表单数据
const formData = reactive({
  device_id: '',
  device_name: '',
  fault_phenomenon: '',
  fault_reason: '',
  handling_method: '',
  handler: '',
  user_id: userStore.userId,
  attachments: [] // van-uploader 会自动管理这个数组
})

// ========== 设备选择回调 ==========
const onDeviceSelect = async (device) => {
  formData.device_id = device.id
  formData.device_name = device.device_name

  try {
    const detail = await ticketStore.getDeviceDetailById(device.id)
    selectedDeviceDetail.value = {
      ...detail,
      device_model: device.device_model
    }
  } catch (err) {
    console.error('获取设备详情失败:', err)
    showToast('获取设备详情失败')
  }
}

// ========== 文件校验（可选）==========
const beforeRead = (file) => {
  // 可添加大小、类型校验
  const isLt600M = file.size <= 600 * 1024 * 1024
  if (!isLt600M) {
    showToast('文件大小不能超过 600MB')
    return false
  }
  return true // 返回 true 才继续上传
}

// ========== 提交表单 ==========
const onSubmit = async () => {
  if (!formData.device_id) {
    showToast('请先选择设备')
    return
  }

  loading.value = true
  showLoadingToast({ message: '提交中...', forbidClick: true })

  try {
    const submitData = new FormData()
    Object.keys(formData).forEach(key => {
      if (key === 'attachments') {
        formData.attachments.forEach(item => {
          // 注意：item 是 van-uploader 的 file 对象，item.file 是原生 File
          if (item.file) {
            submitData.append('attachments', item.file)
          }
        })
      } else {
        submitData.append(key, formData[key])
      }
    })

    await ticketStore.submitTicketAction(submitData)
    closeToast()
    showToast({ message: '提交成功！', type: 'success' })
    setTimeout(() => router.push('/ticket-history'), 1000)
  } catch (error) {
    closeToast()
    showToast({ message: '提交失败', type: 'fail' })
  } finally {
    loading.value = false
  }
}

// 返回提示
const onClickLeft = () => {
  if (isFormDirty()) {
    // 注意：Dialog 需要引入
    import('vant').then(({ Dialog }) => {
      Dialog.confirm({
        title: '确认离开？',
        message: '您填写的内容尚未提交，确认离开吗？',
        confirmButtonColor: '#ee0a24'
      }).then(() => router.back())
    })
  } else {
    router.back()
  }
}

const isFormDirty = () => {
  return Object.values(formData).some(v =>
    (typeof v === 'string' && v.trim()) ||
    (Array.isArray(v) && v.length > 0)
  )
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
</style>