<template>
  <div class="config-management">
    <el-card class="config-card">
      <template #header>
        <div class="card-header">
          <h2>配置管理</h2>
          <div class="header-actions">
            <el-button type="primary" @click="saveConfig">保存配置</el-button>
            <el-button @click="fetchConfig">重置</el-button>
            <el-button v-if="useJsonEditor" type="success" @click="validateJson">验证JSON</el-button>
            <div class="editor-switch">
              <el-switch
                v-model="useJsonEditor"
                active-text="JSON编辑器"
                inactive-text="表单编辑"
              />
            </div>
          </div>
        </div>
      </template>
      <div class="config-content">
        <div v-if="useJsonEditor" class="json-editor-container">
          <div class="json-editor-header">
            <el-alert
              title="JSON编辑器模式"
              type="info"
              description="在此模式下，您可以直接编辑配置的JSON结构。请确保JSON格式正确，否则可能导致配置无法保存。"
              show-icon
              :closable="false"
            />
            <div class="json-editor-tips">
              <h3>使用提示：</h3>
              <ul>
                <li>点击左侧的 <strong>+</strong> 或 <strong>-</strong> 图标可以展开或折叠节点</li>
                <li>双击值可以直接编辑</li>
                <li>右键点击可以显示更多操作选项</li>
                <li>编辑完成后，点击上方的<strong>保存配置</strong>按钮保存更改</li>
              </ul>
              <div class="json-editor-actions">
                <el-button size="small" type="info" @click="showConfigExample">查看配置示例</el-button>
              </div>
            </div>
          </div>
          <json-editor-vue v-model="jsonConfig" class="json-editor" />
        </div>
        <el-tabs v-else v-model="activeTab">
          <el-tab-pane label="基本配置" name="basic">
            <el-form :model="config.StreamerHelper" label-width="180px" class="config-form">
              <el-form-item label="调试模式">
                <el-switch v-model="config.StreamerHelper.debug" />
              </el-form-item>
              <el-form-item label="房间检查时间 (秒)">
                <el-input-number v-model="config.StreamerHelper.roomCheckTime" :min="1" />
              </el-form-item>
              <el-form-item label="日志级别">
                <el-select v-model="config.StreamerHelper.logLevel">
                  <el-option label="ALL" value="ALL" />
                  <el-option label="TRACE" value="TRACE" />
                  <el-option label="DEBUG" value="DEBUG" />
                  <el-option label="INFO" value="INFO" />
                  <el-option label="WARN" value="WARN" />
                  <el-option label="ERROR" value="ERROR" />
                  <el-option label="FATAL" value="FATAL" />
                </el-select>
              </el-form-item>
              <el-form-item label="服务器端口">
                <el-input-number v-model="config.StreamerHelper.port" :min="1" :max="65535" />
              </el-form-item>
            </el-form>
          </el-tab-pane>
          
          <el-tab-pane label="推送配置" name="push">
            <el-form :model="config.pushConfig" label-width="180px" class="config-form">
              <el-divider content-position="left">邮件推送</el-divider>
              <el-form-item label="启用邮件推送">
                <el-switch v-model="config.pushConfig.email.enable" />
              </el-form-item>
              <el-form-item label="邮件服务器">
                <el-input v-model="config.pushConfig.email.host" />
              </el-form-item>
              <el-form-item label="邮件端口">
                <el-input-number v-model="config.pushConfig.email.port" :min="1" :max="65535" />
              </el-form-item>
              <el-form-item label="发件人">
                <el-input v-model="config.pushConfig.email.auth.user" />
              </el-form-item>
              <el-form-item label="密码">
                <el-input v-model="config.pushConfig.email.auth.pass" type="password" />
              </el-form-item>
              <el-form-item label="收件人">
                <el-input v-model="config.pushConfig.email.to" />
              </el-form-item>
              
              <el-divider content-position="left">微信推送</el-divider>
              <el-form-item label="启用微信推送">
                <el-switch v-model="config.pushConfig.wechat.enable" />
              </el-form-item>
              <el-form-item label="SCKEY">
                <el-input v-model="config.pushConfig.wechat.sckey" />
              </el-form-item>
              
              <el-divider content-position="left">S3对象存储推送</el-divider>
              <el-form-item label="启用S3推送">
                <el-switch v-model="config.pushConfig.s3.enable" />
              </el-form-item>
              <el-form-item label="服务端点">
                <el-input v-model="config.pushConfig.s3.endpoint" placeholder="例如：https://s3.amazonaws.com" />
              </el-form-item>
              <el-form-item label="访问密钥ID">
                <el-input v-model="config.pushConfig.s3.accessKeyId" />
              </el-form-item>
              <el-form-item label="秘密访问密钥">
                <el-input v-model="config.pushConfig.s3.secretAccessKey" type="password" />
              </el-form-item>
              <el-form-item label="区域">
                <el-input v-model="config.pushConfig.s3.region" placeholder="例如：us-east-1" />
              </el-form-item>
              <el-form-item label="存储桶名称">
                <el-input v-model="config.pushConfig.s3.bucket" />
              </el-form-item>
              <el-form-item label="前缀路径">
                <el-input v-model="config.pushConfig.s3.prefix" placeholder="例如：logs/streamerhelper" />
              </el-form-item>
            </el-form>
          </el-tab-pane>
          
          <el-tab-pane label="个人信息" name="personal">
            <el-form :model="config.personInfo" label-width="180px" class="config-form">
              <el-form-item label="昵称">
                <el-input v-model="config.personInfo.nickname" />
              </el-form-item>
              <el-form-item label="Token">
                <el-input v-model="config.personInfo.token" type="password" />
              </el-form-item>
              <el-form-item label="MID">
                <el-input v-model="config.personInfo.mid" />
              </el-form-item>
              <el-form-item label="Cookies">
                <el-input v-model="config.personInfo.cookies" type="textarea" rows="5" />
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-card>
  </div>

  <!-- 配置示例对话框 -->
  <el-dialog
    v-model="exampleDialogVisible"
    title="配置示例"
    width="60%"
  >
    <div class="example-dialog-content">
      <el-tabs v-model="exampleActiveTab">
        <el-tab-pane label="基本配置" name="basic">
          <pre class="example-code">{{ formattedBasicExample }}</pre>
        </el-tab-pane>
        <el-tab-pane label="主播配置" name="streamer">
          <pre class="example-code">{{ formattedStreamerExample }}</pre>
        </el-tab-pane>
        <el-tab-pane label="完整配置" name="full">
          <pre class="example-code">{{ formattedFullExample }}</pre>
        </el-tab-pane>
      </el-tabs>
      <div class="example-tips">
        <p>提示：您可以复制示例配置，然后在JSON编辑器中粘贴和修改。</p>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="exampleDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="copyExample">复制当前示例</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import JsonEditorVue from 'json-editor-vue'

// 是否使用JSON编辑器
const useJsonEditor = ref(false)

// 配置数据
const config = ref({
  StreamerHelper: {
    debug: false,
    roomCheckTime: 10,
    logLevel: 'INFO',
    port: 8080
  },
  pushConfig: {
    email: {
      enable: false,
      host: '',
      port: 465,
      auth: {
        user: '',
        pass: ''
      },
      to: ''
    },
    wechat: {
      enable: false,
      sckey: ''
    },
    s3: {
      enable: false,
      endpoint: '',
      accessKeyId: '',
      secretAccessKey: '',
      region: '',
      bucket: '',
      prefix: 'logs/streamerhelper'
    }
  },
  personInfo: {
    nickname: '',
    token: '',
    mid: '',
    cookies: ''
  },
  streamerInfo: []
})

// JSON编辑器的数据模型
const jsonConfig = computed({
  get: () => config.value,
  set: (val) => {
    try {
      // 确保JSON格式正确
      if (typeof val === 'object' && val !== null) {
        config.value = val
      }
    } catch (error) {
      console.error('JSON格式错误', error)
      ElMessage.error('JSON格式错误，请检查输入')
    }
  }
})

// 当前激活的标签页
const activeTab = ref('basic')

// 获取配置信息
const fetchConfig = async () => {
  try {
    const response = await axios.get('/api/config')
    if (response.data) {
      // 确保所有必要的配置字段都存在
      config.value = {
        StreamerHelper: {
          debug: response.data.StreamerHelper?.debug ?? config.value.StreamerHelper.debug,
          roomCheckTime: response.data.StreamerHelper?.roomCheckTime ?? config.value.StreamerHelper.roomCheckTime,
          logLevel: response.data.StreamerHelper?.logLevel ?? config.value.StreamerHelper.logLevel,
          port: response.data.StreamerHelper?.port ?? config.value.StreamerHelper.port
        },
        pushConfig: {
          email: {
            enable: response.data.pushConfig?.email?.enable ?? config.value.pushConfig.email.enable,
            host: response.data.pushConfig?.email?.host ?? config.value.pushConfig.email.host,
            port: response.data.pushConfig?.email?.port ?? config.value.pushConfig.email.port,
            auth: {
              user: response.data.pushConfig?.email?.auth?.user ?? config.value.pushConfig.email.auth.user,
              pass: response.data.pushConfig?.email?.auth?.pass ?? config.value.pushConfig.email.auth.pass
            },
            to: response.data.pushConfig?.email?.to ?? config.value.pushConfig.email.to
          },
          wechat: {
            enable: response.data.pushConfig?.wechat?.enable ?? config.value.pushConfig.wechat.enable,
            sckey: response.data.pushConfig?.wechat?.sckey ?? config.value.pushConfig.wechat.sckey
          },
          s3: {
            enable: response.data.pushConfig?.s3?.enable ?? config.value.pushConfig.s3.enable,
            endpoint: response.data.pushConfig?.s3?.endpoint ?? config.value.pushConfig.s3.endpoint,
            accessKeyId: response.data.pushConfig?.s3?.accessKeyId ?? config.value.pushConfig.s3.accessKeyId,
            secretAccessKey: response.data.pushConfig?.s3?.secretAccessKey ?? config.value.pushConfig.s3.secretAccessKey,
            region: response.data.pushConfig?.s3?.region ?? config.value.pushConfig.s3.region,
            bucket: response.data.pushConfig?.s3?.bucket ?? config.value.pushConfig.s3.bucket,
            prefix: response.data.pushConfig?.s3?.prefix ?? config.value.pushConfig.s3.prefix
          }
        },
        personInfo: {
          nickname: response.data.personInfo?.nickname ?? config.value.personInfo.nickname,
          token: response.data.personInfo?.token ?? response.data.personInfo?.access_token ?? config.value.personInfo.token,
          mid: response.data.personInfo?.mid ?? config.value.personInfo.mid,
          cookies: response.data.personInfo?.cookies ?? response.data.personInfo?.cookie ?? config.value.personInfo.cookies
        },
        streamerInfo: response.data.streamerInfo ?? []
      }
      ElMessage.success('配置信息加载成功')
    }
  } catch (error) {
    console.error('获取配置信息失败', error)
    ElMessage.error('获取配置信息失败，使用默认配置')
  }
}

// 保存配置信息
const saveConfig = async () => {
  try {
    // 如果使用JSON编辑器，先验证JSON格式
    if (useJsonEditor.value) {
      if (!validateJson()) {
        return
      }
    }
    
    await axios.put('/api/config', config.value)
    ElMessage.success('配置保存成功')
  } catch (error) {
    console.error('保存配置信息失败', error)
    ElMessage.error('保存配置信息失败')
  }
}

// 验证JSON格式
const validateJson = () => {
  try {
    // 尝试解析JSON
    JSON.stringify(jsonConfig.value)
    // 验证必要的字段
    if (!jsonConfig.value.StreamerHelper) {
      ElMessage.warning('缺少必要的配置字段: StreamerHelper')
      return false
    }
    ElMessage.success('JSON格式验证通过')
    return true
  } catch (error) {
    console.error('JSON格式验证失败', error)
    ElMessage.error('JSON格式验证失败，请检查输入')
    return false
  }
}

// 配置示例对话框相关变量
const exampleDialogVisible = ref(false);
const exampleActiveTab = ref('basic');

// 配置示例数据
const basicExample = {
  StreamerHelper: {
    debug: false,
    roomCheckTime: 600,
    logLevel: "info",
    port: 8080,
    push: {
      mail: {
        enable: true,
        host: "smtp.example.com",
        port: 465,
        from: "sender@example.com",
        pwd: "password",
        to: "receiver@example.com",
        secure: true
      }
    }
  }
};

const streamerExample = {
  streamerInfo: [
    {
      name: "主播名称",
      uploadLocalFile: true,
      deleteLocalFile: true,
      templateTitle: "{{name}}{{time}} 直播",
      delayTime: 0,
      desc: "直播描述",
      source: "直播来源",
      dynamic: "动态内容",
      copyright: 2,
      roomUrl: "https://live.example.com/123456",
      tid: 17,
      tags: ["标签1", "标签2"]
    }
  ]
};

const fullExample = {
  StreamerHelper: {
    debug: false,
    roomCheckTime: 600,
    recycleCheckTime: 1800,
    videoPartLimitSize: 100,
    logLevel: "info",
    port: 8080,
    push: {
      mail: {
        enable: true,
        host: "smtp.example.com",
        port: 465,
        from: "sender@example.com",
        pwd: "password",
        to: "receiver@example.com",
        secure: true
      },
      wechat: {
        enable: true,
        sendKey: "your-send-key"
      }
    }
  },
  personInfo: {
    nickname: "YourNickname",
    access_token: "your-access-token",
    refresh_token: "your-refresh-token",
    expires_in: 0,
    tokenSignDate: 0,
    mid: 0,
    cookies: "your-cookies"
  },
  streamerInfo: [
    {
      name: "主播名称",
      uploadLocalFile: true,
      deleteLocalFile: true,
      templateTitle: "{{name}}{{time}} 直播",
      delayTime: 0,
      desc: "直播描述",
      source: "直播来源",
      dynamic: "动态内容",
      copyright: 2,
      roomUrl: "https://live.example.com/123456",
      tid: 17,
      tags: ["标签1", "标签2"]
    }
  ]
};

// 格式化示例为JSON字符串
const formattedBasicExample = computed(() => {
  return JSON.stringify(basicExample, null, 2);
});

const formattedStreamerExample = computed(() => {
  return JSON.stringify(streamerExample, null, 2);
});

const formattedFullExample = computed(() => {
  return JSON.stringify(fullExample, null, 2);
});

// 显示配置示例对话框
const showConfigExample = () => {
  exampleDialogVisible.value = true;
}

// 复制当前示例
const copyExample = () => {
  let textToCopy = '';
  
  switch (exampleActiveTab.value) {
    case 'basic':
      textToCopy = formattedBasicExample.value;
      break;
    case 'streamer':
      textToCopy = formattedStreamerExample.value;
      break;
    case 'full':
      textToCopy = formattedFullExample.value;
      break;
  }
  
  // 使用navigator.clipboard API复制文本
  navigator.clipboard.writeText(textToCopy)
    .then(() => {
      ElMessage.success('示例已复制到剪贴板');
    })
    .catch(err => {
      console.error('复制失败:', err);
      ElMessage.error('复制失败，请手动选择并复制');
    });
}

// 监听编辑器模式切换
watch(useJsonEditor, (newVal) => {
  if (newVal) {
    ElMessage.info('已切换到JSON编辑器模式，请注意保持正确的JSON格式')
  }
})

onMounted(() => {
  fetchConfig()
})
</script>

<style scoped>
.config-management {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.config-card {
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 5px;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
  width: 100%;
}

.editor-switch {
  margin-left: 10px;
}

.config-content {
  margin-top: 10px;
  overflow-y: auto;
  max-height: 75vh;
}

.json-editor-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.json-editor-header {
  margin-bottom: 10px;
}

.json-editor-tips {
  margin-top: 15px;
  padding: 10px 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
  border-left: 4px solid #409eff;
}

.json-editor-tips h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #409eff;
  font-size: 16px;
}

.json-editor-tips ul {
  margin: 0;
  padding-left: 20px;
}

.json-editor-tips li {
  margin-bottom: 5px;
  line-height: 1.5;
}

.json-editor-actions {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #dcdfe6;
}

.example-dialog-content {
  max-height: 70vh;
  overflow-y: auto;
}

.example-code {
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 15px;
  font-family: 'Courier New', monospace;
  white-space: pre-wrap;
  overflow-x: auto;
  margin: 0;
}

.example-tips {
  margin-top: 15px;
  padding: 10px;
  background-color: #ecf8ff;
  border-radius: 4px;
  border-left: 4px solid #409eff;
}

.json-editor {
  height: 600px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: auto;
}

/* 自定义JSON编辑器样式 */
:deep(.jse-main) {
  border: none;
  background-color: #f5f7fa;
}

/* 小屏幕适配 */
@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-start;
    margin-top: 10px;
  }
  
  .config-form {
    width: 100%;
    overflow-x: auto;
    overflow-y: auto;
    max-height: 70vh;
  }
  
  .config-form .el-form-item {
    margin-bottom: 18px;
  }
  
  .config-form .el-form-item__label {
    width: 120px !important;
    font-size: 14px;
  }
  
  .config-form .el-form-item__content {
    margin-left: 120px !important;
  }
  
  .el-tabs__item {
    padding: 0 10px;
  }
  
  .json-editor {
    height: 400px;
  }
  
  .el-dialog {
    width: 90% !important;
  }
  
  /* 下拉菜单适配 */
  :deep(.el-select__popper) {
    max-width: 90vw;
  }
}
</style>