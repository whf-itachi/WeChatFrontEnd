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
        
        <!-- 设备选择 -->
        <van-field
          v-model="formData.device_name"
          name="device_id"
          label="设备"
          placeholder="请选择故障设备"
          is-link
          readonly
          @click="showDevicePicker = true"
          :rules="[{ required: true, message: '请选择故障设备' }]"
        />

        <!-- 弹出设备选择器 -->
        <van-popup v-model:show="showDevicePicker" position="bottom">
          <van-picker
            title="选择设备"
            :columns="deviceColumns"
            @confirm="onDeviceConfirm"
            @cancel="showDevicePicker = false"
          />
        </van-popup>
        <!-- 设备详情展示（只读） -->
        <template v-if="selectedDeviceDetail && selectedDeviceDetail.id">
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

        <!-- 附件上传 -->
        <van-field
          name="attachments"
          label="附件"
        >
          <template #input>
            <van-uploader
              v-model="formData.attachments"
              :max-count="10"
              :max-size="600 * 1024 * 1024"
              :after-read="afterRead"
              :before-read="beforeRead"
              multiple
              accept="image/*,video/*"
              @delete="onDelete"
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTicketStore } from '@/stores/ticket'
import { useUserStore } from '@/stores/user'
import { showToast, showLoadingToast, closeToast } from 'vant'

const router = useRouter()
const ticketStore = useTicketStore()
const userStore = useUserStore()
const loading = ref(false)
const deviceList = ref([])
const deviceColumns = ref([{ values: [] }]) // 初始化为空
const showDevicePicker = ref(false)  // 控制弹窗
const selectedDeviceDetail = ref({})

// 表单数据
const formData = reactive({
  device_id: '',           // 设备id
  device_name: '',         // 设备名称
  fault_phenomenon: '',
  fault_reason: '',
  handling_method: '',
  handler: '',
  user_id: userStore.userId,
  attachments: []
})

// 页面加载：获取所有设备列表
onMounted(async () => {
  try {
    const res = await ticketStore.getAllDevices()    
    if (!res || !Array.isArray(res)) {
      return
    }
    deviceList.value = res
    deviceColumns.value = res.map(d => ({
      text: d.device_name,
      value: d.id
    }))
  } catch (err) {
    console.error('加载设备失败:', err)
  }
})

// 设备选择确认
const onDeviceConfirm = async ({ selectedOptions }) => {
  const option = selectedOptions[0]
  const selected = deviceList.value.find(d => d.id === option.value)
  if (!selected) {
    showToast('设备未找到')
    return
  }
  formData.device_id = selected.id
  formData.device_name = selected.device_name
  showDevicePicker.value = false
  try {
    const detailRes = await ticketStore.getDeviceDetailById(selected.id)
    selectedDeviceDetail.value = detailRes || {}
  } catch (err) {
    console.error('获取设备详情失败:', err)
    showToast('获取设备详情失败')
  }
}

const beforeRead = (file) => {
  if (Array.isArray(file)) {
    const totalFiles = formData.attachments.length + file.length
    if (totalFiles > 10) {
      showToast('最多只能上传10个文件')
      return false
    }

    let totalSize = formData.attachments.reduce((sum, item) => sum + item.file.size, 0)
    for (const item of file) {
      const isImage = item.type.startsWith('image/')
      const isVideo = item.type.startsWith('video/')
      if (!isImage && !isVideo) return false

      const maxSize = isImage ? 20 * 1024 * 1024 : 500 * 1024 * 1024
      if (item.size > maxSize) {
        showToast(`文件大小不能超过${isImage ? '20MB' : '500MB'}`)
        return false
      }
      totalSize += item.size
    }

    if (totalSize > 600 * 1024 * 1024) {
      showToast('所有文件总大小不能超过600MB')
      return false
    }
    return true
  } else {
    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')
    if (!isImage && !isVideo) {
      showToast('请上传图片或视频文件')
      return false
    }

    const maxSize = isImage ? 20 * 1024 * 1024 : 500 * 1024 * 1024
    if (file.size > maxSize) {
      showToast(`文件大小不能超过${isImage ? '20MB' : '500MB'}`)
      return false
    }

    if (formData.attachments.length >= 10) {
      showToast('最多只能上传10个文件')
      return false
    }

    const totalSize = formData.attachments.reduce((sum, item) => sum + item.file.size, 0) + file.size
    if (totalSize > 600 * 1024 * 1024) {
      showToast('所有文件总大小不能超过600MB')
      return false
    }
    return true
  }
}

const afterRead = (file) => {
  const addFile = (f) => {
    const isDuplicate = formData.attachments.some(attachment =>
      attachment.file.name === f.file.name && attachment.file.size === f.file.size
    )
    if (!isDuplicate) {
      formData.attachments.push(f)
      showToast('文件已添加')
    } else {
      showToast('该文件已存在')
    }
  }
  if (Array.isArray(file)) {
    file.forEach(addFile)
  } else {
    addFile(file)
  }
}

const onDelete = (file) => {
  const index = formData.attachments.indexOf(file)
  if (index !== -1) {
    formData.attachments.splice(index, 1)
    showToast('文件已删除')
  }
}

// 提交表单
const onSubmit = async (values) => {
  loading.value = true
  showLoadingToast({
    message: '提交中...',
    forbidClick: true,
  })

  try {
    const submitData = new FormData()
    submitData.append('device_id', formData.device_id)
    submitData.append('fault_phenomenon', values.fault_phenomenon)
    submitData.append('fault_reason', values.fault_reason || '')
    submitData.append('handling_method', values.handling_method || '')
    submitData.append('handler', values.handler || '')
    submitData.append('user_id', userStore.userId)

    if (formData.attachments.length > 0) {
      formData.attachments.forEach((file) => {
        submitData.append('attachments', file.file)
      })
    }

    await ticketStore.submitTicketAction(submitData)
    closeToast()
    showToast('提交成功')
    setTimeout(() => {
      router.push('/ticket-history')
    }, 1500)
  } catch (error) {
    console.error('提交失败:', error)
    showToast(error.message || '提交失败，请重试')
  } finally {
    loading.value = false
  }
}

// 返回
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
  width: 5em;
  justify-content: flex-end;
}
</style>