import * as express from 'express';
import { Request, Response } from 'express';
import * as fs from 'fs';
import { join } from 'path';
import { getExtendedLogger } from '@/log';
import { FileStatus } from '@/type/fileStatus';
import { FileHound } from '@/util/utils';
import * as os from 'os';

const logger = getExtendedLogger('API');
const router = express.Router();
const CONFIG_PATH = './templates/info.json';

// ===== 配置管理 API =====

/**
 * 获取完整配置信息
 * 读取并返回整个 info.json 的内容
 */
router.get('/config', (req: Request, res: Response) => {
    logger.info('API: 获取完整配置信息');
    try {
        if (!fs.existsSync(CONFIG_PATH)) {
            return res.status(404).json({ error: '配置文件不存在' });
        }
        const configData = fs.readFileSync(CONFIG_PATH, 'utf8');
        const config = JSON.parse(configData);
        res.json(config);
    } catch (error) {
        logger.error(`获取配置信息失败: ${error}`);
        res.status(500).json({ error: '获取配置信息失败' });
    }
});

/**
 * 更新完整配置信息
 * 接收 JSON 数据，并用它来完整更新 info.json
 */
router.put('/config', (req: Request, res: Response) => {
    logger.info('API: 更新完整配置信息');
    try {
        const newConfig = req.body;
        if (!newConfig) {
            return res.status(400).json({ error: '请求体不能为空' });
        }
        
        // 验证配置结构
        if (!newConfig.StreamerHelper || !newConfig.personInfo || !Array.isArray(newConfig.streamerInfo)) {
            return res.status(400).json({ error: '配置格式不正确' });
        }
        
        // 写入配置文件
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(newConfig, null, 2), 'utf8');
        
        // 更新全局配置
        global.config = newConfig;
        
        res.json({ success: true, message: '配置已更新' });
    } catch (error) {
        logger.error(`更新配置信息失败: ${error}`);
        res.status(500).json({ error: '更新配置信息失败' });
    }
});

/**
 * 获取主播列表配置
 * 只返回主播列表部分
 */
router.get('/config/streamers', (req: Request, res: Response) => {
    logger.info('API: 获取主播列表配置');
    try {
        const streamers = global.config.streamerInfo || [];
        res.json({
            total: streamers.length,
            data: streamers
        });
    } catch (error) {
        logger.error(`获取主播列表配置失败: ${error}`);
        res.status(500).json({ error: '获取主播列表配置失败' });
    }
});

// ===== 主播管理 API =====

/**
 * 获取所有主播信息
 * 返回系统中配置的所有主播信息
 */
router.get('/streamers', (req: Request, res: Response) => {
    logger.info('API: 获取主播列表');
    const streamers = global.config.streamerInfo || [];
    res.json({
        total: streamers.length,
        data: streamers
    });
});

/**
 * 添加新主播
 * 在 info.json 的 streamerInfo 数组中添加一个新主播
 */
router.post('/streamers', (req: Request, res: Response) => {
    logger.info('API: 添加新主播');
    try {
        const newStreamer = req.body;
        if (!newStreamer || !newStreamer.name || !newStreamer.roomUrl) {
            return res.status(400).json({ error: '主播信息不完整，必须包含name和roomUrl字段' });
        }
        
        // 检查主播是否已存在
        const streamers = global.config.streamerInfo || [];
        if (streamers.some(s => s.name === newStreamer.name)) {
            return res.status(409).json({ error: '主播已存在' });
        }
        
        // 添加默认值
        const streamerWithDefaults = {
            uploadLocalFile: true,
            deleteLocalFile: false,
            templateTitle: "{{name}}{{time}} 直播",
            delayTime: 2,
            desc: "",
            source: "",
            dynamic: "",
            copyright: 2,
            tid: 171,
            tags: ["直播", "录播"],
            ...newStreamer
        };
        
        // 更新全局配置
        global.config.streamerInfo.push(streamerWithDefaults);
        
        // 写入配置文件
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(global.config, null, 2), 'utf8');
        
        res.status(201).json({
            success: true,
            message: '主播添加成功',
            data: streamerWithDefaults
        });
    } catch (error) {
        logger.error(`添加主播失败: ${error}`);
        res.status(500).json({ error: '添加主播失败' });
    }
});

/**
 * 更新主播信息
 * 根据主播的唯一标识（如 name），更新其信息
 */
router.put('/streamers/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    logger.info(`API: 更新主播信息 - ${id}`);
    
    try {
        const updatedStreamer = req.body;
        if (!updatedStreamer) {
            return res.status(400).json({ error: '请求体不能为空' });
        }
        
        // 查找主播
        const streamers = global.config.streamerInfo || [];
        const index = streamers.findIndex(s => s.name === id);
        
        if (index === -1) {
            return res.status(404).json({ error: '未找到该主播' });
        }
        
        // 更新主播信息，保留原有字段
        const updatedStreamerInfo = {
            ...streamers[index],
            ...updatedStreamer,
            name: id // 确保name不变
        };
        
        // 更新全局配置
        global.config.streamerInfo[index] = updatedStreamerInfo;
        
        // 写入配置文件
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(global.config, null, 2), 'utf8');
        
        res.json({
            success: true,
            message: '主播信息已更新',
            data: updatedStreamerInfo
        });
    } catch (error) {
        logger.error(`更新主播信息失败: ${error}`);
        res.status(500).json({ error: '更新主播信息失败' });
    }
});

/**
 * 删除主播
 * 从 streamerInfo 数组中删除一个主播
 */
router.delete('/streamers/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    logger.info(`API: 删除主播 - ${id}`);
    
    try {
        // 查找主播
        const streamers = global.config.streamerInfo || [];
        const index = streamers.findIndex(s => s.name === id);
        
        if (index === -1) {
            return res.status(404).json({ error: '未找到该主播' });
        }
        
        // 删除主播
        const deletedStreamer = streamers[index];
        global.config.streamerInfo.splice(index, 1);
        
        // 写入配置文件
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(global.config, null, 2), 'utf8');
        
        res.json({
            success: true,
            message: '主播已删除',
            data: deletedStreamer
        });
    } catch (error) {
        logger.error(`删除主播失败: ${error}`);
        res.status(500).json({ error: '删除主播失败' });
    }
});

/**
 * 获取特定主播配置信息
 * 根据主播名称返回特定主播的配置信息
 */
router.get('/streamers/:name', (req: Request, res: Response) => {
    const { name } = req.params;
    logger.info(`API: 获取主播信息 - ${name}`);
    
    const streamers = global.config.streamerInfo || [];
    const streamer = streamers.find(s => s.name === name);
    
    if (!streamer) {
        return res.status(404).json({ error: '未找到该主播' });
    }
    
    res.json(streamer);
});

// ===== 录制文件管理 API =====

/**
 * 获取录制文件列表
 * 扫描录制目录，返回文件列表及其详细信息
 */
router.get('/files', async (req: Request, res: Response) => {
    logger.info('API: 获取录制文件列表');
    
    try {
        // 查找所有fileStatus.json文件
        const files: string[] = await FileHound.create()
            .paths(join(process.cwd(), "/download"))
            .match('fileStatus.json')
            .ext('json')
            .find();
        
        if (!files || files.length === 0) {
            return res.json({
                total: 0,
                data: []
            });
        }
        
        // 收集所有录制信息
        const recordingsInfo = [];
        
        for (const file of files) {
            try {
                const text = fs.readFileSync(file, 'utf8');
                const fileStatus: FileStatus = JSON.parse(text);
                const dirPath = fileStatus.path;
                
                if (!dirPath) continue;
                
                // 获取目录中的视频文件
                const videoFiles = fs.existsSync(dirPath) ? 
                    fs.readdirSync(dirPath)
                        .filter(f => f.endsWith('.mp4') || f.endsWith('.flv'))
                        .map(f => {
                            const filePath = join(dirPath, f);
                            const stats = fs.statSync(filePath);
                            return {
                                name: f,
                                path: filePath,
                                size: stats.size,
                                created: stats.birthtime,
                                modified: stats.mtime
                            };
                        }) : [];
                
                recordingsInfo.push({
                    ...fileStatus,
                    files: videoFiles,
                    fileCount: videoFiles.length,
                    totalSize: videoFiles.reduce((sum, file) => sum + file.size, 0)
                });
            } catch (error) {
                logger.error(`处理文件 ${file} 时出错: ${error}`);
                // 继续处理下一个文件
            }
        }
        
        res.json({
            total: recordingsInfo.length,
            data: recordingsInfo
        });
    } catch (error) {
        logger.error(`获取录制文件列表失败: ${error}`);
        res.status(500).json({ error: '获取录制文件列表失败' });
    }
});

/**
 * 删除录制文件
 * 根据提供的文件路径，删除指定的录制文件
 */
router.delete('/files', (req: Request, res: Response) => {
    const { path } = req.query;
    logger.info(`API: 删除录制文件 - ${path}`);
    
    if (!path) {
        return res.status(400).json({ error: '缺少文件路径参数' });
    }
    
    try {
        const filePath = path as string;
        
        // 检查文件是否存在
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: '文件不存在' });
        }
        
        // 删除文件
        fs.unlinkSync(filePath);
        
        res.json({
            success: true,
            message: '文件已删除',
            path: filePath
        });
    } catch (error) {
        logger.error(`删除文件失败: ${error}`);
        res.status(500).json({ error: '删除文件失败' });
    }
});

// ===== 系统状态 API =====

/**
 * 获取系统状态信息
 * 返回系统运行状态、版本等基本信息
 */
router.get('/status/system', (req: Request, res: Response) => {
    logger.info('API: 获取系统状态');
    
    try {
        // 获取内存信息
        const memoryUsage = process.memoryUsage();
        const freeMemory = os.freemem();
        const totalMemory = os.totalmem();
        
        // 获取磁盘信息 (仅获取当前目录所在磁盘)
        const downloadDir = join(process.cwd(), 'download');
        let diskInfo = { free: 0, total: 0, used: 0 };
        
        // 获取系统信息
        const systemInfo = {
            platform: os.platform(),
            arch: os.arch(),
            cpus: os.cpus().length,
            hostname: os.hostname(),
            uptime: os.uptime()
        };
        
        // 获取进程信息
        const processInfo = {
            pid: process.pid,
            uptime: process.uptime(),
            version: process.version,
            versions: process.versions
        };
        
        // 获取StreamerHelper特定信息
        const appInfo = {
            version: process.env.npm_package_version || '1.0.0',
            recorderCount: global.app.recorderPool.size,
            streamerCount: (global.config.streamerInfo || []).length
        };
        
        res.json({
            status: 'running',
            timestamp: new Date().toISOString(),
            memory: {
                free: freeMemory,
                total: totalMemory,
                used: totalMemory - freeMemory,
                process: {
                    rss: memoryUsage.rss,
                    heapTotal: memoryUsage.heapTotal,
                    heapUsed: memoryUsage.heapUsed,
                    external: memoryUsage.external
                }
            },
            disk: diskInfo,
            system: systemInfo,
            process: processInfo,
            app: appInfo
        });
    } catch (error) {
        logger.error(`获取系统状态失败: ${error}`);
        res.status(500).json({ error: '获取系统状态失败' });
    }
});

export default router;