import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { 
  Field, 
  Button, 
  Form, 
  NavBar, 
  Divider, 
  Cell, 
  CellGroup,
  List, 
  Card, 
  Toast,
  PullRefresh,
  Tag,
  Empty,
  Loading,
  Uploader
} from 'vant'
import 'vant/lib/index.css'
import './style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 注册 Vant 组件
const vantComponents = [
  Field,
  Button,
  Form,
  NavBar,
  Divider,
  Cell,
  CellGroup,
  List,
  Card,
  Toast,
  PullRefresh,
  Tag,
  Empty,
  Loading,
  Uploader
]

vantComponents.forEach(component => {
  app.component(component.name, component)
})

app.mount('#app')
