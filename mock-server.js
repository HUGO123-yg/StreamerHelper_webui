const express = require('express');
const cors = require('cors');
const app = express();
const port = 8080;

// 启用CORS
app.use(cors());

// 解析JSON请求体
app.use(express.json());

// 模拟配置数据
const mockConfig = {
  StreamerHelper: {
    debug: true,
    checkTime: 30,
    videoSavePath: "./download",
    videoPartLimit: 100,
    logLevel: "info",
    port: 8080
  },
  personInfo: {
    nickname: "测试用户",
    access_token: "your_access_token",
    mid: "12345678",
    cookie: "your_cookie_here"
  },
  streamerInfo: [
    {
      name: "测试主播1",
      url: "https://live.bilibili.com/123456",
      titleTemplate: "【%s】%s",
      description: "这是一个测试主播",
      source: "bilibili",
      dynamic: "#测试直播#",
      copyright: 2,
      tid: 27,
      tags: ["测试", "直播"]
    },
    {
      name: "测试主播2",
      url: "https://live.bilibili.com/654321",
      titleTemplate: "【%s】%s",
      description: "这是另一个测试主播",
      source: "bilibili",
      dynamic: "#测试直播#",
      copyright: 2,
      tid: 27,
      tags: ["测试", "直播"]
    }
  ]
};

// 模拟文件数据
const mockFiles = [
  {
    name: "测试文件1.flv",
    size: 1024000,
    createdAt: new Date().getTime() - 3600000
  },
  {
    name: "测试文件2.flv",
    size: 2048000,
    createdAt: new Date().getTime() - 7200000
  }
];

// 模拟系统状态数据
const mockSystemStatus = {
  uptime: 3600,
  memory: {
    total: 8192,
    free: 4096,
    usage: 50
  }
};

// 配置API路由
app.get('/api/config', (req, res) => {
  console.log('请求: GET /api/config');
  res.json(mockConfig);
});

app.put('/api/config', (req, res) => {
  console.log('请求: PUT /api/config', req.body);
  res.json({ success: true, message: '配置已更新' });
});

app.get('/api/config/streamers', (req, res) => {
  console.log('请求: GET /api/config/streamers');
  res.json(mockConfig.streamerInfo);
});

// 主播API路由
app.get('/api/streamers', (req, res) => {
  console.log('请求: GET /api/streamers');
  res.json({
    total: mockConfig.streamerInfo.length,
    data: mockConfig.streamerInfo
  });
});

app.post('/api/streamers', (req, res) => {
  console.log('请求: POST /api/streamers', req.body);
  res.json({ success: true, message: '主播已添加' });
});

app.put('/api/streamers/:name', (req, res) => {
  console.log(`请求: PUT /api/streamers/${req.params.name}`, req.body);
  res.json({ success: true, message: '主播已更新' });
});

app.delete('/api/streamers/:name', (req, res) => {
  console.log(`请求: DELETE /api/streamers/${req.params.name}`);
  res.json({ success: true, message: '主播已删除' });
});

// 文件API路由
app.get('/api/files', (req, res) => {
  console.log('请求: GET /api/files');
  res.json(mockFiles);
});

app.delete('/api/files', (req, res) => {
  console.log('请求: DELETE /api/files', req.body);
  res.json({ success: true, message: '文件已删除' });
});

// 系统状态API路由
app.get('/api/status/system', (req, res) => {
  console.log('请求: GET /api/status/system');
  res.json(mockSystemStatus);
});

// 启动服务器
app.listen(port, () => {
  console.log(`模拟服务器运行在 http://localhost:${port}`);
});