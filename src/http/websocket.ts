import { Server as SocketIOServer, Socket } from 'socket.io';
import { getExtendedLogger } from '@/log';
import { RoomStatusMessage, LogMessage, SystemStatusMessage } from '@/type/websocket';
import { RoomStatus } from '@/engine/roomStatus';

const logger = getExtendedLogger('WebSocket');

/**
 * 初始化WebSocket事件处理
 * 设置各种WebSocket事件的处理函数
 * @param io SocketIO服务器实例
 */
export const initWebSocketEvents = (io: SocketIOServer) => {
    // 房间状态命名空间
    const roomNamespace = io.of('/rooms');
    
    roomNamespace.on('connection', (socket: Socket) => {
        logger.info(`Room namespace client connected: ${socket.id}`);
        
        // 订阅房间状态更新
        socket.on('subscribe', (roomIds: string[]) => {
            logger.info(`Client ${socket.id} subscribed to rooms: ${roomIds.join(', ')}`);
            
            // 将客户端加入到对应的房间
            roomIds.forEach(roomId => {
                socket.join(`room:${roomId}`);
            });
            
            // 发送当前状态
            sendRoomStatus(socket, roomIds);
        });
        
        // 取消订阅
        socket.on('unsubscribe', (roomIds: string[]) => {
            logger.info(`Client ${socket.id} unsubscribed from rooms: ${roomIds.join(', ')}`);
            
            roomIds.forEach(roomId => {
                socket.leave(`room:${roomId}`);
            });
        });
        
        socket.on('disconnect', () => {
            logger.info(`Room namespace client disconnected: ${socket.id}`);
        });
    });
    
    // 日志命名空间
    const logNamespace = io.of('/logs');
    
    logNamespace.on('connection', (socket: Socket) => {
        logger.info(`Log namespace client connected: ${socket.id}`);
        
        socket.on('subscribe', () => {
            socket.join('logs');
            logger.info(`Client ${socket.id} subscribed to logs`);
        });
        
        socket.on('unsubscribe', () => {
            socket.leave('logs');
            logger.info(`Client ${socket.id} unsubscribed from logs`);
        });
        
        socket.on('disconnect', () => {
            logger.info(`Log namespace client disconnected: ${socket.id}`);
        });
    });
    
    // 系统状态命名空间
    const systemNamespace = io.of('/system');
    
    systemNamespace.on('connection', (socket: Socket) => {
        logger.info(`System namespace client connected: ${socket.id}`);
        
        socket.on('subscribe', () => {
            socket.join('system');
            logger.info(`Client ${socket.id} subscribed to system status`);
            
            // 发送当前系统状态
            socket.emit('status_update', {
                status: 'running',
                uptime: process.uptime(),
                memoryUsage: process.memoryUsage(),
                timestamp: new Date().toISOString()
            });
        });
        
        socket.on('unsubscribe', () => {
            socket.leave('system');
            logger.info(`Client ${socket.id} unsubscribed from system status`);
        });
        
        socket.on('disconnect', () => {
            logger.info(`System namespace client disconnected: ${socket.id}`);
        });
    });
    
    return { roomNamespace, logNamespace, systemNamespace };
};

/**
 * 发送房间状态更新
 * 向订阅的客户端发送房间状态信息
 * @param socket 客户端Socket连接
 * @param roomIds 房间ID列表
 */
const sendRoomStatus = (socket: Socket, roomIds: string[]) => {
    // 从实际的房间状态管理模块获取状态
    const statusUpdates = roomIds.map(roomId => {
        const status = RoomStatus.get(roomId) || 0;
        return {
            roomId,
            status: status === 1 ? 'online' : 'offline',
            statusCode: status,
            updateTime: new Date().toISOString()
        };
    });
    
    socket.emit('status_update', statusUpdates);
};

/**
 * 广播房间状态更新
 * 当房间状态发生变化时，向所有订阅该房间的客户端广播状态更新
 * @param io SocketIO服务器实例
 * @param roomId 房间ID
 * @param status 房间状态
 */
export const broadcastRoomStatus = (io: SocketIOServer, roomId: string, status: Partial<RoomStatusMessage>) => {
    const roomNamespace = io.of('/rooms');
    roomNamespace.to(`room:${roomId}`).emit('streamer_status_update', {
        type: 'streamer_status_update',
        data: {
            name: roomId,
            status: status.status?.toUpperCase(),
            statusCode: status.statusCode,
            updateTime: status.updateTime || new Date().toISOString()
        }
    });
};

/**
 * 广播日志消息
 * 向所有订阅日志的客户端广播日志消息
 * @param io SocketIO服务器实例
 * @param logData 日志数据
 */
export const broadcastLog = (io: SocketIOServer, logData: Partial<LogMessage>) => {
    const logNamespace = io.of('/logs');
    logNamespace.to('logs').emit('log_message', {
        type: 'log_message',
        data: {
            ...logData,
            timestamp: logData.timestamp || new Date().toISOString()
        }
    });
};