# StreamerHelper WebUI 扩展

这是StreamerHelper的Web用户界面扩展，为StreamerHelper提供了直观的图形化界面，方便用户管理和监控直播录制系统。

## 功能特点

- **系统状态监控**：实时查看系统运行状态、内存使用情况和主播在线状态
- **主播管理**：添加、编辑和删除主播信息
- **录制文件管理**：查看和删除录制的视频文件
- **配置管理**：修改系统配置、推送设置和个人信息
- **日志查看**：实时查看系统日志
- **WebSocket实时推送**：通过WebSocket实时接收主播状态变化、系统状态更新和日志信息

## 技术栈

- 前端：Vue 3 + TypeScript + Element Plus + Socket.io Client + Vite
- 后端：Node.js + Express + Socket.io

## 项目结构

```
├── src/                # 后端源代码修改
│   ├── engine/         # 核心引擎
│   ├── http/           # HTTP和WebSocket服务
│   ├── log/            # 日志系统
│   ├── schedule/       # 定时任务
│   └── ...             # 其他后端模块
├── webui/              # 前端源代码
│   ├── src/            # 前端源代码
│   │   ├── assets/     # 资源文件
│   │   ├── components/ # 组件
│   │   ├── router/     # 路由配置
│   │   ├── services/   # 服务（API、WebSocket）
│   │   ├── types/      # TypeScript类型定义
│   │   ├── views/      # 页面组件
│   │   ├── App.vue     # 根组件
│   │   └── main.ts     # 入口文件
│   ├── public/         # 静态资源
│   ├── index.html      # HTML模板
│   ├── tsconfig.json   # TypeScript配置
│   └── vite.config.ts  # Vite配置
├── API.md              # API接口文档
├── start-webui.sh      # 前端启动脚本
└── README-webui.md     # WebUI说明文档
```

## 快速开始

### 启动前端开发服务器

```bash
# 使用启动脚本（推荐）
./start-webui.sh

# 或者手动启动
cd webui
npm install
npm run dev
```

### 启动后端服务器

确保已安装所有依赖后，启动后端服务器：

```bash
node src/index.js
```

## WebSocket命名空间

- `/rooms`：主播房间状态更新
- `/logs`：日志消息
- `/system`：系统状态更新

## API接口

详细的API接口文档请参考项目根目录下的`API.md`文件。

## 安装与集成

1. 将WebUI代码克隆到StreamerHelper项目目录中
2. 安装前端依赖：
   ```bash
   cd webui
   npm install
   ```
3. 构建前端：
   ```bash
   npm run build
   ```
4. 启动StreamerHelper后端服务，WebUI将作为其一部分运行

## 开发指南

### 前端开发

前端使用Vue 3 + TypeScript + Element Plus开发，使用Vite作为构建工具。详细的前端开发指南请参考`webui/README.md`文件。

### 后端开发

后端使用Node.js + Express + Socket.io开发，提供RESTful API和WebSocket服务。

## 贡献

欢迎提交问题和功能请求，或者直接提交Pull Request。