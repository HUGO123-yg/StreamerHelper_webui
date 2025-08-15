import { getExtendedLogger } from "@/log";
import { io } from "@/http";
import { broadcastRoomStatus } from "@/http/websocket";

const logger = getExtendedLogger('RoomStatus');

// 0 不在线 1 在线
export const RoomStatus = new Map<string,0|1>();

/**
 * 更新房间状态并广播状态变化
 * @param roomId 房间ID
 * @param status 房间状态：0-不在线，1-在线
 */
export const updateRoomStatus = (roomId: string, status: 0|1) => {
    const oldStatus = RoomStatus.get(roomId);
    
    // 更新状态
    RoomStatus.set(roomId, status);
    
    // 如果状态发生变化，记录日志并广播
    if (oldStatus !== status) {
        const statusText = status === 1 ? '在线' : '不在线';
        logger.info(`房间 ${roomId} 状态变为: ${statusText}`);
        
        // 广播状态变化
        broadcastRoomStatusChange(roomId, status);
    }
    
    return status;
};

/**
 * 广播房间状态变化
 * @param roomId 房间ID
 * @param status 房间状态
 */
const broadcastRoomStatusChange = (roomId: string, status: 0|1) => {
    if (io) {
        broadcastRoomStatus(io, roomId, {
            status: status === 1 ? 'online' : 'offline',
            statusCode: status,
            updateTime: new Date().toISOString()
        });
    }
};