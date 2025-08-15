<template>
  <div class="streamer-management">
    <el-card class="streamer-card">
      <template #header>
        <div class="card-header">
          <h2>主播管理</h2>
          <el-button type="primary" @click="openAddDialog">添加主播</el-button>
        </div>
      </template>
      <div class="streamer-content">
        <el-table :data="streamers" style="width: 100%">
          <el-table-column prop="name" label="主播名称" />
          <el-table-column prop="roomUrl" label="直播间地址" />
          <el-table-column label="状态">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.name)">
                {{ getStatusText(scope.row.name) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="scope">
              <el-button size="small" @click="editStreamer(scope.row)">编辑</el-button>
              <el-button size="small" type="danger" @click="confirmDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <!-- 添加/编辑主播对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑主播' : '添加主播'"
      width="60%"
    >
      <el-form :model="streamerForm" label-width="180px" label-position="left">
        <el-form-item label="主播名称" required>
          <el-input v-model="streamerForm.name" :disabled="isEdit" placeholder="请输入主播名称" />
        </el-form-item>
        <el-form-item label="直播间地址" required>
          <el-input v-model="streamerForm.roomUrl" placeholder="请输入直播间URL地址" />
        </el-form-item>
        <el-form-item label="标题模板">
          <el-input v-model="streamerForm.titleTemplate" placeholder="例如：{{name}}{{time}}直播" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="streamerForm.description" type="textarea" rows="3" placeholder="请输入视频描述" />
        </el-form-item>
        <el-form-item label="来源">
          <el-input v-model="streamerForm.source" placeholder="请输入视频来源" />
        </el-form-item>
        <el-form-item label="动态">
          <el-input v-model="streamerForm.dynamic" type="textarea" rows="3" placeholder="请输入动态内容" />
        </el-form-item>
        <!-- 版权字段已移除 -->
        <el-form-item label="分区ID">
          <el-input v-model="streamerForm.tid" type="number" placeholder="请输入分区ID" />
        </el-form-item>
        <el-form-item label="延迟删除本地文件时间">
          <div style="display: flex; align-items: center;">
            <el-input-number v-model="streamerForm.deleteDelay" :min="0" :max="365" placeholder="请输入天数" style="width: 180px;" />
            <span style="margin-left: 10px;">天</span>
          </div>
        </el-form-item>
        <el-form-item label="标签（至少一个）">
          <div>
            <el-row>
              <el-col :span="24">
                <div class="tag-list">
                  <el-tag
                    v-for="tag in streamerForm.tagList"
                    :key="tag"
                    closable
                    @close="removeTag(tag)"
                    class="tag-item"
                  >
                    {{ tag }}
                  </el-tag>
                </div>
              </el-col>
            </el-row>
            <el-row style="margin-top: 10px;">
              <el-col :span="18">
                <el-input
                  v-model="tagInputValue"
                  placeholder="输入标签后按回车添加"
                  @keyup.enter="addTag"
                />
              </el-col>
              <el-col :span="6" style="padding-left: 10px;">
                <el-button type="primary" @click="addTag" :disabled="!tagInputValue">添加标签</el-button>
              </el-col>
            </el-row>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveStreamer">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 删除确认对话框 -->
    <el-dialog
      v-model="deleteDialogVisible"
      title="确认删除"
      width="30%"
    >
      <span>确定要删除主播 {{ streamerToDelete?.name }} 吗？</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="deleteStreamer">删除</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { connectToRooms, subscribeToRooms } from '../services/websocket'

// 主播列表
interface Streamer {
  name: string;
  roomUrl: string;
  titleTemplate?: string;
  description?: string;
  source?: string;
  dynamic?: string;
  tid?: number;
  tags?: string[];
  tagList?: string[];
  [key: string]: any;
}

const streamers = ref<Streamer[]>([])

// 主播状态
const streamerStatus = ref(new Map())

// 对话框控制
const dialogVisible = ref(false)
const deleteDialogVisible = ref(false)
const isEdit = ref(false)

// 表单数据
const streamerForm = ref<{
  name: string;
  roomUrl: string;
  titleTemplate: string;
  description: string;
  source: string;
  dynamic: string;
  tid: number;
  deleteDelay: number;
  tagList: string[];
}>({
  name: '',
  roomUrl: '',
  titleTemplate: '',
  description: '',
  source: '',
  dynamic: '',
  tid: 0,
  deleteDelay: 7, // 默认7天
  tagList: []
})

// 标签输入值
const tagInputValue = ref('')

// 添加标签
const addTag = () => {
  const value = tagInputValue.value.trim()
  if (value && !streamerForm.value.tagList.includes(value)) {
    streamerForm.value.tagList.push(value)
    tagInputValue.value = ''
  }
}

// 删除标签
const removeTag = (tag: string) => {
  const index = streamerForm.value.tagList.indexOf(tag)
  if (index !== -1) {
    streamerForm.value.tagList.splice(index, 1)
  }
}

// 要删除的主播
const streamerToDelete = ref<Streamer | null>(null)

// 获取主播列表
const fetchStreamers = async () => {
  try {
    const response = await axios.get('/api/streamers')
    // 检查响应数据结构
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      streamers.value = response.data.data
    } else if (Array.isArray(response.data)) {
      streamers.value = response.data
    } else {
      console.error('获取主播列表数据格式错误', response.data)
      ElMessage.error('获取主播列表数据格式错误')
      return
    }
    
    // 订阅所有主播的状态更新
    const streamerIds = streamers.value.map((s: any) => s.name)
    subscribeToRooms(streamerIds)
  } catch (error) {
    console.error('获取主播列表失败', error)
    ElMessage.error('获取主播列表失败')
  }
}

// 打开添加主播对话框
const openAddDialog = () => {
  isEdit.value = false
  streamerForm.value = {
    name: '',
    roomUrl: '',
    titleTemplate: '',
    description: '',
    source: '',
    dynamic: '',
    tid: 0,
    deleteDelay: 7, // 默认7天
    tagList: []
  }
  tagInputValue.value = ''
  dialogVisible.value = true
}

// 打开编辑主播对话框
const editStreamer = (streamer: Streamer) => {
  isEdit.value = true
  streamerForm.value = {
    name: streamer.name,
    roomUrl: streamer.roomUrl,
    titleTemplate: streamer.titleTemplate || '',
    description: streamer.description || '',
    source: streamer.source || '',
    dynamic: streamer.dynamic || '',
    tid: streamer.tid || 0,
    deleteDelay: streamer.deleteDelay !== undefined ? streamer.deleteDelay : 7, // 如果没有设置，默认为7天
    tagList: streamer.tags ? [...streamer.tags] : []
  }
  tagInputValue.value = ''
  dialogVisible.value = true
}

// 保存主播信息
const saveStreamer = async () => {
  // 验证标签是否至少有一个
  if (streamerForm.value.tagList.length === 0) {
    ElMessage.warning('请至少添加一个标签')
    return
  }

  try {
    const formData = {
      ...streamerForm.value,
      tags: streamerForm.value.tagList
    }
    
    if (isEdit.value) {
      // 更新主播
      await axios.put(`/api/streamers/${formData.name}`, formData)
      ElMessage.success('主播信息更新成功')
    } else {
      // 添加主播
      await axios.post('/api/streamers', formData)
      ElMessage.success('主播添加成功')
    }
    
    dialogVisible.value = false
    fetchStreamers()
  } catch (error) {
    console.error('保存主播信息失败', error)
    ElMessage.error('保存主播信息失败')
  }
}

// 确认删除主播
const confirmDelete = (streamer: Streamer) => {
  streamerToDelete.value = streamer
  deleteDialogVisible.value = true
}

// 删除主播
const deleteStreamer = async () => {
  if (!streamerToDelete.value) return
  
  try {
    await axios.delete(`/api/streamers/${streamerToDelete.value.name}`)
    ElMessage.success('主播删除成功')
    deleteDialogVisible.value = false
    fetchStreamers()
  } catch (error) {
    console.error('删除主播失败', error)
    ElMessage.error('删除主播失败')
  }
}

// 处理主播状态更新
const handleStreamerUpdate = (data: any) => {
  if (data && data.data) {
    const { name, status } = data.data
    streamerStatus.value.set(name, status)
  }
}

// 获取主播状态文本
const getStatusText = (name: string) => {
  return streamerStatus.value.get(name) === 'ONLINE' ? '在线' : '离线'
}

// 获取主播状态样式
const getStatusType = (name: string) => {
  return streamerStatus.value.get(name) === 'ONLINE' ? 'success' : 'info'
}

onMounted(async () => {
  // 连接WebSocket
  connectToRooms(handleStreamerUpdate)
  
  // 加载主播列表
  await fetchStreamers()
})
</script>

<style scoped>
.streamer-management {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.streamer-card {
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.streamer-content {
  margin-top: 10px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 标签输入相关样式 */
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 32px;
  width: 100%;
}

.tag-item {
  margin-right: 5px;
  margin-bottom: 5px;
}
</style>