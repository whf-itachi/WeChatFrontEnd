# 微信小程序前端项目

基于 Vue 3 + Vite + Vant 的微信小程序前端项目。

## 功能特性

- 用户登录/注册
- 订单提交
- 订单历史记录
- 响应式设计
- 状态管理
- 路由权限控制

## 技术栈

- Vue 3
- Vite
- Vue Router
- Pinia
- Vant UI
- Axios
- ESLint + Prettier
- Vitest

## 开发环境要求

- Node.js >= 16
- npm >= 7

## 安装和运行

1. 安装依赖：
```bash
npm install
```

2. 启动开发服务器：
```bash
npm run dev
```

3. 构建生产版本：
```bash
npm run build
```

4. 预览生产版本：
```bash
npm run preview
```

## 开发指南

### 代码规范

- 使用 ESLint 进行代码检查
- 使用 Prettier 进行代码格式化
- 遵循 Vue 3 组合式 API 风格指南

### 命令说明

- `npm run dev`: 启动开发服务器
- `npm run build`: 构建生产版本
- `npm run preview`: 预览生产版本
- `npm run lint`: 运行 ESLint 检查
- `npm run format`: 格式化代码
- `npm run test:unit`: 运行单元测试

### 项目结构

```
src/
├── api/          # API 接口
├── assets/       # 静态资源
├── components/   # 公共组件
├── router/       # 路由配置
├── stores/       # Pinia 状态管理
├── utils/        # 工具函数
└── views/        # 页面组件
```

## 环境变量

- `.env.development`: 开发环境配置
- `.env.production`: 生产环境配置

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT
