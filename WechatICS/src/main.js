import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { Field, Button, Form, NavBar, Divider, Cell, List, Card, Toast } from 'vant' // 这里引入 Vant 组件
import 'vant/lib/index.css' // 确保样式也被引入
import './style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 全局注册 Vant 组件
app.use(Field)
app.use(Button)
app.use(Form)
app.use(NavBar)
app.use(Divider)
app.use(Cell)
app.use(List)
app.use(Card)
app.use(Toast)

app.mount('#app')
