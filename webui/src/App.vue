<template>
  <div class="app-container">
    <!-- 固定位置的边栏 -->
    <el-aside class="responsive-sidebar" :class="{ 'collapsed': isCollapsed }">
      <el-menu
        router
        default-active="/"
        class="sidebar-menu"
        :collapse="isCollapsed"
        background-color="#545c64"
        text-color="#fff"
        active-text-color="#ffd04b">
        <div class="sidebar-title" :class="{ 'collapsed': isCollapsed }">
          <h1>Streamer-Web</h1>
        </div>
        <el-menu-item index="/">
          <el-icon><Monitor /></el-icon>
          <span>系统状态</span>
        </el-menu-item>
        <el-menu-item index="/streamers">
          <el-icon><VideoCamera /></el-icon>
          <span>主播管理</span>
        </el-menu-item>
        <el-menu-item index="/files">
          <el-icon><Folder /></el-icon>
          <span>录制文件</span>
        </el-menu-item>
        <el-menu-item index="/config">
          <el-icon><Setting /></el-icon>
          <span>配置管理</span>
        </el-menu-item>
        <el-menu-item index="/logs">
          <el-icon><Document /></el-icon>
          <span>日志查看</span>
        </el-menu-item>
      </el-menu>
      <div class="sidebar-toggle" @click="toggleSidebar">
        <el-icon v-if="isCollapsed"><ArrowRight /></el-icon>
        <el-icon v-else><ArrowLeft /></el-icon>
      </div>
    </el-aside>
    
    <!-- 主内容区域，带有左边距以适应固定边栏 -->
    <el-container class="main-container" :class="{ 'expanded': isCollapsed }">
      <el-header>
        <div class="header-title">
          <h2>管理界面</h2>
        </div>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Monitor, VideoCamera, Folder, Setting, Document, ArrowRight, ArrowLeft } from '@element-plus/icons-vue'

// 侧边栏折叠状态
const isCollapsed = ref(false)

// 切换侧边栏折叠状态
const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>

<style scoped>
.app-container {
  height: 100vh;
  width: 100%;
  overflow: hidden; /* 防止出现滚动条 */
}

.el-header {
  background-color: #f5f7fa;
  color: #333;
  line-height: 60px;
  border-bottom: 1px solid #e6e6e6;
}

.header-title {
  display: flex;
  align-items: center;
  height: 100%;
}

.el-aside {
  background-color: #545c64;
  color: #fff;
  transition: all 0.3s ease;
  min-width: 180px;
  max-width: 250px;
  width: 15vw !important;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  height: 100vh; /* 确保边栏填充整个视口高度 */
  position: fixed; /* 固定位置 */
  left: 0;
  top: 0;
  z-index: 1000;
}

.el-aside.collapsed {
  width: 64px !important;
  min-width: 64px;
}

.sidebar-toggle {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 32px;
  height: 32px;
  background-color: #2c3e50;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.sidebar-toggle:hover {
  background-color: #1e2b38;
  transform: translateX(-50%) scale(1.1);
}

.sidebar-title {
  padding: 15px 10px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

.sidebar-title.collapsed {
  padding: 15px 0;
}

.sidebar-title h1 {
  color: #ffd04b;
  font-size: 1.3rem;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.sidebar-title.collapsed h1 {
  font-size: 0;
}

.sidebar-title.collapsed h1::before {
  content: 'S';
  font-size: 1.3rem;
  display: inline-block;
}

.sidebar-menu {
  height: 100%;
  overflow-y: auto;
}

.el-menu-item span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.main-container {
  margin-left: 15vw; /* 与边栏宽度相同 */
  min-height: 100vh;
  width: calc(100% - 15vw);
  transition: all 0.3s ease;
}

.main-container.expanded {
  margin-left: 64px;
  width: calc(100% - 64px);
}

.el-main {
  background-color: #f5f7fa;
  padding: 20px;
  overflow-x: hidden;
  min-height: calc(100vh - 60px); /* 减去header高度 */
}

/* 中等屏幕尺寸 */
@media (max-width: 992px) and (min-width: 769px) {
  .el-aside {
    width: 80px !important;
    min-width: 80px;
  }
  
  .main-container {
    margin-left: 80px;
    width: calc(100% - 80px);
  }
  
  .sidebar-title h1 {
    font-size: 1rem;
  }
  
  .el-menu-item span {
    font-size: 12px;
  }
}

/* 小屏幕尺寸 */
@media (max-width: 768px) {
  .el-aside:not(.collapsed) {
    width: 60px !important;
    min-width: 60px;
  }
  
  .main-container:not(.expanded) {
    margin-left: 60px;
    width: calc(100% - 60px);
  }
  
  .sidebar-title h1 {
    font-size: 0;
  }
  
  .sidebar-title h1::before {
    content: 'S';
    font-size: 1.3rem;
    display: inline-block;
  }
  
  .el-menu-item .el-icon {
    margin-right: 0;
  }
  
  .el-menu-item span {
    display: none;
  }
}

/* 确保菜单项在所有分辨率下都有良好的对齐 */
.el-menu-item {
  display: flex;
  align-items: center;
  padding: 0 15px;
}

.el-menu-item .el-icon {
  margin-right: 10px;
  font-size: 18px;
}
</style>