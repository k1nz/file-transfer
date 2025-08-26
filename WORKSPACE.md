# pnpm Workspace 架构说明

本项目采用 pnpm workspace 管理的 monorepo 架构，以下是详细说明。

## Workspace 结构

```
file-transfer/
├── pnpm-workspace.yaml     # workspace 配置
├── .npmrc                  # pnpm 全局配置
├── package.json           # 根包配置
├── server/                # @file-transfer/server
│   └── package.json
└── client/                # @file-transfer/client
    └── package.json
```

## 配置文件说明

### pnpm-workspace.yaml
定义了 workspace 中包含的包：
```yaml
packages:
  - 'server'
  - 'client'
```

### .npmrc
pnpm 的配置选项：
- `shamefully-hoist=false`: 不启用幽灵依赖提升
- `strict-peer-dependencies=false`: 不严格检查 peer 依赖
- `auto-install-peers=true`: 自动安装 peer 依赖
- `prefer-workspace-packages=true`: 优先使用 workspace 内的包

## 包管理

### 安装依赖

```bash
# 为根目录安装依赖
pnpm add <package> -w

# 为特定包安装依赖
pnpm add <package> --filter server
pnpm add <package> --filter client

# 安装开发依赖
pnpm add <package> -D --filter client

# 安装所有依赖
pnpm install
```

### 脚本执行

```bash
# 在所有包中并行运行脚本
pnpm --parallel run <script>

# 在特定包中运行脚本
pnpm --filter server run <script>
pnpm --filter client run <script>

# 递归运行脚本
pnpm --recursive run <script>
```

## 常用命令

### 开发命令
```bash
# 并行启动服务端和客户端
pnpm dev

# 单独启动
pnpm dev:server
pnpm dev:client
```

### 构建命令
```bash
# 构建客户端
pnpm build

# 清理所有构建产物
pnpm clean

# 运行 lint 检查
pnpm lint
```

### 依赖管理
```bash
# 查看依赖树
pnpm list

# 查看特定包的依赖
pnpm list --filter client

# 更新依赖
pnpm update

# 检查过期依赖
pnpm outdated
```

## Workspace 优势

### 1. 统一依赖管理
- 共享依赖只会安装一次
- 避免版本冲突
- 减少 node_modules 大小

### 2. 快速安装
- pnpm 使用硬链接和符号链接
- 显著减少磁盘空间占用
- 安装速度更快

### 3. 并行执行
- 可以同时运行多个包的脚本
- 提高开发效率

### 4. 类型安全
- 包之间可以共享类型定义
- 更好的代码复用

## 最佳实践

### 1. 包命名
使用作用域命名：
- `@file-transfer/server`
- `@file-transfer/client`

### 2. 依赖分类
- **根依赖**: 开发工具、构建工具
- **包依赖**: 特定包需要的运行时依赖

### 3. 脚本组织
- 根目录提供统一的入口脚本
- 子包提供具体的实现脚本

### 4. 版本管理
- 所有包使用相同的版本号
- 共享依赖使用相同的版本

## 故障排查

### 依赖问题
```bash
# 清理 node_modules 和 lock 文件
rm -rf node_modules pnpm-lock.yaml
rm -rf */node_modules

# 重新安装
pnpm install
```

### 缓存问题
```bash
# 清理 pnpm 缓存
pnpm store prune

# 完全清理
pnpm store prune --force
```

### 符号链接问题
```bash
# 重建符号链接
pnpm install --force
```

## 与其他包管理器的对比

| 特性 | pnpm | npm | yarn |
|------|------|-----|------|
| Workspace 支持 | ✅ | ✅ | ✅ |
| 安装速度 | 🚀 快 | 🐌 慢 | 🏃 中等 |
| 磁盘占用 | 💾 小 | 📦 大 | 📦 大 |
| 幽灵依赖 | ❌ 避免 | ⚠️ 存在 | ⚠️ 存在 |
| 学习成本 | 📚 低 | 📚 低 | 📚 中等 |
