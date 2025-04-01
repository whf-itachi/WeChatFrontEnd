<template>
  <router-view />
</template>

<script setup>
</script>

<style>
:root {
  --van-primary-color: #1989fa;
  --van-success-color: #07c160;
  --van-danger-color: #ee0a24;
  --van-warning-color: #ff976a;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f5f5f5;
}

#app {
  width: 100%;
  height: 100vh;
}
</style>
