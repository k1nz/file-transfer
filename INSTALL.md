# 安装指南

## 前置要求

确保你的系统已安装：
- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0

### 安装 pnpm
如果你还没有安装 pnpm，可以通过以下方式安装：

```bash
# 使用 npm 安装
npm install -g pnpm

# 或使用 Homebrew (macOS)
brew install pnpm

# 或使用官方安装脚本
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

## 快速安装

### 1. 克隆项目并安装依赖
```bash
# 进入项目目录
cd file-transfer

# 安装所有 workspace 依赖
pnpm install
```

这个命令会自动安装根目录、服务端和客户端的所有依赖。

## 启动项目

### 方式一：同时启动服务端和客户端（推荐）
```bash
pnpm dev
```

### 方式二：分别启动
启动服务端：
```bash
pnpm dev:server
```

启动客户端：
```bash
pnpm dev:client
```

## 访问地址

- **客户端界面**：http://localhost:3000
- **服务端 API**：http://localhost:3001

## 功能测试

1. 打开浏览器访问 http://localhost:3000
2. 拖拽文件到上传区域或点击"选择文件"按钮
3. 点击"开始上传"上传文件
4. 在右侧查看已上传的文件列表
5. 可以下载或删除文件

## 其他命令

### 构建生产版本
```bash
pnpm build
```

### 清理构建产物
```bash
pnpm clean
```

### 运行代码检查
```bash
pnpm lint
```

### 预览构建结果
```bash
pnpm --filter client preview
```

## pnpm workspace 优势

- **统一依赖管理**：所有子包的依赖统一管理，避免重复安装
- **快速安装**：pnpm 的符号链接机制显著提升安装速度
- **并行执行**：可以并行运行多个包的脚本
- **版本一致性**：确保所有包使用相同版本的公共依赖

## 注意事项

- 默认文件大小限制为 100MB
- 上传的文件存储在 `server/uploads/` 目录中
- 支持多文件同时上传
- 客户端会通过 Vite 代理将 API 请求转发到服务端
- 推荐使用 pnpm 而不是 npm 或 yarn 来管理此项目
