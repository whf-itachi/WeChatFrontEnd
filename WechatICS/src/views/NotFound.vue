<template>
  <div class="not-found">
    <van-empty
      description="页面不存在"
      image="error"
    >
      <van-button round type="primary" @click="goBack">
        返回上一页
      </van-button>
    </van-empty>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f7f8fa;
}
</style>
