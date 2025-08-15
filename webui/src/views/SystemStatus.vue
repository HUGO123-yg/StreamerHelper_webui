<template>
  <div class="system-status">
    <el-card class="status-card">
      <template #header>
        <div class="card-header">
          <h2>系统状态</h2>
          <el-tag :type="statusData.status === 'running' ? 'success' : 'danger'">
            {{ statusData.status === 'running' ? '运行中' : '错误' }}
          </el-tag>
        </div>
      </template>
      <div class="status-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="运行时间">
            {{ formatUptime(statusData.uptime) }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">
            {{ formatTimestamp(statusData.timestamp) }}
          </el-descriptions-item>
          <el-descriptions-item label="RSS内存">
            {{ formatMemory(statusData.memoryUsage.rss) }}
          </el-descriptions-item>
          <el-descriptions-item label="堆内存总量">
            {{ formatMemory(statusData.memoryUsage.heapTotal) }}
          </el-descriptions-item>
          <el-descriptions-item label="堆内存使用">
            {{ formatMemory(statusData.memoryUsage.heapUsed) }}
          </el-descriptions-item>
          <el-descriptions-item label="外部内存">
            {{ formatMemory(statusData.memoryUsage.external) }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-card>

    <el-card class="status-card">
      <template #header>
        <div class="card-header">
          <h2>主播状态</h2>
          <el-button type="primary" size="small" @click="refreshStreamerStatus">
            刷新
          </el-button>
        </div>
      </template>
      <div class="status-content">
        <el-table :data="streamerStatus" style="width: 100%">
          <el-table-column prop="name" label="主播名称" />
          <el-table-column prop="status" label="状态">
            <template #default="scope">
              <el-tag :type="scope.row.status === 'ONLINE' ? 'success' : 'info'">
                {{ scope.row.status === 'ONLINE' ? '在线' : '离线' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="updateTime" label="更新时间">
            <template #default="scope">
              {{ formatTimestamp(scope.row.updateTime) }}
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { connectToSystem, connectToRooms, subscribeToRooms } from '../services/websocket'
import axios from 'axios'

// 系统状态数据
const statusData = ref({
  status: 'running',
  uptime: 0,
  memoryUsage: {
    rss: 0,
    heapTotal: 0,
    heapUsed: 0,
    external: 0
  },
  timestamp: new Date().toISOString()
})

// 主播状态数据
interface StreamerStatus {
  name: string;
  status: string;
  updateTime: string;
  [key: string]: any;
}

const streamerStatus = ref<StreamerStatus[]>([])
const streamerIds = ref<string[]>([])

// 格式化运行时间
const formatUptime = (seconds: number) => {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  return `${days}天 ${hours}小时 ${minutes}分钟 ${secs}秒`
}

// 格式化内存大小
const formatMemory = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
}

// 格式化时间戳
const formatTimestamp = (timestamp: string) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleString()
}

// 刷新主播状态
const refreshStreamerStatus = async () => {
  try {
    const response = await axios.get('/api/streamers')
    // 检查响应数据结构
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      streamerIds.value = response.data.data.map((streamer: any) => streamer.name)
    } else if (Array.isArray(response.data)) {
      streamerIds.value = response.data.map((streamer: any) => streamer.name)
    } else {
      console.error('获取主播列表数据格式错误', response.data)
      return
    }
    
    // 重新订阅主播状态
    subscribeToRooms(streamerIds.value)
  } catch (error) {
    console.error('获取主播列表失败', error)
  }
}

// 处理系统状态更新
const handleSystemUpdate = (data: any) => {
  if (data && data.data) {
    statusData.value = data.data
  }
}

// 处理主播状态更新
const handleStreamerUpdate = (data: any) => {
  if (data && data.data) {
    const updatedStreamer = data.data
    
    // 更新现有主播状态或添加新主播
    const index = streamerStatus.value.findIndex((s: any) => s.name === updatedStreamer.name)
    if (index >= 0) {
      streamerStatus.value[index] = updatedStreamer
    } else {
      streamerStatus.value.push(updatedStreamer)
    }
  }
}

onMounted(async () => {
  // 连接WebSocket
  connectToSystem(handleSystemUpdate)
  connectToRooms(handleStreamerUpdate)
  
  // 初始加载数据
  await refreshStreamerStatus()
})

onUnmounted(() => {
  // 组件卸载时可以添加清理代码
})
</script>

<style scoped>
.system-status {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.status-card {
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-content {
  margin-top: 10px;
}
</style>