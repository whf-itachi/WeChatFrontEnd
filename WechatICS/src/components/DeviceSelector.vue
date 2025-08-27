<!-- components/DeviceSelector.vue -->
<template>
  <div class="device-selector">
    <!-- 触发选择的输入框 -->
    <van-field
      v-model="displayValue"
      label="设备"
      placeholder="请选择故障设备"
      is-link
      readonly
      @click="showPopup = true"
    />

    <!-- 弹窗：左右分栏 -->
    <van-popup
      v-model:show="showPopup"
      position="bottom"
      round
      closeable
      close-icon="close"
      :style="{ height: '70vh' }"
      @close="onClose"
    >
      <div class="selector-layout">
        <!-- 左侧：型号列表 -->
        <div class="model-sidebar">
          <van-cell-group>
            <van-cell
              v-for="(model, index) in models"
              :key="model.device_model"
              :title="model.device_model"
              clickable
              :class="{ active: activeModelIndex === index }"
              @click="handleModelClick(index)"
            />
          </van-cell-group>
        </div>

        <!-- 右侧：设备列表 -->
        <div class="device-panel">
          <!-- 搜索框 -->
          <van-search
            v-model="searchKeyword"
            placeholder="搜索设备名称"
            shape="round"
            clearable
            @clear="searchKeyword = ''"
            style="padding: 8px 16px"
          />

          <!-- 设备列表 -->
          <van-cell-group inset>
            <van-empty v-if="filteredDevices.length === 0" description="暂无设备" />

            <van-cell
              v-for="device in filteredDevices"
              :key="device.id"
              :title="device.device_name"
              clickable
              @click="onDeviceSelect(device)"
              class="device-item"
            />
          </van-cell-group>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { showToast } from 'vant'
import { useTicketStore } from '@/stores/ticket'

// 定义 emits
const emit = defineEmits(['select'])

// 状态
const showPopup = ref(false)
const models = ref([]) // 扁平数组：[{ device_model, devices: [...] }]
const activeModelIndex = ref(0)
const searchKeyword = ref('')

// 当前选中设备（用于显示）
const selectedDevice = ref(null)

// 显示值
const displayValue = computed(() => selectedDevice.value?.device_name || '')

// 当前激活型号的设备列表
const currentDevices = computed(() => {
  const model = models.value[activeModelIndex.value]
  return model?.devices || []
})

// 过滤后的设备（支持搜索）
const filteredDevices = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  if (!keyword) return currentDevices.value

  return currentDevices.value.filter(d =>
    d.device_name.toLowerCase().includes(keyword)
  )
})

// ===== 生命周期 =====
onMounted(async () => {
  try {
    const res = await useTicketStore().getAllModelsDevices()
    if (Array.isArray(res) && res.length > 0) {
      models.value = res
      // 默认选中第一个型号
      activeModelIndex.value = 0
    } else {
      showToast('暂无设备数据')
    }
  } catch (err) {
    console.error('加载设备失败:', err)
    showToast('加载设备列表失败')
  }
})

// ===== 事件处理 =====
const handleModelClick = (index) => {
  activeModelIndex.value = index
  searchKeyword.value = '' // 切换型号时清空搜索
}

const onDeviceSelect = (device) => {
  const model = models.value[activeModelIndex.value]
  selectedDevice.value = {
    id: device.id,
    device_name: device.device_name,
    device_model: model.device_model
  }

  // 发送选择事件
  emit('select', selectedDevice.value)
  showPopup.value = false
}

const onClose = () => {
  // 可选：重置状态
  // searchKeyword.value = ''
}
</script>

<style scoped>
.device-selector {
  background-color: #fff;
}

.selector-layout {
  height: 100%;
  display: flex;
  overflow: hidden;
}

/* 左侧型号栏 */
.model-sidebar {
  width: 30%;
  max-width: 120px;
  background-color: #f7f8fa;
  overflow-y: auto;
  border-right: 1px solid #e8e8e8;
  -webkit-overflow-scrolling: touch;
}

:deep(.model-sidebar .van-cell) {
  padding: 14px 12px;
  font-size: 14px;
  line-height: 1.4;
}

/* 选中样式 */
.model-sidebar :deep(.van-cell.active) {
  background-color: #1989fa;
  color: white;
  font-weight: 500;
}

.model-sidebar :deep(.van-cell.active .van-cell__title) {
  color: white;
}

/* 右侧设备面板 */
.device-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.device-item {
  padding: 14px 16px;
}

:deep(.device-item .van-cell__title) {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

/* 空状态居中 */
:deep(.van-empty) {
  margin: 20px auto;
}
</style>