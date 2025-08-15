# StreamerHelper WebUI API 文档

本文档描述了StreamerHelper WebUI的REST API接口。所有API路由都以`/api`为前缀。

## 目录

- [配置管理 API](#配置管理-api)
- [主播管理 API](#主播管理-api)
- [录制文件管理 API](#录制文件管理-api)
- [系统状态 API](#系统状态-api)

## 配置管理 API

### 获取完整配置信息

```
GET /api/config
```

读取并返回整个 info.json 的内容。

**响应示例：**

```json
{
  "StreamerHelper": {
    "debug": false,
    "checkTime": 30,
    "videoSplitStrict": 1800,
    "logLevel": "info",
    "serverPort": 8080
  },
  "personInfo": {
    "nickname": "昵称",
    "access_token": "token",
    "mid": 123456789,
    "cookie": "cookie"
  },
  "streamerInfo": [
    {
      "name": "主播名称",
      "uploadLocalFile": true,
      "deleteLocalFile": false,
      "templateTitle": "{{name}}{{time}} 直播",
      "delayTime": 2,
      "desc": "",
      "source": "",
      "dynamic": "",
      "copyright": 2,
      "roomUrl": "https://live.bilibili.com/123456",
      "tid": 171,
      "tags": ["直播", "录播"]
    }
  ]
}
```

### 更新完整配置信息

```
PUT /api/config
```

接收 JSON 数据，并用它来完整更新 info.json。

**请求体示例：**

```json
{
  "StreamerHelper": {
    "debug": false,
    "checkTime": 30,
    "videoSplitStrict": 1800,
    "logLevel": "info",
    "serverPort": 8080
  },
  "personInfo": {
    "nickname": "昵称",
    "access_token": "token",
    "mid": 123456789,
    "cookie": "cookie"
  },
  "streamerInfo": [
    {
      "name": "主播名称",
      "uploadLocalFile": true,
      "deleteLocalFile": false,
      "templateTitle": "{{name}}{{time}} 直播",
      "delayTime": 2,
      "desc": "",
      "source": "",
      "dynamic": "",
      "copyright": 2,
      "roomUrl": "https://live.bilibili.com/123456",
      "tid": 171,
      "tags": ["直播", "录播"]
    }
  ]
}
```

**响应示例：**

```json
{
  "success": true,
  "message": "配置已更新"
}
```

### 获取主播列表配置

```
GET /api/config/streamers
```

只返回主播列表部分。

**响应示例：**

```json
{
  "total": 1,
  "data": [
    {
      "name": "主播名称",
      "uploadLocalFile": true,
      "deleteLocalFile": false,
      "templateTitle": "{{name}}{{time}} 直播",
      "delayTime": 2,
      "desc": "",
      "source": "",
      "dynamic": "",
      "copyright": 2,
      "roomUrl": "https://live.bilibili.com/123456",
      "tid": 171,
      "tags": ["直播", "录播"]
    }
  ]
}
```

## 主播管理 API

### 获取所有主播信息

```
GET /api/streamers
```

返回系统中配置的所有主播信息。

**响应示例：**

```json
{
  "total": 1,
  "data": [
    {
      "name": "主播名称",
      "uploadLocalFile": true,
      "deleteLocalFile": false,
      "templateTitle": "{{name}}{{time}} 直播",
      "delayTime": 2,
      "desc": "",
      "source": "",
      "dynamic": "",
      "copyright": 2,
      "roomUrl": "https://live.bilibili.com/123456",
      "tid": 171,
      "tags": ["直播", "录播"]
    }
  ]
}
```

### 添加新主播

```
POST /api/streamers
```

在 info.json 的 streamerInfo 数组中添加一个新主播。

**请求体示例：**

```json
{
  "name": "新主播",
  "roomUrl": "https://live.bilibili.com/654321"
}
```

**响应示例：**

```json
{
  "success": true,
  "message": "主播添加成功",
  "data": {
    "name": "新主播",
    "uploadLocalFile": true,
    "deleteLocalFile": false,
    "templateTitle": "{{name}}{{time}} 直播",
    "delayTime": 2,
    "desc": "",
    "source": "",
    "dynamic": "",
    "copyright": 2,
    "roomUrl": "https://live.bilibili.com/654321",
    "tid": 171,
    "tags": ["直播", "录播"]
  }
}
```

### 更新主播信息

```
PUT /api/streamers/:id
```

根据主播的唯一标识（如 name），更新其信息。

**请求体示例：**

```json
{
  "delayTime": 5,
  "desc": "主播简介",
  "tags": ["直播", "录播", "游戏"]
}
```

**响应示例：**

```json
{
  "success": true,
  "message": "主播信息已更新",
  "data": {
    "name": "主播名称",
    "uploadLocalFile": true,
    "deleteLocalFile": false,
    "templateTitle": "{{name}}{{time}} 直播",
    "delayTime": 5,
    "desc": "主播简介",
    "source": "",
    "dynamic": "",
    "copyright": 2,
    "roomUrl": "https://live.bilibili.com/123456",
    "tid": 171,
    "tags": ["直播", "录播", "游戏"]
  }
}
```

### 删除主播

```
DELETE /api/streamers/:id
```

从 streamerInfo 数组中删除一个主播。

**响应示例：**

```json
{
  "success": true,
  "message": "主播已删除",
  "data": {
    "name": "主播名称",
    "uploadLocalFile": true,
    "deleteLocalFile": false,
    "templateTitle": "{{name}}{{time}} 直播",
    "delayTime": 2,
    "desc": "",
    "source": "",
    "dynamic": "",
    "copyright": 2,
    "roomUrl": "https://live.bilibili.com/123456",
    "tid": 171,
    "tags": ["直播", "录播"]
  }
}
```

### 获取特定主播配置信息

```
GET /api/streamers/:name
```

根据主播名称返回特定主播的配置信息。

**响应示例：**

```json
{
  "name": "主播名称",
  "uploadLocalFile": true,
  "deleteLocalFile": false,
  "templateTitle": "{{name}}{{time}} 直播",
  "delayTime": 2,
  "desc": "",
  "source": "",
  "dynamic": "",
  "copyright": 2,
  "roomUrl": "https://live.bilibili.com/123456",
  "tid": 171,
  "tags": ["直播", "录播"]
}
```

## 录制文件管理 API

### 获取录制文件列表

```
GET /api/files
```

扫描录制目录，返回文件列表及其详细信息。

**响应示例：**

```json
{
  "total": 1,
  "data": [
    {
      "path": "/path/to/recording",
      "streamer": "主播名称",
      "title": "直播标题",
      "startTime": "2023-01-01T12:00:00Z",
      "endTime": "2023-01-01T14:00:00Z",
      "files": [
        {
          "name": "recording.mp4",
          "path": "/path/to/recording/recording.mp4",
          "size": 1073741824,
          "created": "2023-01-01T14:05:00Z",
          "modified": "2023-01-01T14:05:00Z"
        }
      ],
      "fileCount": 1,
      "totalSize": 1073741824
    }
  ]
}
```

### 删除录制文件

```
DELETE /api/files?path=/path/to/file.mp4
```

根据提供的文件路径，删除指定的录制文件。

**响应示例：**

```json
{
  "success": true,
  "message": "文件已删除",
  "path": "/path/to/file.mp4"
}
```

## 系统状态 API

### 获取系统状态信息

```
GET /api/status/system
```

返回系统运行状态、版本等基本信息。

**响应示例：**

```json
{
  "status": "running",
  "timestamp": "2023-01-01T12:00:00Z",
  "memory": {
    "free": 8589934592,
    "total": 17179869184,
    "used": 8589934592,
    "process": {
      "rss": 104857600,
      "heapTotal": 52428800,
      "heapUsed": 41943040,
      "external": 1048576
    }
  },
  "disk": {
    "free": 107374182400,
    "total": 214748364800,
    "used": 107374182400
  },
  "system": {
    "platform": "darwin",
    "arch": "x64",
    "cpus": 8,
    "hostname": "localhost",
    "uptime": 86400
  },
  "process": {
    "pid": 12345,
    "uptime": 3600,
    "version": "v16.14.0",
    "versions": {
      "node": "16.14.0",
      "v8": "9.4.146.24-node.20"
    }
  },
  "app": {
    "version": "1.0.0",
    "recorderCount": 2,
    "streamerCount": 3
  }
}
```