<template>
  <div class="log-viewer">
    <el-card class="log-card">
      <template #header>
        <div class="card-header">
          <h2>实时日志</h2>
          <div class="header-controls">
            <el-select v-model="logLevel" placeholder="日志级别" style="width: 120px;">
              <el-option label="全部" value="ALL" />
              <el-option label="TRACE" value="TRACE" />
              <el-option label="DEBUG" value="DEBUG" />
              <el-option label="INFO" value="INFO" />
              <el-option label="WARN" value="WARN" />
              <el-option label="ERROR" value="ERROR" />
              <el-option label="FATAL" value="FATAL" />
            </el-select>
            <el-button type="primary" size="small" @click="clearLogs">
              清空日志
            </el-button>
            <el-switch
              v-model="autoScroll"
              active-text="自动滚动"
              inactive-text=""
            />
          </div>
        </div>
      </template>
      <div class="log-content" ref="logContainer">
        <div v-if="filteredLogs.length === 0" class="no-logs">
          暂无日志记录
        </div>
        <div v-else class="log-entries">
          <div 
            v-for="(log, index) in filteredLogs" 
            :key="index"
            class="log-entry"
            :class="getLogLevelClass(log.data.level)"
          >
            <span class="log-timestamp">{{ formatTimestamp(log.data.timestamp) }}</span>
            <span class="log-level">[{{ log.data.level }}]</span>
            <span class="log-message">{{ log.data.message }}</span>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { connectToLogs } from '../services/websocket'

// 日志数据
const logs = ref([])
const logLevel = ref('ALL')
const autoScroll = ref(true)
const logContainer = ref(null)

// 根据日志级别过滤日志
const filteredLogs = computed(() => {
  if (logLevel.value === 'ALL') {
    return logs.value
  }
  return logs.value.filter((log: any) => log.data.level === logLevel.value)
})

// 格式化时间戳
const formatTimestamp = (timestamp: string) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleString()
}

// 根据日志级别获取样式类
const getLogLevelClass = (level: string) => {
  const levelMap: Record<string, string> = {
    'TRACE': 'log-trace',
    'DEBUG': 'log-debug',
    'INFO': 'log-info',
    'WARN': 'log-warn',
    'ERROR': 'log-error',
    'FATAL': 'log-fatal'
  }
  return levelMap[level] || ''
}

// 清空日志
const clearLogs = () => {
  logs.value = []
}

// 处理日志消息
const handleLogMessage = (data: any) => {
  logs.value.push(data)
  // 限制日志数量，防止内存占用过多
  if (logs.value.length > 1000) {
    logs.value = logs.value.slice(-1000)
  }
}

// 自动滚动到底部
const scrollToBottom = () => {
  if (logContainer.value && autoScroll.value) {
    nextTick(() => {
      const container = logContainer.value as HTMLElement
      container.scrollTop = container.scrollHeight
    })
  }
}

// 监听日志变化，自动滚动
watch(() => logs.value.length, () => {
  scrollToBottom()
})

onMounted(() => {
  // 连接WebSocket
  connectToLogs(handleLogMessage)
})

onUnmounted(() => {
  // 组件卸载时可以添加清理代码
})
</script>

<style scoped>
.log-viewer {
  height: 100%;
}

.log-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.log-content {
  flex: 1;
  overflow-y: auto;
  background-color: #1e1e1e;
  color: #f0f0f0;
  padding: 10px;
  border-radius: 4px;
  font-family: monospace;
  height: calc(100vh - 200px);
}

.no-logs {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #888;
}

.log-entries {
  display: flex;
  flex-direction: column;
}

.log-entry {
  margin-bottom: 4px;
  white-space: pre-wrap;
  word-break: break-all;
}

.log-timestamp {
  color: #888;
  margin-right: 8px;
}

.log-level {
  font-weight: bold;
  margin-right: 8px;
}

.log-trace { color: #6c7ae0; }
.log-debug { color: #56b6c2; }
.log-info { color: #98c379; }
.log-warn { color: #e5c07b; }
.log-error { color: #e06c75; }
.log-fatal { color: #c678dd; }
</style>