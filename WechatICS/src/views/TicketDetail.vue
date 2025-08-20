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
          <van-field
            :model-value="ticketId"
            name="id"
            label="工单号"
            readonly
          />
          <van-field
            :model-value="createTime"
            name="create_at"
            label="提交时间"
            readonly
          />
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
            readonly 
          />

          <!-- 客户 -->
          <van-field
            v-model="formData.customer"
            name="customer"
            label="客户"
            placeholder="请输入客户名称"
            :rules="[{ required: true, message: '请输入客户名称' }]"
            readonly
          />

          <van-field
            v-model="formData.address"
            name="address"
            label="故障地址"
            placeholder="请输入故障地址(非必填)"
            :rules="[{ required: false, message: '请输入故障地址(非必填)' }]"
            :readonly="!isEditing" 
            v-if="isEditing || formData.address"
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

          <!-- 处理人 -->
          <van-field
            v-model="formData.handler"
            name="handler"
            label="处理人"
            placeholder="请输入处理人"
            :rules="[{ required: true, message: '请输入处理人' }]"
            :readonly="!isEditing"
          />

          <!-- 附件显示 -->
          <van-field
            v-if="ticket.attachments && ticket.attachments.length > 0"
            name="attachments"
            label="附件"
            :readonly="!isEditing"
          >
            <template #input>
              <div class="attachments-list">
                <div v-for="file in ticket.attachments" :key="file.id" class="attachment-item">
                  <van-tag
                    type="primary"
                    plain
                    class="file-tag"
                    @click="previewFile(file)"
                  >
                    {{ file.file_name }}
                  </van-tag>
                  <van-icon
                    v-if="isEditing"
                    name="clear"
                    class="delete-icon"
                    @click.stop="deleteExistingAttachment(file)"
                  />
                </div>
              </div>
            </template>
          </van-field>

          <!-- 附件上传（编辑模式） -->
          <van-field
            v-if="isEditing"
            name="newAttachments"
            label="新增附件"
          >
            <template #input>
              <div class="upload-section">
                <van-uploader
                  v-model="newAttachments"
                  :max-count="10"
                  :max-size="600 * 1024 * 1024"
                  :after-read="afterRead"
                  :before-read="beforeRead"
                  multiple
                  accept="image/*,video/*"
                  @delete="onDelete"
                />
              </div>
            </template>
          </van-field>
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
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTicketStore } from '@/stores/ticket'
import { showToast, showLoadingToast, closeToast } from 'vant'

const router = useRouter()
const route = useRoute()
const ticketStore = useTicketStore()
const ticket = ref(null)
const loading = ref(false)
const isEditing = ref(false)
const isReuploading = ref(false)
const newAttachments = ref([])
const deleteList = ref([])

// 表单数据
const formData = reactive({
  device_model: '',
  customer: '',
  address: '',
  fault_phenomenon: '',
  fault_reason: '',
  handling_method: '',
  handler: ''
})

// 计算属性
const ticketId = computed(() => ticket.value?.id || '')
const createTime = computed(() => formatDate(ticket.value?.create_at))

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
  // 初始化新附件数组
  newAttachments.value = []
}

// 上传前校验
const beforeRead = (file) => {
  // 处理多文件选择的情况
  if (Array.isArray(file)) {
    // 检查总文件数量
    if (newAttachments.value.length + file.length > 10) {
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
    const currentTotalSize = newAttachments.value.reduce((sum, item) => sum + item.file.size, 0)
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
    if (newAttachments.value.length >= 10) {
      showToast('最多只能上传10个文件')
      return false
    }
    
    // 检查总文件大小
    const totalSize = newAttachments.value.reduce((sum, item) => sum + item.file.size, 0) + file.size
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
      const isDuplicate = newAttachments.value.some(attachment => 
        attachment.file.name === item.file.name && 
        attachment.file.size === item.file.size
      )
      
      if (!isDuplicate) {
        newAttachments.value.push(item)
      }
    })
    showToast('文件已添加')
  } else {
    // 处理单个文件的情况
    const isDuplicate = newAttachments.value.some(item => 
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
  const index = newAttachments.value.indexOf(file)
  if (index !== -1) {
    newAttachments.value.splice(index, 1)
    showToast('文件已删除')
  }
}

// 删除原有附件
const deleteExistingAttachment = (file) => {
  const index = ticket.value.attachments.findIndex(item => item.id === file.id)
  if (index !== -1) {
    // 将删除的附件ID添加到删除列表
    deleteList.value.push(file.id)
    // 从显示列表中移除
    ticket.value.attachments.splice(index, 1)
    showToast('附件已删除')
  }
}

// 提交表单
const onSubmit = async (values) => {
  loading.value = true
  showLoadingToast({
    message: '保存中...',
    forbidClick: true,
  })

  try {
    if (!ticket.value || !ticket.value.id) {
      showToast('工单信息不完整')
      return
    }

    // 创建FormData对象
    const submitData = new FormData()
    
    // 添加基本字段
    submitData.append('id', ticket.value.id)
    submitData.append('device_id', ticket.value.device_id)
    submitData.append('device_model', values.device_model)
    submitData.append('customer', values.customer)
    submitData.append('address', values.address)
    submitData.append('fault_phenomenon', values.fault_phenomenon)
    submitData.append('fault_reason', values.fault_reason || '')
    submitData.append('handling_method', values.handling_method || '')
    submitData.append('handler', values.handler || '')
    
    // 添加需要删除的附件ID列表
    if (deleteList.value.length > 0) {
      // 将删除列表转换为JSON字符串
      submitData.append('delete_list', JSON.stringify(deleteList.value))
    }
    
    // 添加新附件
    if (newAttachments.value.length > 0) {
      newAttachments.value.forEach((file) => {
        submitData.append('attachments', file.file)
      })
    }

    await ticketStore.updateTicketAction(submitData)
    closeToast()
    showToast('保存成功')
    isEditing.value = false
    // 清空删除列表
    deleteList.value = []
    // 重新获取工单详情
    await getTicketDetail()
  } catch (error) {
    console.error('保存工单失败:', error)
    showToast('保存失败，请重试')
  } finally {
    loading.value = false
  }
}

// 取消编辑
const cancelEdit = () => {
  isEditing.value = false
  isReuploading.value = false
  // 恢复原始数据
  Object.assign(formData, ticket.value)
  newAttachments.value = []
  // 清空删除列表
  deleteList.value = []
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

// 预览文件
const previewFile = (file) => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'; // Vite 使用方式

  const previewUrl = `${apiBaseUrl}/tickets/attachment/${file.id}/preview`;
  window.open(previewUrl, '_blank');
};

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

.attachments-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
  position: relative;
}

.delete-icon {
  color: #ee0a24;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
}

.file-tag {
  cursor: pointer;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-right: 24px;
}

.upload-section {
  width: 100%;
}

.reupload-tip {
  color: #ff976a;
  font-size: 12px;
  margin-top: 8px;
}
</style> 