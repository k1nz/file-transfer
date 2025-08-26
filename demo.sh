#!/bin/bash

echo "🚀 文件传输系统 - pnpm workspace 演示"
echo "=================================="

echo ""
echo "📦 检查 workspace 配置..."
cat pnpm-workspace.yaml

echo ""
echo "📋 显示所有 workspace 包："
pnpm list --depth=0 --recursive

echo ""
echo "🔧 安装所有依赖..."
pnpm install

echo ""
echo "✅ 准备启动开发环境！"
echo ""
echo "运行以下命令启动项目："
echo "  pnpm dev              # 同时启动服务端和客户端"
echo "  pnpm dev:server       # 仅启动服务端"
echo "  pnpm dev:client       # 仅启动客户端"
echo ""
echo "访问地址："
echo "  客户端: http://localhost:3000"
echo "  服务端: http://localhost:3001"
