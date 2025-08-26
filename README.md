# 文件传输系统

一个基于 Node.js 和 React 的现代化文件传输系统，使用 pnpm workspace 管理的 monorepo 架构。

## 功能特性

- 🚀 Node.js + Express 服务端
- ⚛️ React + Vite 客户端
- 📁 拖拽文件上传
- 💾 本地文件存储
- 🎨 现代化用户界面
- 📦 pnpm workspace monorepo 架构

## 技术栈

- **包管理器**: pnpm (workspace)
- **服务端**: Node.js, Express, Multer
- **客户端**: React, Vite, Tailwind CSS, Lucide React
- **开发工具**: nodemon, ESLint

## 项目结构

```
file-transfer/                    # Monorepo 根目录
├── pnpm-workspace.yaml          # pnpm workspace 配置
├── .npmrc                       # pnpm 配置
├── server/                      # @file-transfer/server
│   ├── src/
│   │   └── index.js            # Express 服务器
│   ├── uploads/                # 文件存储目录
│   └── package.json
├── client/                     # @file-transfer/client
│   ├── src/
│   │   ├── components/         # React 组件
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   └── package.json
└── package.json               # 根目录配置
```

## 结构图
```mermaid
graph TD
    A["🏠 file-transfer<br/>(monorepo root)"] --> B["📦 pnpm-workspace.yaml"]
    A --> C["⚙️ .npmrc"]
    A --> D["📄 package.json<br/>(workspace scripts)"]
    
    A --> E["🖥️ server/<br/>@file-transfer/server"]
    A --> F["🌐 client/<br/>@file-transfer/client"]
    
    E --> G["📡 Express + Multer<br/>(file upload API)"]
    E --> H["📁 uploads/<br/>(file storage)"]
    
    F --> I["⚛️ React + Vite<br/>(frontend app)"]
    F --> J["🎨 Tailwind + Lucide<br/>(UI components)"]
    
    K["👤 Developer"] --> L["pnpm dev"]
    L --> M["🔄 Parallel startup"]
    M --> N["Server :3001"]
    M --> O["Client :3000"]
    
    P["📱 User"] --> Q["Drag & Drop Files"]
    Q --> R["Upload to Server"]
    R --> S["Store in uploads/"]
    
    style A fill:#e1f5fe
    style E fill:#f3e5f5
    style F fill:#e8f5e8
    style K fill:#fff3e0
    style P fill:#fce4ec
```

## 快速开始

### 前置要求
- Node.js >= 18.0.0
- pnpm >= 8.0.0

### 安装依赖
```bash
pnpm install
```

### 开发模式
同时启动服务端和客户端：
```bash
pnpm dev
```

### 单独运行
启动服务端：
```bash
pnpm dev:server
```

启动客户端：
```bash
pnpm dev:client
```

### 构建生产版本
```bash
pnpm build
```

### 其他命令
清理所有构建产物：
```bash
pnpm clean
```

运行 linting：
```bash
pnpm lint
```

## 访问地址

- 客户端：http://localhost:3000
- 服务端 API：http://localhost:3001
