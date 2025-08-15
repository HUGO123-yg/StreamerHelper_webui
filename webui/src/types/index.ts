// 系统状态接口
export interface SystemStatus {
  status: 'running' | 'error';
  uptime: number;
  memoryUsage: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  timestamp: string;
}

// 日志消息接口
export interface LogMessage {
  level: string;
  message: string;
  timestamp: string;
}

// 主播状态接口
export interface StreamerStatus {
  name: string;
  status: 'ONLINE' | 'OFFLINE';
  statusCode: 0 | 1;
  updateTime: string;
}

// 主播信息接口
export interface Streamer {
  name: string;
  roomUrl: string;
  titleTemplate?: string;
  description?: string;
  source?: string;
  dynamic?: string;
  copyright?: string;
  tid?: number;
  tags?: string[];
}

// 录制文件接口
export interface RecordedFile {
  name: string;
  path: string;
  size: number;
  createdAt: string;
}

// 配置接口
export interface Config {
  StreamerHelper: {
    debug: boolean;
    roomCheckTime: number;
    splitFileSize: number;
    logLevel: string;
    port: number;
  };
  pushConfig: {
    email: {
      enable: boolean;
      host: string;
      port: number;
      auth: {
        user: string;
        pass: string;
      };
      to: string;
    };
    wechat: {
      enable: boolean;
      sckey: string;
    };
    s3: {
      enable: boolean;
      endpoint: string;
      accessKeyId: string;
      secretAccessKey: string;
      region: string;
      bucket: string;
      prefix: string;
    };
  };
  personInfo: {
    nickname: string;
    token: string;
    mid: string;
    cookies: string;
  };
  streamerInfo: Streamer[];
}

// WebSocket消息类型
export interface WebSocketMessage<T> {
  type: string;
  data: T;
}