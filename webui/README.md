# StreamerHelper WebUI

这是StreamerHelper的Web用户界面，提供了直观的图形化界面来管理和监控StreamerHelper的各项功能。

## 功能特点

- **系统状态监控**：实时查看系统运行状态、内存使用情况和主播在线状态
- **主播管理**：添加、编辑和删除主播信息
- **录制文件管理**：查看和删除录制的视频文件
- **配置管理**：修改系统配置、推送设置和个人信息
- **日志查看**：实时查看系统日志
- **WebSocket实时推送**：通过WebSocket实时接收主播状态变化、系统状态更新和日志信息

## 技术栈

- 前端：Vue 3 + TypeScript + Element Plus + Socket.io Client
- 后端：Node.js + Express + Socket.io

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 构建

```bash
# 构建生产版本
npm run build
```

## 项目结构

```
├── public/             # 静态资源
├── src/                # 源代码
│   ├── assets/         # 资源文件
│   ├── components/     # 组件
│   ├── router/         # 路由配置
│   ├── services/       # 服务（API、WebSocket）
│   ├── types/          # TypeScript类型定义
│   ├── views/          # 页面组件
│   ├── App.vue         # 根组件
│   └── main.ts         # 入口文件
├── index.html          # HTML模板
├── tsconfig.json       # TypeScript配置
└── vite.config.ts      # Vite配置
```

## WebSocket命名空间

- `/rooms`：主播房间状态更新
- `/logs`：日志消息
- `/system`：系统状态更新

## API接口

详细的API接口文档请参考项目根目录下的`API.md`文件。