import axios, { AxiosInstance, AxiosResponse } from 'axios'
import * as rax from 'retry-axios';
import * as express from 'express';
import { Request, Response, NextFunction } from 'express';
import * as http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import * as cors from 'cors';

import { getExtendedLogger } from "@/log";
import apiRoutes from './routes';
import { initWebSocketEvents } from './websocket';

const headers = {
    'Connection': 'keep-alive',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'User-Agent': '',
    'Accept-Encoding': 'gzip,deflate',
}
const logger = getExtendedLogger(`HTTP`)

const $axios: AxiosInstance & {
    [key: string]: any
} = axios.create({ headers, withCredentials: true })

$axios.defaults.raxConfig = {
    instance: $axios,
    retry: 5,
    retryDelay: 1000,
    httpMethodsToRetry: ['GET', 'HEAD', 'OPTIONS', 'DELETE', 'PUT', 'POST'],
    noResponseRetries: 5,
    onRetryAttempt: err => {
        const cfg = rax.getConfig(err);
        logger.warn(`Retry attempt #${cfg && cfg.currentRetryAttempt}`);
    }
}

rax.attach($axios)

for (const method of ['request', 'delete', 'get', 'head', 'options', 'post', 'put', 'patch']) {
    $axios['$' + method] = function () { return this[method].apply(this, arguments).then((res: AxiosResponse) => res && (res.data.resHeaders = res.headers) && res.data) }
}

// 创建Express应用
const app = express();

// 配置中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// 配置静态文件服务
app.use(express.static(process.cwd() + '/webui/build'));

// 创建HTTP服务器
const server = http.createServer(app);

// 创建WebSocket服务器
const io = new SocketIOServer(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

/**
 * 初始化HTTP和WebSocket服务器
 * @param port 服务器端口号
 * @returns 返回包含app, server和io的对象
 */
const initServer = (port: number = 3000) => {
    // 注册API路由 - 必须在通配符路由之前注册
app.use('/api', apiRoutes);
    
    // 设置基本路由 - 所有对根路径的访问都返回前端页面
    app.get('/', (req: Request, res: Response) => {
        res.sendFile(process.cwd() + '/webui/build/index.html', (err) => {
            if (err) {
                logger.error(`发送前端文件失败: ${err.message}`);
                res.status(500).send('服务器错误，无法加载前端页面');
            }
        });
    });

    // 添加通配符路由，确保SPA路由正常工作
    app.get('*', (req: Request, res: Response, next: NextFunction) => {
        // 如果是API请求，跳过此处理
        if (req.path.startsWith('/api/')) {
            return next();
        }
        res.sendFile(process.cwd() + '/webui/build/index.html', (err) => {
            if (err) {
                logger.error(`发送前端文件失败: ${err.message}`);
                res.status(500).send('服务器错误，无法加载前端页面');
            }
        });
    });

    // 启动服务器
    server.listen(port, () => {
        logger.info(`HTTP & WebSocket Server running on port ${port}`);
    });

    // 初始化WebSocket事件处理
    const wsNamespaces = initWebSocketEvents(io);
    
    // 主WebSocket连接处理
    io.on('connection', (socket) => {
        logger.info(`WebSocket client connected: ${socket.id}`);
        
        socket.on('disconnect', () => {
            logger.info(`WebSocket client disconnected: ${socket.id}`);
        });
    });

    return { app, server, io, wsNamespaces };
};

export {
    $axios,
    app,
    server,
    io,
    initServer
}
