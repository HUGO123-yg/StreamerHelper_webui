#!/bin/bash

# 进入webui目录
cd "$(dirname "$0")/webui"

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
  echo "正在安装依赖..."
  npm install
fi

# 启动开发服务器
echo "正在启动WebUI开发服务器..."
npm run dev