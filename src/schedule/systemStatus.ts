import { getExtendedLogger } from '@/log';
import { io } from '@/http';
import { SystemStatusMessage } from '@/type/websocket';
import { Scheduler } from '@/type/scheduler';

const logger = getExtendedLogger('SystemStatus');

// 系统状态检查间隔（默认30秒）
const interval = 30 * 1000;

/**
 * 广播系统状态信息
 * 向所有订阅系统状态的客户端广播系统状态信息
 */
export const broadcastSystemStatus = () => {
    if (!io) return;
    
    const systemNamespace = io.of('/system');
    
    // 获取系统状态信息
    const statusMessage: SystemStatusMessage = {
        status: 'running',
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        timestamp: new Date().toISOString()
    };
    
    // 广播系统状态
    systemNamespace.emit('system_status_update', {
        type: 'system_status_update',
        data: statusMessage
    });
    logger.debug('系统状态已广播');
};

/**
 * 系统状态监控调度器
 * 定期检查并广播系统状态
 */
export default new Scheduler(interval, async function() {
    logger.debug(`开始检查系统状态，间隔 ${interval/1000}s`);
    broadcastSystemStatus();
});