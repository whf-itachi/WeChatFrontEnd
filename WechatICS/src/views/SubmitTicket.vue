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

        <!-- 客户 -->
        <van-field
          v-model="formData.address"
          name="address"
          label="地址"
          placeholder="请输入故障设备地址(非必填)"
          :rules="[{ required: false, message: '请输入故障设备地址(非必填)' }]"
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
  address: '',
  fault_phenomenon: '',
  fault_reason: '',
  handling_method: '',
  handler: '',
  user_id: userStore.userId,
  attachments: [] // 添加附件数组
})

// 上传前校验
const beforeRead = (file) => {
  // 处理多文件选择的情况
  if (Array.isArray(file)) {
    // 检查总文件数量
    if (formData.attachments.length + file.length > 10) {
      showToast('最多只能上传10个文件')
      return false
    }

    // 检查每个文件
    for (const item of file) {
      const isImage = item.type.startsWith('image/')
      const isVideo = item.type.startsWith('video/')
      
      if (!isImage && !isVideo) {
        showToast('请上传图片或视频文件')
        return false
      }
      
      // 检查文件大小
      const maxSize = isImage ? 20 * 1024 * 1024 : 500 * 1024 * 1024
      if (item.size > maxSize) {
        showToast(`文件大小不能超过${isImage ? '20MB' : '500MB'}`)
        return false
      }
    }

    // 检查总文件大小
    const currentTotalSize = formData.attachments.reduce((sum, item) => sum + item.file.size, 0)
    const newTotalSize = file.reduce((sum, item) => sum + item.size, 0)
    if (currentTotalSize + newTotalSize > 600 * 1024 * 1024) {
      showToast('所有文件总大小不能超过600MB')
      return false
    }

    return true
  } else {
    // 处理单个文件的情况
    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')
    
    if (!isImage && !isVideo) {
      showToast('请上传图片或视频文件')
      return false
    }
    
    // 检查文件大小
    const maxSize = isImage ? 20 * 1024 * 1024 : 500 * 1024 * 1024
    if (file.size > maxSize) {
      showToast(`文件大小不能超过${isImage ? '20MB' : '500MB'}`)
      return false
    }
    
    // 检查总文件数量
    if (formData.attachments.length >= 10) {
      showToast('最多只能上传10个文件')
      return false
    }
    
    // 检查总文件大小
    const totalSize = formData.attachments.reduce((sum, item) => sum + item.file.size, 0) + file.size
    if (totalSize > 600 * 1024 * 1024) {
      showToast('所有文件总大小不能超过600MB')
      return false
    }
    
    return true
  }
}

// 上传后处理
const afterRead = (file) => {
  // 处理多文件选择的情况
  if (Array.isArray(file)) {
    file.forEach(item => {
      // 检查文件是否已存在
      const isDuplicate = formData.attachments.some(attachment => 
        attachment.file.name === item.file.name && 
        attachment.file.size === item.file.size
      )
      
      if (!isDuplicate) {
        formData.attachments.push(item)
      }
    })
    showToast('文件已添加')
  } else {
    // 处理单个文件的情况
    const isDuplicate = formData.attachments.some(item => 
      item.file.name === file.file.name && 
      item.file.size === file.file.size
    )
    
    if (isDuplicate) {
      showToast('该文件已存在')
      return
    }
    
    showToast('文件已添加')
  }
}

// 删除文件
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
    // 创建FormData对象
    const submitData = new FormData()
    
    // 添加基本字段
    submitData.append('device_model', values.device_model)
    submitData.append('customer', values.customer)
    submitData.append('address', values.address)
    submitData.append('fault_phenomenon', values.fault_phenomenon)
    submitData.append('fault_reason', values.fault_reason || '')
    submitData.append('handling_method', values.handling_method || '')
    submitData.append('handler', values.handler || '')
    submitData.append('user_id', userStore.userId)
    
    // 添加附件
    if (formData.attachments && formData.attachments.length > 0) {
      formData.attachments.forEach((file) => {
        submitData.append('attachments', file.file)
      })
    }

    console.log('提交数据:', {
      device_model: values.device_model,
      customer: values.customer,
      address: values.address,
      fault_phenomenon: values.fault_phenomenon,
      user_id: userStore.userId,
      attachments_count: formData.attachments?.length || 0
    })

    // 提交工单
    const result = await ticketStore.submitTicketAction(submitData)
    console.log('提交结果:', result)
    
    closeToast()
    showToast('提交成功')
    setTimeout(() => {
      router.push('/ticket-history')
    }, 1500)
  } catch (error) {
    console.error('提交工单失败:', error)
    showToast(error.message || '提交失败，请重试')
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
