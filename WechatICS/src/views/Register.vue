<template>
  <div class="register-container">
    <van-nav-bar
      title="注册"
      left-arrow
      @click-left="onClickLeft"
    />
    
    <div class="register-content">
      <van-form @submit="onSubmit">
        <van-field
          v-model="formData.name"
          name="name"
          label="姓名"
          placeholder="请输入姓名"
          :rules="[
            { required: true, message: '请输入姓名' },
            { min: 2, max: 20, message: '姓名长度在2-20个字符之间' }
          ]"
        />
        
        <van-field
          v-model="formData.phone"
          name="phone"
          label="手机号"
          placeholder="请输入手机号"
          :rules="[
            { required: true, message: '请输入手机号' },
            { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
          ]"
        />
        
        <van-field
          v-model="formData.email"
          name="email"
          label="邮箱"
          placeholder="请输入邮箱"
          :rules="[
            { required: true, message: '请输入邮箱' },
            { pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: '请输入正确的邮箱地址' }
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
        
        <van-field
          v-model="formData.confirmPassword"
          type="password"
          name="confirmPassword"
          label="确认密码"
          placeholder="请再次输入密码"
          :rules="[
            { required: true, message: '请确认密码' },
            { validator: validateConfirmPassword, message: '两次输入的密码不一致' }
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
            注册
          </van-button>
          
          <div class="login-link">
            已有账号？
            <router-link to="/login">立即登录</router-link>
          </div>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { showToast, showLoadingToast, closeToast } from 'vant'

const router = useRouter()
const userStore = useUserStore()

const formData = reactive({
  name: '',
  phone: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)

// 监听注册状态
watch(() => userStore.isLoggedIn, (newVal) => {
  if (newVal) {
    router.push('/')
  }
})

// 监听错误信息
watch(() => userStore.error, (newVal) => {
  if (newVal) {
    showToast(newVal)
  }
})

// 验证确认密码
const validateConfirmPassword = (val) => {
  return val === formData.password
}

// 提交表单
const onSubmit = async (values) => {
  loading.value = true
  showLoadingToast({
    message: '注册中...',
    forbidClick: true,
  })

  try {
    const success = await userStore.registerAction(values)
    closeToast()
    if (success) {
      userStore.clearError()
      showToast('注册成功，请登录')
      router.push('/login')
    } else {
      showToast(userStore.error || '注册失败请重试')
    }
  } catch (error) {
    showToast(error.message || '注册失败请重试')
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
.register-container {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.register-content {
  padding: 20px;
}

.form-actions {
  margin-top: 24px;
  padding: 0 16px;
}

.login-link {
  margin-top: 16px;
  text-align: center;
  color: #666;
}

.login-link a {
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
