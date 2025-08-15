<template>
  <div class="recorded-files">
    <el-card class="files-card">
      <template #header>
        <div class="card-header">
          <h2>录制文件管理</h2>
          <el-button type="primary" @click="fetchFiles">刷新</el-button>
        </div>
      </template>
      <div class="files-content">
        <el-table 
          v-loading="loading"
          :data="files"
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="name" label="文件名" />
          <el-table-column prop="size" label="大小">
            <template #default="scope">
              {{ formatFileSize(scope.row.size) }}
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间">
            <template #default="scope">
              {{ formatTimestamp(scope.row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="scope">
              <el-button size="small" type="danger" @click="confirmDelete([scope.row])">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <div class="batch-actions" v-if="selectedFiles.length > 0">
          <el-button type="danger" @click="confirmDelete(selectedFiles)">
            批量删除 ({{ selectedFiles.length }})
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 删除确认对话框 -->
    <el-dialog
      v-model="deleteDialogVisible"
      title="确认删除"
      width="30%"
    >
      <span>确定要删除选中的 {{ filesToDelete.length }} 个文件吗？</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="deleteFiles">删除</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

// 文件列表
interface RecordedFile {
  name: string;
  size: number;
  createdAt: string;
  path: string;
  [key: string]: any;
}

const files = ref<RecordedFile[]>([])
const loading = ref(false)

// 选中的文件
const selectedFiles = ref<RecordedFile[]>([])

// 要删除的文件
const filesToDelete = ref<RecordedFile[]>([])
const deleteDialogVisible = ref(false)

// 获取录制文件列表
const fetchFiles = async () => {
  loading.value = true
  try {
    const response = await axios.get('/api/files')
    // 检查响应数据结构
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      files.value = response.data.data
    } else if (Array.isArray(response.data)) {
      files.value = response.data
    } else {
      console.error('获取文件列表数据格式错误', response.data)
      ElMessage.error('获取文件列表数据格式错误')
      return
    }
    ElMessage.success('获取文件列表成功')
  } catch (error) {
    console.error('获取文件列表失败', error)
    ElMessage.error('获取文件列表失败')
  } finally {
    loading.value = false
  }
}

// 格式化文件大小
const formatFileSize = (bytes: number) => {
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

// 处理选择变化
const handleSelectionChange = (selection: RecordedFile[]) => {
  selectedFiles.value = selection
}

// 确认删除文件
const confirmDelete = (files: RecordedFile[]) => {
  filesToDelete.value = files
  deleteDialogVisible.value = true
}

// 删除文件
const deleteFiles = async () => {
  if (filesToDelete.value.length === 0) return
  
  try {
    // 获取文件路径列表
    const filePaths = filesToDelete.value.map(file => file.path)
    
    // 发送删除请求
    await axios.delete('/api/files', { data: { files: filePaths } })
    
    ElMessage.success('文件删除成功')
    deleteDialogVisible.value = false
    fetchFiles()
  } catch (error) {
    console.error('删除文件失败', error)
    ElMessage.error('删除文件失败')
  }
}

onMounted(() => {
  fetchFiles()
})
</script>

<style scoped>
.recorded-files {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.files-card {
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.files-content {
  margin-top: 10px;
}

.batch-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>