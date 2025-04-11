<template>
  <div class="login-container">
    <van-nav-bar
      title="登录"
      left-arrow
      @click-left="onClickLeft"
    />
    
    <div class="login-content">
      <van-form @submit="onSubmit">
        <van-field
          v-model="formData.name"
          name="name"
          label="用户名"
          placeholder="请输入用户名"
          :rules="[
            { required: true, message: '请输入用户名' },
            { min: 2, max: 20, message: '用户名长度在2-20个字符之间' }
          ]"
        />
        
        <van-field
          v-model="formData.password"
          type="password"
          name="password"
          label="密码"
          placeholder="请输入密码"
          :rules="[
            { required: true, message: '请输入密码' },
            { min: 6, max: 20, message: '密码长度在6-20个字符之间' }
          ]"
        />
        
        <div class="form-actions">
          <van-button 
            round 
            block 
            type="primary" 
            native-type="submit"
            :loading="loading"
          >
            登录
          </van-button>
          
          <div class="register-link">
            还没有账号？
            <router-link to="/register">立即注册</router-link>
          </div>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { showToast, showLoadingToast, closeToast } from 'vant'

const router = useRouter()
const userStore = useUserStore()

const formData = reactive({
  name: '',
  password: ''
})

const loading = ref(false)

// 监听登录状态
watch(() => userStore.isLoggedIn, (newVal) => {
  if (newVal) {
    router.push('/order-list')
  }
})

// 监听错误信息
watch(() => userStore.error, (newVal) => {
  if (newVal) {
    showToast(newVal)
  }
})

// 提交表单
const onSubmit = async (values) => {
  loading.value = true
  showLoadingToast({
    message: '登录中...',
    forbidClick: true,
  })

  try {
    const success = await userStore.loginAction(values)
    closeToast()
    if (success) {
      showToast('登录成功')
      router.push('/ticket-history')
    } else {
      showToast(userStore.error || '登录失败，请重试')
    }
  } catch (error) {
    console.error('登录失败:', error)
    showToast(error.message || '登录失败，请重试')
  } finally {
    loading.value = false
  }
}

// 返回上一页
const onClickLeft = () => {
  router.back()
}

onMounted(() => {
  // 如果已经登录，直接跳转到订单列表页面
  if (userStore.isLoggedIn) {
    router.push('/order-list')
  }
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.login-content {
  padding: 20px;
}

.form-actions {
  margin-top: 24px;
  padding: 0 16px;
}

.register-link {
  margin-top: 16px;
  text-align: center;
  color: #666;
}

.register-link a {
  color: #1989fa;
  text-decoration: none;
}

:deep(.van-field__label) {
  width: 4em;
  justify-content: flex-end;
}

:deep(.van-button--primary) {
  background-color: #1989fa;
  border-color: #1989fa;
}
</style>
