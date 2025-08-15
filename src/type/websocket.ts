/**
 * WebSocket消息类型定义
 */

// 房间状态消息
export interface RoomStatusMessage {
    roomId: string;
    status: 'online' | 'offline';
    statusCode: 0 | 1;
    updateTime: string;
}

// 日志消息
export interface LogMessage {
    level: string;
    message: string;
    timestamp: string;
}

// 系统状态消息
export interface SystemStatusMessage {
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