import { io, Socket } from 'socket.io-client';

// WebSocket命名空间
const NAMESPACES = {
  ROOMS: '/rooms',
  LOGS: '/logs',
  SYSTEM: '/system'
};

// WebSocket连接实例
let roomsSocket: Socket | null = null;
let logsSocket: Socket | null = null;
let systemSocket: Socket | null = null;

/**
 * 初始化房间状态WebSocket连接
 * @param callback 接收房间状态更新的回调函数
 * @returns 连接实例
 */
export const connectToRooms = (callback: (data: any) => void): Socket => {
  if (roomsSocket && roomsSocket.connected) {
    return roomsSocket;
  }

  roomsSocket = io(NAMESPACES.ROOMS);

  roomsSocket.on('connect', () => {
    console.log('Connected to rooms namespace');
  });

  roomsSocket.on('streamer_status_update', (data) => {
    callback(data);
  });

  roomsSocket.on('disconnect', () => {
    console.log('Disconnected from rooms namespace');
  });

  return roomsSocket;
};

/**
 * 订阅特定房间的状态更新
 * @param roomIds 房间ID列表
 */
export const subscribeToRooms = (roomIds: string[]): void => {
  if (roomsSocket && roomsSocket.connected) {
    roomsSocket.emit('subscribe', roomIds);
  }
};

/**
 * 取消订阅特定房间的状态更新
 * @param roomIds 房间ID列表
 */
export const unsubscribeFromRooms = (roomIds: string[]): void => {
  if (roomsSocket && roomsSocket.connected) {
    roomsSocket.emit('unsubscribe', roomIds);
  }
};

/**
 * 初始化日志WebSocket连接
 * @param callback 接收日志消息的回调函数
 * @returns 连接实例
 */
export const connectToLogs = (callback: (data: any) => void): Socket => {
  if (logsSocket && logsSocket.connected) {
    return logsSocket;
  }

  logsSocket = io(NAMESPACES.LOGS);

  logsSocket.on('connect', () => {
    console.log('Connected to logs namespace');
    logsSocket?.emit('subscribe');
  });

  logsSocket.on('log_message', (data) => {
    callback(data);
  });

  logsSocket.on('disconnect', () => {
    console.log('Disconnected from logs namespace');
  });

  return logsSocket;
};

/**
 * 初始化系统状态WebSocket连接
 * @param callback 接收系统状态更新的回调函数
 * @returns 连接实例
 */
export const connectToSystem = (callback: (data: any) => void): Socket => {
  if (systemSocket && systemSocket.connected) {
    return systemSocket;
  }

  systemSocket = io(NAMESPACES.SYSTEM);

  systemSocket.on('connect', () => {
    console.log('Connected to system namespace');
    systemSocket?.emit('subscribe');
  });

  systemSocket.on('system_status_update', (data) => {
    callback(data);
  });

  systemSocket.on('disconnect', () => {
    console.log('Disconnected from system namespace');
  });

  return systemSocket;
};

/**
 * 关闭所有WebSocket连接
 */
export const disconnectAll = (): void => {
  if (roomsSocket) {
    roomsSocket.disconnect();
    roomsSocket = null;
  }

  if (logsSocket) {
    logsSocket.disconnect();
    logsSocket = null;
  }

  if (systemSocket) {
    systemSocket.disconnect();
    systemSocket = null;
  }
};