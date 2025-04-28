import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import Vant from 'vant'
import 'vant/lib/index.css'
import './style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 注册 Vant 组件
app.use(Vant);

app.mount('#app')
